const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, content, studentId } = req.body;
    if (!recipientId || !content) {
      return res.status(400).json({ message: 'Recipient and content are required.' });
    }
    const message = new Message({
      sender: req.user.userId,
      recipient: recipientId,
      content,
      student: studentId || undefined,
    });
    await message.save();
    await message.populate('sender', 'name email role');
    await message.populate('recipient', 'name email role');
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get messages between logged-in user and another user (with pagination)
exports.getMessages = async (req, res) => {
  try {
    const { userId, studentId, page = 1, limit = 50 } = req.query;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required.' });
    }
    const skip = (page - 1) * limit;
    const filter = {
      $or: [
        { sender: req.user.userId, recipient: userId },
        { sender: userId, recipient: req.user.userId },
      ],
    };
    if (studentId) {
      filter.student = studentId;
    }
    const messages = await Message.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('sender', 'name email role')
      .populate('recipient', 'name email role');

    const total = await Message.countDocuments(filter);
    
    // Return in chronological order for UI
    res.json({
      messages: messages.reverse(),
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

// Get messages with a specific user (by recipient ID, with pagination)
exports.getMessagesWithUser = async (req, res) => {
  try {
    const { recipientId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const filter = {
      $or: [
        { sender: req.user.userId, recipient: recipientId },
        { sender: recipientId, recipient: req.user.userId },
      ],
    };
    const messages = await Message.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('sender', 'name email role')
      .populate('recipient', 'name email role');

    const total = await Message.countDocuments(filter);

    res.json({
      messages: messages.reverse(),
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

// Get all conversations for the logged-in user (using aggregation pipeline)
exports.getConversations = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    const conversations = await Message.aggregate([
      // Match all messages involving the current user
      {
        $match: {
          $or: [
            { sender: userId },
            { recipient: userId }
          ]
        }
      },
      // Sort by most recent first
      { $sort: { timestamp: -1 } },
      // Create a conversationKey that groups messages between the same two users
      {
        $addFields: {
          otherUser: {
            $cond: {
              if: { $eq: ['$sender', userId] },
              then: '$recipient',
              else: '$sender'
            }
          }
        }
      },
      // Group by the other user
      {
        $group: {
          _id: '$otherUser',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$recipient', userId] },
                  { $eq: ['$read', false] }
                ]},
                1,
                0
              ]
            }
          }
        }
      },
      // Sort conversations by last message timestamp
      { $sort: { 'lastMessage.timestamp': -1 } },
      // Lookup the other user's details
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'otherUserInfo',
          pipeline: [
            { $project: { name: 1, email: 1, role: 1, avatar: 1 } }
          ]
        }
      },
      { $unwind: '$otherUserInfo' },
      // Lookup the sender details for the last message
      {
        $lookup: {
          from: 'users',
          localField: 'lastMessage.sender',
          foreignField: '_id',
          as: 'lastMessageSender',
          pipeline: [
            { $project: { name: 1 } }
          ]
        }
      },
      { $unwind: '$lastMessageSender' },
      // Project the final shape
      {
        $project: {
          _id: 1,
          participants: ['$otherUserInfo'],
          lastMessage: {
            content: '$lastMessage.content',
            createdAt: '$lastMessage.timestamp',
            sender: {
              _id: '$lastMessageSender._id',
              name: '$lastMessageSender.name'
            }
          },
          unreadCount: 1
        }
      }
    ]);

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Mark messages as read
exports.markMessagesAsRead = async (req, res) => {
  try {
    const { recipientId } = req.params;
    
    // Mark all unread messages from this sender as read
    await Message.updateMany(
      {
        sender: recipientId,
        recipient: req.user.userId,
        read: false
      },
      {
        read: true
      }
    );
    
    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get total unread message count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.user.userId,
      read: false
    });
    
    res.json({ unreadCount: count });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get unread message count for a specific user
exports.getUnreadCountForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const count = await Message.countDocuments({
      sender: userId,
      recipient: req.user.userId,
      read: false
    });
    
    res.json({ unreadCount: count });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};