@echo off
echo 🔄 Switching to production URLs...
echo.

node scripts/url-switcher.js production

echo.
echo ✅ Done! Your project is now configured for production.
echo.
echo 🚀 Next steps:
echo 1. Deploy your backend to Railway
echo 2. Deploy your frontend to Vercel
echo 3. Your app will connect to the production backend
echo.
pause 