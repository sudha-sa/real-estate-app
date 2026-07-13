const Property = require('../models/Property');
const SavedProperty = require('../models/SavedProperty');

// @desc    Get all properties with filters
// @route   GET /api/properties
const getProperties = async (req, res) => {
  try {
    const {
      city, area, type, bhk, status, minPrice, maxPrice,
      amenities, isVerified, isFeatured, sort, page = 1, limit = 10, search
    } = req.query;

    const query = {};

    if (city) query['location.city'] = { $regex: city, $options: 'i' };
    if (area) query['location.area'] = { $regex: area, $options: 'i' };
    if (type) query.type = { $in: type.split(',') };
    if (bhk) query.bhk = { $in: bhk.split(',').map(Number) };
    if (status) query.status = { $in: status.split(',') };
    if (isVerified === 'true') query.isVerified = true;
    if (isFeatured === 'true') query.isFeatured = true;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (amenities) {
      query.amenities = { $all: amenities.split(',') };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.area': { $regex: search, $options: 'i' } },
        { 'builder.name': { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'popular') sortOption = { viewCount: -1 };
    else if (sort === 'rating') sortOption = { rating: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Property.countDocuments(query);
    const properties = await Property.find(query).sort(sortOption).skip(skip).limit(Number(limit));

    // If user is logged in, add isSaved flag
    let savedIds = [];
    if (req.user) {
      const saved = await SavedProperty.find({ userId: req.user._id });
      savedIds = saved.map((s) => s.propertyId.toString());
    }

    const propertiesWithSaved = properties.map((p) => ({
      ...p.toObject(),
      isSaved: savedIds.includes(p._id.toString()),
    }));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      properties: propertiesWithSaved,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get featured properties
// @route   GET /api/properties/featured
const getFeaturedProperties = async (req, res) => {
  try {
    const properties = await Property.find({ isFeatured: true }).limit(8).sort({ rating: -1 });

    let savedIds = [];
    if (req.user) {
      const saved = await SavedProperty.find({ userId: req.user._id });
      savedIds = saved.map((s) => s.propertyId.toString());
    }

    const result = properties.map((p) => ({
      ...p.toObject(),
      isSaved: savedIds.includes(p._id.toString()),
    }));

    res.json({ success: true, properties: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Increment view count
    await Property.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });

    let isSaved = false;
    if (req.user) {
      const saved = await SavedProperty.findOne({ userId: req.user._id, propertyId: property._id });
      isSaved = !!saved;
    }

    res.json({ success: true, property: { ...property.toObject(), isSaved } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save a property
// @route   POST /api/properties/:id/save
const saveProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const existing = await SavedProperty.findOne({ userId: req.user._id, propertyId: req.params.id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Property already saved' });
    }

    await SavedProperty.create({ userId: req.user._id, propertyId: req.params.id });
    res.json({ success: true, message: 'Property saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Unsave a property
// @route   DELETE /api/properties/:id/save
const unsaveProperty = async (req, res) => {
  try {
    const result = await SavedProperty.findOneAndDelete({ userId: req.user._id, propertyId: req.params.id });
    if (!result) {
      return res.status(404).json({ success: false, message: 'Saved property not found' });
    }
    res.json({ success: true, message: 'Property removed from saved' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's saved properties
// @route   GET /api/properties/saved
const getSavedProperties = async (req, res) => {
  try {
    const { sort, city, type, minPrice, maxPrice } = req.query;

    const savedDocs = await SavedProperty.find({ userId: req.user._id }).populate('propertyId');

    let properties = savedDocs
      .filter((s) => s.propertyId)
      .map((s) => ({ ...s.propertyId.toObject(), isSaved: true, savedAt: s.createdAt }));

    // Filter
    if (city) properties = properties.filter((p) => p.location.city.toLowerCase().includes(city.toLowerCase()));
    if (type) properties = properties.filter((p) => type.split(',').includes(p.type));
    if (minPrice) properties = properties.filter((p) => p.price >= Number(minPrice));
    if (maxPrice) properties = properties.filter((p) => p.price <= Number(maxPrice));

    // Sort
    if (sort === 'price_asc') properties.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') properties.sort((a, b) => b.price - a.price);
    else if (sort === 'name_az') properties.sort((a, b) => a.title.localeCompare(b.title));
    else properties.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

    res.json({ success: true, total: properties.length, properties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProperties, getFeaturedProperties, getPropertyById, saveProperty, unsaveProperty, getSavedProperties };
