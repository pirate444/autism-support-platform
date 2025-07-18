# 🏭 Production Setup Guide

## 📋 Quick Start Checklist

### ✅ Backend Preparation
- [ ] MongoDB Atlas database configured
- [ ] Environment variables set up
- [ ] CORS settings updated
- [ ] Health check endpoint added
- [ ] Railway configuration ready

### ✅ Frontend Preparation
- [ ] API URLs updated for production
- [ ] Environment variables configured
- [ ] Build process tested
- [ ] Vercel configuration ready

## 🔧 Environment Variables Setup

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/autism-support-platform
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
PORT=5000
FRONTEND_URL=https://your-frontend-domain.vercel.app
NODE_ENV=production
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
NEXT_PUBLIC_APP_NAME=Autism Support Platform
```

## 🚀 Deployment Commands

### 1. Update API URLs (Run this script)
```bash
cd scripts
node update-api-urls.js
```

### 2. Test Locally
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (in new terminal)
cd frontend
npm install
npm run dev
```

### 3. Deploy to Railway
```bash
# Push to GitHub first
git add .
git commit -m "Prepare for production deployment"
git push origin main

# Then deploy via Railway dashboard
```

### 4. Deploy to Vercel
```bash
# Push to GitHub first
git add .
git commit -m "Update API URLs for production"
git push origin main

# Then deploy via Vercel dashboard
```

## 🔍 Testing Checklist

### Backend Tests
- [ ] Health check: `GET /api/health`
- [ ] Registration: `POST /api/auth/register`
- [ ] Login: `POST /api/auth/login`
- [ ] Database connection working
- [ ] File uploads working

### Frontend Tests
- [ ] Homepage loads
- [ ] Registration form works
- [ ] Login form works
- [ ] Dashboard loads
- [ ] All features functional
- [ ] Mobile responsive

## 🛡️ Security Checklist

### Database Security
- [ ] Strong database password
- [ ] Network access restricted
- [ ] Database user has minimal permissions
- [ ] Regular backups configured

### Application Security
- [ ] JWT secret is strong and unique
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] HTTPS enforced
- [ ] Environment variables not in code

### Monitoring
- [ ] Error logging configured
- [ ] Performance monitoring set up
- [ ] Uptime monitoring enabled
- [ ] Security scanning enabled

## 📊 Performance Optimization

### Backend
- [ ] Database indexes optimized
- [ ] API response caching
- [ ] File upload size limits
- [ ] Rate limiting configured

### Frontend
- [ ] Images optimized
- [ ] Code splitting implemented
- [ ] Bundle size optimized
- [ ] CDN configured

## 🔄 Maintenance

### Regular Tasks
- [ ] Update dependencies monthly
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Backup database
- [ ] Review security settings

### Monitoring
- [ ] Set up uptime alerts
- [ ] Monitor API response times
- [ ] Track user engagement
- [ ] Monitor database performance

## 🆘 Troubleshooting

### Common Issues

#### Backend Won't Start
- Check environment variables
- Verify MongoDB connection
- Check Railway logs

#### Frontend Build Fails
- Check API URL configuration
- Verify environment variables
- Check Vercel build logs

#### API Calls Fail
- Verify CORS settings
- Check backend URL
- Test API endpoints directly

#### Database Connection Issues
- Check MongoDB Atlas settings
- Verify connection string
- Check network access

## 📞 Support Resources

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **Next.js Docs**: https://nextjs.org/docs

## 🎉 Success Metrics

Once deployed, monitor these metrics:
- **Uptime**: >99.9%
- **Response Time**: <200ms
- **Error Rate**: <1%
- **User Registration**: Track growth
- **Feature Usage**: Monitor engagement

Your autism support platform is now ready to help the community worldwide! 🌍 