const SiteVisit = require('../models/SiteVisit');
const Notification = require('../models/Notification');

// @desc    Book site visit
// @route   POST /api/visits
const bookVisit = async (req, res) => {
  try {
    const { propertyId, date, timeSlot, visitorName, visitorPhone, visitorEmail, notes } = req.body;

    if (!propertyId || !date || !timeSlot || !visitorName || !visitorPhone || !visitorEmail) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }

    const visit = await SiteVisit.create({
      userId: req.user._id,
      propertyId,
      date: new Date(date),
      timeSlot,
      visitorName,
      visitorPhone,
      visitorEmail,
      notes,
    });

    // Create notification
    await Notification.create({
      userId: req.user._id,
      type: 'visit_reminder',
      title: 'Site Visit Booked!',
      message: `Your site visit is scheduled for ${new Date(date).toDateString()} at ${timeSlot}`,
      propertyId,
    });

    const populated = await SiteVisit.findById(visit._id).populate('propertyId', 'title images location price');

    res.status(201).json({ success: true, message: 'Site visit booked successfully', visit: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user visits
// @route   GET /api/visits
const getVisits = async (req, res) => {
  try {
    const { status } = req.query;

    const query = { userId: req.user._id };
    if (status) query.status = status;

    const visits = await SiteVisit.find(query)
      .populate('propertyId', 'title images location price builder')
      .sort({ date: 1 });

    const now = new Date();
    // Auto-mark past visits
    const upcoming = visits.filter((v) => v.status === 'upcoming' && new Date(v.date) >= now);
    const past = visits.filter((v) => v.status === 'completed' || (v.status === 'upcoming' && new Date(v.date) < now));

    res.json({ success: true, upcoming, past, total: visits.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reschedule visit
// @route   PUT /api/visits/:id/reschedule
const rescheduleVisit = async (req, res) => {
  try {
    const { date, timeSlot } = req.body;

    const visit = await SiteVisit.findOne({ _id: req.params.id, userId: req.user._id });
    if (!visit) {
      return res.status(404).json({ success: false, message: 'Visit not found' });
    }

    visit.date = new Date(date);
    visit.timeSlot = timeSlot;
    await visit.save();

    res.json({ success: true, message: 'Visit rescheduled successfully', visit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel visit
// @route   DELETE /api/visits/:id
const cancelVisit = async (req, res) => {
  try {
    const visit = await SiteVisit.findOne({ _id: req.params.id, userId: req.user._id });
    if (!visit) {
      return res.status(404).json({ success: false, message: 'Visit not found' });
    }

    visit.status = 'cancelled';
    await visit.save();

    res.json({ success: true, message: 'Visit cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { bookVisit, getVisits, rescheduleVisit, cancelVisit };
