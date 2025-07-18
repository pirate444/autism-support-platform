# Testing Students API - Debug Guide

This guide helps debug why students are not showing up for admin users.

## Issue Description
Admin users are not seeing students in the students page, even though they should see all students in the system.

## Root Cause Analysis

### 1. Check if Students Exist in Database
First, verify that there are actually students in the database:

```bash
# Connect to MongoDB and check students collection
mongo
use autism_support_platform
db.students.find().pretty()
```

### 2. Test API Endpoints Directly
Test the API endpoints using curl or Postman:

#### Test GET /api/students/ (All Students)
```bash
curl -X GET http://localhost:5000/api/students/ \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

#### Test GET /api/students/my-assigned (Assigned Students)
```bash
curl -X GET http://localhost:5000/api/students/my-assigned \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

### 3. Check Authentication
Verify that the admin user has the correct `isAdmin` field:

```bash
# Check admin user in database
db.users.findOne({isAdmin: true})
```

### 4. Frontend Debugging
Open browser developer tools and check:

1. **Console Logs**: Look for the debug messages we added:
   - "Loading students with endpoint: ..."
   - "User data: ..."
   - "Students loaded: ..."

2. **Network Tab**: Check the actual API requests:
   - URL being called
   - Request headers (especially Authorization)
   - Response status and data

3. **Application Tab**: Check localStorage:
   - `user` object
   - `token` value

## Common Issues and Solutions

### Issue 1: No Students in Database
**Symptoms**: API returns empty array `[]`
**Solution**: Create some test students using the admin interface or directly in the database

### Issue 2: Authentication Problem
**Symptoms**: API returns 401 or 403 error
**Solution**: 
- Check if token is valid
- Verify user has `isAdmin: true`
- Check if token is expired

### Issue 3: Wrong Endpoint Being Called
**Symptoms**: Console shows wrong endpoint
**Solution**: 
- Check if `user.isAdmin` is correctly set
- Verify user data is loaded before API call

### Issue 4: CORS or Network Issue
**Symptoms**: Network error in browser
**Solution**: 
- Check if backend server is running
- Verify CORS configuration
- Check network connectivity

## Test Data Creation

### Create Test Student via API
```bash
curl -X POST http://localhost:5000/api/students/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "ministryCode": "TEST001",
    "dateOfBirth": "2010-01-01"
  }'
```

### Create Test Student via Database
```javascript
db.students.insertOne({
  name: "Test Student",
  ministryCode: "TEST001",
  dateOfBirth: new Date("2010-01-01"),
  assignedUsers: [],
  createdAt: new Date()
})
```

## Expected Behavior

### For Admin Users
- Should see all students in the system
- Endpoint: `/api/students/`
- Page title: "Students Management"
- Can assign professionals to students

### For Professional Users
- Should see only assigned students
- Endpoint: `/api/students/my-assigned`
- Page title: "My Assigned Students"
- Cannot assign professionals (admin only)

## Debugging Steps

1. **Check Database**: Verify students exist
2. **Test API**: Use curl to test endpoints directly
3. **Check Authentication**: Verify admin user and token
4. **Check Frontend**: Look at console logs and network requests
5. **Check User Data**: Verify `user.isAdmin` is correctly set

## Console Debug Output

The frontend now includes debug logging. Look for these messages in the browser console:

```
Loading students with endpoint: /api/students/ User isAdmin: true
User data: {id: "...", name: "...", role: "...", isAdmin: true}
Students loaded: [...]
```

If you see different output, it indicates the issue.

## Quick Fixes

### If No Students Exist
Create a test student using the admin interface or API.

### If Wrong Endpoint
Check that the admin user has `isAdmin: true` in the database.

### If Authentication Fails
Re-login as admin to get a fresh token.

### If API Returns Error
Check backend server logs for detailed error information. 