// Railway deployment test - $(date)
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

// Ensure avatars directory exists
const avatarsDir = path.join(__dirname, '../uploads/avatars');
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
  console.log('Created avatars directory:', avatarsDir);
}

// CORS configuration for both development and production
const allowedOrigins = [
  'https://autism-support-platform-wlet.vercel.app', // your Vercel frontend
  'http://localhost:3000' // for local development
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true, // if you use cookies or authentication
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// For development, you can set this environment variable to allow all origins
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.ALLOW_ALL_ORIGINS === 'true';

if (isDevelopment) {
  // More permissive CORS for development
  app.use(cors({ 
    origin: function (origin, callback) {
      console.log('🌐 CORS request from origin:', origin);
      
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        console.log('✅ Allowing request with no origin');
        return callback(null, true);
      }
      
      // Allow all localhost and 127.0.0.1 origins in development
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        console.log('✅ Allowing localhost origin:', origin);
        return callback(null, true);
      }
      
      // Allow all origins in development mode
      console.log('✅ Development mode: allowing origin:', origin);
      callback(null, true);
    },
    credentials: true 
  }));
  console.log('🔓 Development mode: CORS allows all origins');
} else {
  // Strict CORS for production
  app.use(cors({ 
    origin: function (origin, callback) {
      console.log('🌐 CORS request from origin:', origin);
      
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        console.log('✅ Allowing production origin:', origin);
        callback(null, true);
      } else {
        console.log('❌ CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true 
  }));
  console.log('🔒 Production mode: CORS restricted to allowed origins');
}
app.use(express.json());
app.use(helmet());

// Rate limiting: 1000 requests per 15 minutes per IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
}));

// Import auth routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Import student routes
const studentRoutes = require('./routes/student');
app.use('/api/students', studentRoutes);

// Import doctor routes
const doctorRoutes = require('./routes/doctor');
app.use('/api/doctors', doctorRoutes);

// Import activity routes
const activityRoutes = require('./routes/activity');
app.use('/api/activities', activityRoutes);

// Import collaboration routes
const collaborationRoutes = require('./routes/collaboration');
app.use('/api/collaboration', collaborationRoutes);

// Import collaboration request routes
const collaborationRequestRoutes = require('./routes/collaborationRequest');
app.use('/api/collaboration-requests', collaborationRequestRoutes);

// Import course routes
const courseRoutes = require('./routes/course');
app.use('/api/courses', courseRoutes);

// Import course section routes
const courseSectionRoutes = require('./routes/courseSection');
app.use('/api/course-sections', courseSectionRoutes);

// Import course lesson routes
const courseLessonRoutes = require('./routes/courseLesson');
app.use('/api/course-lessons', courseLessonRoutes);

// Import upload routes
const uploadRoutes = require('./routes/upload');
app.use('/api/upload', uploadRoutes);

// Import user routes
const userRoutes = require('./routes/user');
app.use('/api/users', userRoutes);

// Import message routes
const messageRoutes = require('./routes/message');
app.use('/api/messages', messageRoutes);

// Import notification routes
const notificationRoutes = require('./routes/notification');
app.use('/api/notifications', notificationRoutes);

// Import course access routes
const courseAccessRoutes = require('./routes/courseAccess');
app.use('/api/course-access', courseAccessRoutes);

// Import language routes
const languageRoutes = require('./routes/language');
app.use('/api/language', languageRoutes);

// Import post routes
const postRoutes = require('./routes/post');
app.use('/api/posts', postRoutes);

// Set CORS headers for all /uploads responses, including range requests
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Accept-Ranges', 'bytes');
  next();
});
// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/uploads/avatars', express.static(path.join(__dirname, '../uploads/avatars')));

// Health check endpoint for Railway
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Autism Support Platform Backend is running',
    timestamp: new Date().toISOString()
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Placeholder route
app.get('/', (req, res) => {
  res.send('Welcome to the Autism Support Platform API!');
});

// Generic error handler (should be after all routes)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error.' });
});

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 