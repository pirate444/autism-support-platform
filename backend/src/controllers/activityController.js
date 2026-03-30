const Activity = require('../models/Activity');
const User = require('../models/User');

// Create a new activity/game
exports.createActivity = async (req, res) => {
  try {
    const { title, description, type, category, fileUrl } = req.body;
    if (!title || !description || !type) {
      return res.status(400).json({ message: 'Title, description, and type are required.' });
    }
    
    // Only allow specialist_educator (trainers) to create activities/games
    if (req.user.role !== 'specialist_educator') {
      return res.status(403).json({ message: 'Only trainers can create activities and games.' });
    }
    
    const activity = new Activity({
      title,
      description,
      type,
      category,
      fileUrl,
      createdBy: req.user.userId
    });
    await activity.save();
    res.status(201).json(activity);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// List/browse activities/games (with pagination)
exports.listActivities = async (req, res) => {
  try {
    const { type, category, title, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (title) filter.title = { $regex: title, $options: 'i' };

    const activities = await Activity.find(filter)
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Activity.countDocuments(filter);

    res.json({
      activities,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};