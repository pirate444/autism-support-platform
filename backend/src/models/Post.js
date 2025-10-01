const mongoose = require('mongoose');

const postCategories = [
  'news_articles',
  'expert_advice',
  'research_updates',
  'success_stories',
  'event_announcements',
  'educational_content'
];

const postSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 200
  },
  content: { 
    type: String, 
    required: true,
    maxlength: 5000
  },
  category: { 
    type: String, 
    enum: postCategories, 
    required: true 
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  media: [{
    type: { type: String, enum: ['image', 'video'], required: true },
    url: { type: String, required: true },
    alt: { type: String }, // For accessibility
    caption: { type: String }
  }],
  tags: [{ 
    type: String, 
    trim: true,
    lowercase: true
  }],
  likes: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    likedAt: { type: Date, default: Date.now }
  }],
  isPublished: { 
    type: Boolean, 
    default: true 
  },
  viewCount: { 
    type: Number, 
    default: 0 
  },
  featured: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true 
});

// Indexes for better performance
postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ isPublished: 1, createdAt: -1 });

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Method to check if user liked the post
postSchema.methods.isLikedBy = function(userId) {
  return this.likes.some(like => like.user.toString() === userId.toString());
};

// Method to toggle like
postSchema.methods.toggleLike = function(userId) {
  const existingLikeIndex = this.likes.findIndex(like => like.user.toString() === userId.toString());
  
  if (existingLikeIndex > -1) {
    this.likes.splice(existingLikeIndex, 1);
    return false; // Unliked
  } else {
    this.likes.push({ user: userId });
    return true; // Liked
  }
};

module.exports = mongoose.model('Post', postSchema);



