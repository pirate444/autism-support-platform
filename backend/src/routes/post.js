const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  getCategories,
  getFeaturedPosts,
  getNewPostsCount
} = require('../controllers/postController');
const auth = require('../middleware/authMiddleware');

// Public routes (no authentication required)
router.get('/', getPosts); // Get all published posts
router.get('/categories', getCategories); // Get available categories
router.get('/featured', getFeaturedPosts); // Get featured posts
router.get('/new-count', getNewPostsCount); // Get new posts count
router.get('/:id', getPostById); // Get single post

// Protected routes (authentication required)
router.post('/', auth, createPost); // Create new post
router.put('/:id', auth, updatePost); // Update post
router.delete('/:id', auth, deletePost); // Delete post
router.post('/:id/like', auth, toggleLike); // Toggle like on post

module.exports = router;
