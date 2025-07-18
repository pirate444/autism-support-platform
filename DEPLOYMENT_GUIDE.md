# 🚀 Deployment Guide - Autism Support Platform

This guide will help you deploy your autism support platform to the internet.

## 📋 Prerequisites

- GitHub account
- MongoDB Atlas account (for database)
- Railway account (for backend)
- Vercel account (for frontend)

## 🗄️ Step 1: Set Up MongoDB Atlas (Database)

### 1.1 Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new cluster (M0 Free tier is sufficient)

### 1.2 Configure Database
1. **Create Database User**:
   - Go to Database Access
   - Add new database user
   - Username: `autism-support-user`
   - Password: Generate a strong password
   - Role: `Read and write to any database`

2. **Configure Network Access**:
   - Go to Network Access
   - Add IP Address: `0.0.0.0/0` (allows all IPs)
   - Or add specific IPs for security

3. **Get Connection String**:
   - Go to Clusters → Connect
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

## 🔧 Step 2: Deploy Backend to Railway

### 2.1 Prepare Backend
1. **Update CORS Settings** (already done):
   ```javascript
   // In backend/src/app.js
   const allowedOrigins = [
     'http://localhost:3000',
     'https://your-frontend-domain.vercel.app',
     process.env.FRONTEND_URL
   ].filter(Boolean);
   ```

2. **Environment Variables**:
   Create `.env` file in backend folder:
   ```env
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=5000
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   ```

### 2.2 Deploy to Railway
1. **Connect GitHub**:
   - Go to [Railway](https://railway.app)
   - Sign up with GitHub
   - Create new project

2. **Deploy Backend**:
   - Choose "Deploy from GitHub repo"
   - Select your repository
   - Set root directory to `backend`
   - Railway will auto-detect Node.js

3. **Configure Environment Variables**:
   - Go to Variables tab
   - Add all variables from your `.env` file
   - Railway will automatically restart the deployment

4. **Get Backend URL**:
   - Railway will provide a URL like: `https://your-app-name.railway.app`
   - Copy this URL for frontend configuration

## 🌐 Step 3: Deploy Frontend to Vercel

### 3.1 Prepare Frontend
1. **Update API URLs**:
   Create environment variables in frontend:

   Create `.env.local` in frontend folder:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   ```

2. **Update API Calls**:
   Replace all `http://localhost:5000` with `process.env.NEXT_PUBLIC_API_URL`

### 3.2 Deploy to Vercel
1. **Connect GitHub**:
   - Go to [Vercel](https://vercel.com)
   - Sign up with GitHub
   - Import your repository

2. **Configure Project**:
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Environment Variables**:
   - Add `NEXT_PUBLIC_API_URL` with your Railway backend URL

4. **Deploy**:
   - Click Deploy
   - Vercel will build and deploy your frontend

## 🔄 Step 4: Update Frontend API URLs

You need to update all API calls in the frontend to use the production backend URL. Here are the main files to update:

### Files to Update:
- `frontend/src/app/auth/login/page.tsx`
- `frontend/src/app/auth/register/page.tsx`
- `frontend/src/app/dashboard/page.tsx`
- All other pages that make API calls

### Example Update:
```javascript
// Before
const response = await axios.post('http://localhost:5000/api/auth/login', formData)

// After
const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, formData)
```

## 🎯 Step 5: Test Your Deployment

### 5.1 Test Backend
1. Visit: `https://your-backend-url.railway.app/api/health`
2. Should return: `{"status":"OK","message":"Autism Support Platform Backend is running"}`

### 5.2 Test Frontend
1. Visit your Vercel URL
2. Try to register a new account
3. Test login functionality
4. Test all major features

## 🔒 Step 6: Security Considerations

### 6.1 Environment Variables
- Never commit `.env` files to GitHub
- Use strong, unique passwords
- Rotate JWT secrets regularly

### 6.2 CORS Configuration
- Only allow necessary domains
- Remove `0.0.0.0/0` from MongoDB Atlas in production
- Use specific IP addresses

### 6.3 SSL/HTTPS
- Vercel and Railway provide SSL automatically
- Ensure all API calls use HTTPS

## 🚀 Alternative Deployment Options

### Option A: Netlify + Railway
- Frontend: [Netlify](https://netlify.com)
- Backend: Railway (same as above)
- Similar process, different UI

### Option B: DigitalOcean App Platform
- Both frontend and backend on DigitalOcean
- More control, slightly more complex

### Option C: AWS/Google Cloud
- Full control over infrastructure
- More complex setup
- Better for large-scale applications

## 📞 Support

If you encounter issues:
1. Check Railway logs for backend errors
2. Check Vercel build logs for frontend errors
3. Verify environment variables are set correctly
4. Test API endpoints directly with Postman/curl

## 🎉 Success!

Once deployed, your autism support platform will be accessible worldwide at:
- Frontend: `https://your-app-name.vercel.app`
- Backend: `https://your-app-name.railway.app`

Share your platform URL with users and start helping the autism community! 