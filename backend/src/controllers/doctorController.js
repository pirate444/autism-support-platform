const User = require('../models/User');

const doctorRoles = [
  'child_psychiatrist',
  'occupational_therapist',
  'psychologist',
  'speech_therapist'
];

// List/search doctors
exports.listDoctors = async (req, res) => {
  try {
    const { specialization, name } = req.query;
    const filter = { role: { $in: doctorRoles } };
    if (specialization) {
      filter.specialization = specialization;
    }
    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }
    const doctors = await User.find(filter).select('-password');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
}; 