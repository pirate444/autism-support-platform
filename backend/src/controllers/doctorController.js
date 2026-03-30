const User = require('../models/User');

const doctorRoles = [
  'child_psychiatrist',
  'occupational_therapist',
  'psychologist',
  'speech_therapist'
];

// List/search doctors with pagination
exports.listDoctors = async (req, res) => {
  try {
    const { specialization, name, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const filter = { role: { $in: doctorRoles } };
    
    if (specialization) {
      filter.specialization = specialization;
    }
    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }
    
    const doctors = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      doctors,
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