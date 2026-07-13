const Property = require('../models/Property');

// AI Mock Engine - Rule-based property matching
// Parses natural language queries and maps to property filters

const parseQuery = (query) => {
  const q = query.toLowerCase();
  const filters = {};

  // BHK detection
  if (q.includes('1 bhk') || q.includes('1bhk')) filters.bhk = [1];
  else if (q.includes('2 bhk') || q.includes('2bhk')) filters.bhk = [2];
  else if (q.includes('3 bhk') || q.includes('3bhk')) filters.bhk = [3];
  else if (q.includes('4 bhk') || q.includes('4bhk')) filters.bhk = [4];
  else if (q.includes('villa')) filters.type = ['Villa'];
  else if (q.includes('studio')) filters.type = ['Studio'];
  else if (q.includes('penthouse')) filters.type = ['Penthouse'];

  // City detection
  const cities = ['mumbai', 'bangalore', 'bengaluru', 'pune', 'delhi', 'hyderabad', 'chennai', 'noida', 'gurgaon'];
  for (const city of cities) {
    if (q.includes(city)) {
      filters.city = city === 'bengaluru' ? 'Bangalore' : city.charAt(0).toUpperCase() + city.slice(1);
      break;
    }
  }

  // Budget detection (in Lakhs)
  const underMatch = q.match(/under\s+(\d+)\s*(lakh|lakhs|l|cr|crore)/i);
  const budgetMatch = q.match(/(\d+)\s*(?:-|to)\s*(\d+)\s*(lakh|lakhs|l|cr|crore)/i);

  if (underMatch) {
    let val = parseInt(underMatch[1]);
    if (underMatch[2].toLowerCase().startsWith('cr')) val *= 100;
    filters.maxPrice = val;
  } else if (budgetMatch) {
    let min = parseInt(budgetMatch[1]);
    let max = parseInt(budgetMatch[2]);
    if (budgetMatch[3].toLowerCase().startsWith('cr')) {
      min *= 100;
      max *= 100;
    }
    filters.minPrice = min;
    filters.maxPrice = max;
  }

  // Status detection
  if (q.includes('ready to move') || q.includes('ready')) filters.status = ['Ready to Move'];
  else if (q.includes('under construction') || q.includes('ongoing')) filters.status = ['Under Construction'];
  else if (q.includes('new launch')) filters.status = ['New Launch'];

  // Luxury detection
  if (q.includes('luxury') || q.includes('premium')) filters.minPrice = 100;

  // Amenities detection
  const amenitiesMap = {
    pool: 'Swimming Pool', gym: 'Gym', parking: 'Parking',
    garden: 'Garden', security: '24/7 Security', elevator: 'Elevator',
    playground: 'Children\'s Playground', club: 'Clubhouse',
  };
  filters.amenities = [];
  for (const [key, value] of Object.entries(amenitiesMap)) {
    if (q.includes(key)) filters.amenities.push(value);
  }
  if (filters.amenities.length === 0) delete filters.amenities;

  return filters;
};

const buildMongoQuery = (filters) => {
  const query = {};
  if (filters.bhk) query.bhk = { $in: filters.bhk };
  if (filters.type) query.type = { $in: filters.type };
  if (filters.city) query['location.city'] = { $regex: filters.city, $options: 'i' };
  if (filters.status) query.status = { $in: filters.status };
  if (filters.minPrice || filters.maxPrice) {
    query.price = {};
    if (filters.minPrice) query.price.$gte = filters.minPrice;
    if (filters.maxPrice) query.price.$lte = filters.maxPrice;
  }
  if (filters.amenities) query.amenities = { $all: filters.amenities };
  return query;
};

const generateAIResponse = (query, count, filters) => {
  const parts = [];

  if (filters.bhk) parts.push(`${filters.bhk[0]} BHK`);
  if (filters.type) parts.push(filters.type[0]);
  if (filters.city) parts.push(`in ${filters.city}`);
  if (filters.maxPrice) parts.push(`under ₹${filters.maxPrice} Lakhs`);
  if (filters.minPrice && filters.maxPrice) parts.push(`between ₹${filters.minPrice}L - ₹${filters.maxPrice}L`);
  if (filters.status) parts.push(filters.status[0]);

  if (count === 0) {
    return `I couldn't find properties matching your criteria. Try adjusting your budget or location!`;
  }

  const desc = parts.length > 0 ? parts.join(', ') : 'your criteria';
  return `Great news! I found ${count} properties matching ${desc}. Here are the best picks for you! 🏠`;
};

// @desc    AI Chat - process text query
// @route   POST /api/ai/chat
const aiChat = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Please provide a search query' });
    }

    const filters = parseQuery(query);
    const mongoQuery = buildMongoQuery(filters);

    // If no filters found, do a general text search
    let properties;
    if (Object.keys(mongoQuery).length === 0) {
      properties = await Property.find({ isVerified: true }).sort({ rating: -1 }).limit(6);
    } else {
      properties = await Property.find(mongoQuery).sort({ rating: -1 }).limit(8);
    }

    const responseMessage = generateAIResponse(query, properties.length, filters);

    const suggestions = [
      { id: '1', text: 'Luxury properties in Mumbai', icon: '✨' },
      { id: '2', text: '3 BHK under 80 Lakhs in Bangalore', icon: '🏠' },
      { id: '3', text: 'Ready to move apartments in Pune', icon: '🔑' },
      { id: '4', text: 'Under construction villas', icon: '🏗️' },
      { id: '5', text: 'Properties with swimming pool', icon: '🏊' },
    ];

    res.json({
      success: true,
      message: responseMessage,
      properties,
      filters,
      suggestions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    AI Questionnaire - process answers and return recommendations
// @route   POST /api/ai/questionnaire
const aiQuestionnaire = async (req, res) => {
  try {
    const { answers } = req.body;
    // answers: { budget, propertyType, location, amenities, timeline }

    const query = {};

    if (answers.budget) {
      const budgetMap = {
        'Under 50L': { max: 50 },
        '50L - 80L': { min: 50, max: 80 },
        '80L - 1.5Cr': { min: 80, max: 150 },
        '1.5Cr - 3Cr': { min: 150, max: 300 },
        'Above 3Cr': { min: 300 },
      };
      const range = budgetMap[answers.budget];
      if (range) {
        query.price = {};
        if (range.min) query.price.$gte = range.min;
        if (range.max) query.price.$lte = range.max;
      }
    }

    if (answers.propertyType && answers.propertyType !== 'Any') {
      if (['2 BHK', '3 BHK', '4 BHK', '1 BHK'].includes(answers.propertyType)) {
        query.bhk = parseInt(answers.propertyType);
      } else {
        query.type = answers.propertyType;
      }
    }

    if (answers.location && answers.location !== 'Any City') {
      query['location.city'] = { $regex: answers.location, $options: 'i' };
    }

    if (answers.timeline) {
      const timelineMap = {
        'Immediately': 'Ready to Move',
        'Within 1 year': 'Ready to Move',
        '1-2 years': 'Under Construction',
        '2+ years': 'Under Construction',
      };
      if (timelineMap[answers.timeline]) {
        query.status = timelineMap[answers.timeline];
      }
    }

    const properties = await Property.find(query).sort({ rating: -1, isVerified: -1 }).limit(8);

    let aiMessage = `Based on your preferences, I've found ${properties.length} perfect properties for you! `;
    if (answers.budget) aiMessage += `Budget: ${answers.budget}. `;
    if (answers.location && answers.location !== 'Any City') aiMessage += `Location: ${answers.location}. `;
    aiMessage += "Here are my top recommendations! 🎯";

    res.json({
      success: true,
      message: aiMessage,
      properties,
      appliedFilters: answers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get smart suggestions
// @route   GET /api/ai/suggestions
const getSmartSuggestions = async (req, res) => {
  try {
    const suggestions = [
      { id: '1', text: 'Luxury properties in Mumbai', icon: '✨', query: 'luxury properties in mumbai' },
      { id: '2', text: '3 BHK in Bangalore under 80L', icon: '🏠', query: '3 bhk under 80 lakhs in bangalore' },
      { id: '3', text: 'Ready to move apartments', icon: '🔑', query: 'ready to move apartments' },
      { id: '4', text: 'Under construction projects', icon: '🏗️', query: 'under construction' },
      { id: '5', text: 'Properties with swimming pool', icon: '🏊', query: 'pool amenities' },
      { id: '6', text: 'Villas in Hyderabad', icon: '🏡', query: 'villas in hyderabad' },
    ];

    res.json({ success: true, suggestions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Questionnaire questions
const getQuestionnaire = async (req, res) => {
  const questions = [
    {
      id: 1,
      question: "What's your budget range?",
      options: ['Under 50L', '50L - 80L', '80L - 1.5Cr', '1.5Cr - 3Cr', 'Above 3Cr'],
      key: 'budget',
    },
    {
      id: 2,
      question: 'What type of property are you looking for?',
      options: ['1 BHK', '2 BHK', '3 BHK', '4 BHK', 'Villa', 'Studio', 'Any'],
      key: 'propertyType',
    },
    {
      id: 3,
      question: 'Which city do you prefer?',
      options: ['Mumbai', 'Bangalore', 'Pune', 'Delhi', 'Hyderabad', 'Any City'],
      key: 'location',
    },
    {
      id: 4,
      question: 'What amenities are most important to you?',
      options: ['Swimming Pool', 'Gym', 'Parking', 'Garden', 'Clubhouse', 'Security'],
      key: 'amenities',
      multiSelect: true,
    },
    {
      id: 5,
      question: "What's your timeline for purchase?",
      options: ['Immediately', 'Within 1 year', '1-2 years', '2+ years'],
      key: 'timeline',
    },
  ];

  res.json({ success: true, questions });
};

module.exports = { aiChat, aiQuestionnaire, getSmartSuggestions, getQuestionnaire };
