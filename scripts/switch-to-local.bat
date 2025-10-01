@echo off
echo 🔄 Switching to local development URLs...
echo.

node scripts/url-switcher.js local

echo.
echo ✅ Done! Your project is now configured for local development.
echo.
echo 🚀 Next steps:
echo 1. Start your backend: cd backend ^&^& npm run dev
echo 2. Start your frontend: cd frontend ^&^& npm run dev
echo 3. Open http://localhost:3000 in your browser
echo.
pause 