# Collaboration Request System - Admin Only

## Overview

The collaboration request system has been updated so that **only the platform administrator** can approve or reject collaboration requests. This ensures centralized control and oversight of all collaboration activities.

## How It Works

### For Users (Doctors, Trainers, etc.)

1. **Submit Request**: Users can submit collaboration requests for specific students
2. **Wait for Approval**: Requests are automatically sent to the admin for review
3. **Access Granted**: Once approved by admin, users can access collaboration features
4. **Track Status**: Users can view their own requests and their approval status

### For Admin

1. **Review Requests**: Admin can view all pending collaboration requests
2. **Approve/Reject**: Admin can approve or reject requests with optional comments
3. **Manage Access**: Admin controls who can collaborate with which students
4. **Monitor Activity**: Admin can track all collaboration activities

## User Interface Changes

### Dashboard
- **Collaboration Requests** card only visible to admin users
- Admin badge clearly indicates admin privileges
- Regular users see their own requests only

### Collaboration Page
- Notice about admin-only approval system
- Clear status indicators for request approval
- Request submission for users without access

### Admin Dashboard
- Dedicated collaboration requests management
- User statistics and management tools
- Full platform administration capabilities

## API Endpoints

### Admin-Only Endpoints
- `GET /api/collaboration-requests/all` - View all requests (admin only)
- `PUT /api/collaboration-requests/:id/status` - Approve/reject requests (admin only)

### User Endpoints
- `GET /api/collaboration-requests/my` - View own requests
- `POST /api/collaboration-requests` - Submit new request
- `GET /api/collaboration-requests/access/:studentId` - Check access status

## Security Features

### Permission Checks
- All admin routes require `isAdmin: true` in JWT token
- Frontend validates admin status before showing admin features
- Backend enforces admin-only access to sensitive endpoints

### Access Control
- Only admin can approve/reject collaboration requests
- Users can only view their own requests
- Collaboration features require approved access

## Workflow

### Request Submission
1. User selects a student
2. User submits collaboration request with reason
3. Request is marked as "pending"
4. Admin is notified of new request

### Admin Review
1. Admin views all pending requests
2. Admin reviews request details and reason
3. Admin approves or rejects with optional response
4. User is notified of decision

### Access Granting
1. Approved requests grant collaboration access
2. Users can create notes, appointments, and reports
3. Access is maintained until manually revoked

## Benefits

### Centralized Control
- Single point of approval for all collaboration requests
- Consistent decision-making across the platform
- Better oversight of collaboration activities

### Security
- Prevents unauthorized access to student information
- Ensures proper vetting of collaboration requests
- Maintains data privacy and compliance

### Accountability
- Clear audit trail of all collaboration requests
- Admin can track who has access to which students
- Better management of professional relationships

## Troubleshooting

### "Access Denied" Errors
- Ensure user has submitted a collaboration request
- Check if request has been approved by admin
- Verify user is logged in with valid credentials

### "Admin Only" Errors
- Only admin users can approve/reject requests
- Regular users can only view their own requests
- Contact admin for collaboration approval

### Request Not Showing
- Check if request was submitted successfully
- Verify admin has reviewed the request
- Ensure proper user authentication

## Best Practices

### For Users
1. Provide clear, detailed reasons for collaboration requests
2. Be patient while waiting for admin approval
3. Use collaboration features responsibly once approved
4. Contact admin if you need urgent access

### For Admin
1. Review requests promptly and fairly
2. Provide clear feedback when rejecting requests
3. Monitor collaboration activities regularly
4. Maintain consistent approval standards

## Support

For collaboration-related issues:
1. Check request status in your dashboard
2. Contact the platform administrator
3. Review the collaboration guidelines
4. Ensure proper authentication and permissions 