const Message = require('../models/Message');
const User = require('../models/User');

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
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Get all messages between logged-in user and another user
exports.getMessages = async (req, res) => {
  try {
    const { userId, studentId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required.' });
    }
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
      .sort({ timestamp: 1 })
      .populate('sender', 'name email role')
      .populate('recipient', 'name email role');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Get messages with a specific user (by recipient ID)
exports.getMessagesWithUser = async (req, res) => {
  try {
    const { recipientId } = req.params;
    const filter = {
      $or: [
        { sender: req.user.userId, recipient: recipientId },
        { sender: recipientId, recipient: req.user.userId },
      ],
    };
    const messages = await Message.find(filter)
      .sort({ timestamp: 1 })
      .populate('sender', 'name email role')
      .populate('recipient', 'name email role');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Get all conversations for the logged-in user
exports.getConversations = async (req, res) => {
  try {
    // Get all messages where the user is either sender or recipient
    const messages = await Message.find({
      $or: [
        { sender: req.user.userId },
        { recipient: req.user.userId }
      ]
    })
    .sort({ timestamp: -1 })
    .populate('sender', 'name email role')
    .populate('recipient', 'name email role');

    // Group messages by conversation (other participant)
    const conversationsMap = new Map();
    
    messages.forEach(message => {
      const otherUserId = message.sender._id.toString() === req.user.userId 
        ? message.recipient._id.toString() 
        : message.sender._id.toString();
      
      if (!conversationsMap.has(otherUserId)) {
        // Calculate unread count for this conversation
        const unreadCount = messages.filter(m => 
          m.recipient._id.toString() === req.user.userId && 
          m.sender._id.toString() === otherUserId && 
          !m.read
        ).length;

        conversationsMap.set(otherUserId, {
          _id: otherUserId,
          participants: [
            message.sender._id.toString() === req.user.userId ? message.recipient : message.sender,
            message.sender._id.toString() === req.user.userId ? message.sender : message.recipient
          ],
          lastMessage: {
            content: message.content,
            createdAt: message.timestamp,
            sender: {
              _id: message.sender._id,
              name: message.sender.name
            }
          },
          unreadCount
        });
      } else {
        // Update last message if this message is more recent
        const conversation = conversationsMap.get(otherUserId);
        if (message.timestamp > conversation.lastMessage.createdAt) {
          conversation.lastMessage = {
            content: message.content,
            createdAt: message.timestamp,
            sender: {
              _id: message.sender._id,
              name: message.sender.name
            }
          };
        }
      }
    });

    const conversations = Array.from(conversationsMap.values());
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
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
    res.status(500).json({ message: 'Server error.', error: err.message });
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
    res.status(500).json({ message: 'Server error.', error: err.message });
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
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
}; 