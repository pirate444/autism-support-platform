const User = require('../models/User');

// Get available languages
exports.getAvailableLanguages = async (req, res) => {
  try {
    const languages = [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
      { code: 'fr', name: 'French', nativeName: 'Français' },
      { code: 'es', name: 'Spanish', nativeName: 'Español' }
    ];
    
    res.json(languages);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Update user language preference
exports.updateLanguage = async (req, res) => {
  try {
    const { language } = req.body;
    const userId = req.user.userId;
    
    if (!language) {
      return res.status(400).json({ message: 'Language is required.' });
    }
    
    // Validate language code
    const validLanguages = ['en', 'ar', 'fr', 'es'];
    if (!validLanguages.includes(language)) {
      return res.status(400).json({ message: 'Invalid language code.' });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { language },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    res.json({
      message: 'Language updated successfully.',
      user: updatedUser
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Get user's current language preference
exports.getUserLanguage = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId).select('language');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    res.json({ language: user.language });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
}; 