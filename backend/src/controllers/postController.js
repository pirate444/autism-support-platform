const Post = require('../models/Post');
const User = require('../models/User');

// Get all published posts with pagination and filtering
const getPosts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      author, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { isPublished: true };

    // Add filters
    if (category) {
      query.category = category;
    }
    if (author) {
      query.author = author;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const posts = await Post.find(query)
      .populate('author', 'name role avatar specialization')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
};

// Get a single post by ID
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await Post.findById(id)
      .populate('author', 'name role avatar specialization bio')
      .populate('likes.user', 'name avatar');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment view count
    post.viewCount += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Error fetching post', error: error.message });
  }
};

// Create a new post
const createPost = async (req, res) => {
  try {
    const { title, content, category, tags, media, featured } = req.body;
    const authorId = req.user.userId;

    // Check if user can create posts (not parents or ministry staff)
    const user = await User.findById(authorId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'parent' || user.role === 'ministry_staff') {
      return res.status(403).json({ message: 'You are not authorized to create posts' });
    }

    const post = new Post({
      title,
      content,
      category,
      author: authorId,
      tags: tags || [],
      media: media || [],
      featured: featured || false
    });

    await post.save();
    await post.populate('author', 'name role avatar specialization');

    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
};

// Update a post
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags, media, featured } = req.body;
    const userId = req.user.userId;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author or admin
    if (post.author.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'You are not authorized to update this post' });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;
    post.tags = tags || post.tags;
    post.media = media || post.media;
    post.featured = featured !== undefined ? featured : post.featured;

    await post.save();
    await post.populate('author', 'name role avatar specialization');

    res.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Error updating post', error: error.message });
  }
};

// Delete a post
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author or admin
    if (post.author.toString() !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'You are not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
};

// Toggle like on a post
const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isLiked = post.toggleLike(userId);
    await post.save();

    res.json({ 
      isLiked, 
      likeCount: post.likeCount,
      message: isLiked ? 'Post liked' : 'Post unliked'
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ message: 'Error toggling like', error: error.message });
  }
};

// Get post categories
const getCategories = async (req, res) => {
  try {
    const categories = [
      { value: 'news_articles', label: 'News Articles' },
      { value: 'expert_advice', label: 'Expert Advice' },
      { value: 'research_updates', label: 'Research Updates' },
      { value: 'success_stories', label: 'Success Stories' },
      { value: 'event_announcements', label: 'Event Announcements' },
      { value: 'educational_content', label: 'Educational Content' }
    ];

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

// Get featured posts
const getFeaturedPosts = async (req, res) => {
  try {
    const { limit = 3 } = req.query;

    const posts = await Post.find({ 
      isPublished: true, 
      featured: true 
    })
      .populate('author', 'name role avatar specialization')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json(posts);
  } catch (error) {
    console.error('Error fetching featured posts:', error);
    res.status(500).json({ message: 'Error fetching featured posts', error: error.message });
  }
};

// Get new posts count (for indicator)
const getNewPostsCount = async (req, res) => {
  try {
    const { since } = req.query;
    const sinceDate = since ? new Date(since) : new Date(Date.now() - 24 * 60 * 60 * 1000); // Default: last 24 hours

    const count = await Post.countDocuments({
      isPublished: true,
      createdAt: { $gte: sinceDate }
    });

    res.json({ newPostsCount: count });
  } catch (error) {
    console.error('Error fetching new posts count:', error);
    res.status(500).json({ message: 'Error fetching new posts count', error: error.message });
  }
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  getCategories,
  getFeaturedPosts,
  getNewPostsCount
};



