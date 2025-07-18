# Collaboration Request System Update

## Overview
The collaboration request system has been updated to allow teachers (school support assistants) to request collaborations with students, in addition to doctors and trainers.

## Changes Made

### Backend Updates

#### 1. Collaboration Request Controller (`backend/src/controllers/collaborationRequestController.js`)
- **Updated allowed roles**: Added `school_support_assistant` to the list of roles that can request collaboration
- **Updated error message**: Changed from "Only doctors and trainers can request collaboration" to "Only doctors, trainers, and teachers can request collaboration"

**Before:**
```javascript
const allowedRoles = ['child_psychiatrist', 'psychologist', 'speech_therapist', 'occupational_therapist', 'specialist_educator'];
```

**After:**
```javascript
const allowedRoles = ['child_psychiatrist', 'psychologist', 'speech_therapist', 'occupational_therapist', 'specialist_educator', 'school_support_assistant'];
```

### Frontend Updates

#### 1. Collaboration Page (`frontend/src/app/dashboard/collaboration/page.tsx`)
- **Updated `canRequestCollaboration()` function**: Added `school_support_assistant` to the allowed roles
- Teachers can now see the "Request Collaboration" button when they don't have access to a student

#### 2. Profile Page (`frontend/src/app/dashboard/profile/page.tsx`)
- **Updated professional fields condition**: Added `school_support_assistant` to the roles that can see and edit professional fields (specialization, qualifications, years of experience, workplace)
- Teachers can now maintain their professional information in their profile

## Who Can Request Collaboration

The following roles can now request collaboration with students:

1. **Child Psychiatrist** (`child_psychiatrist`)
2. **Psychologist** (`psychologist`)
3. **Speech Therapist** (`speech_therapist`)
4. **Occupational Therapist** (`occupational_therapist`)
5. **Specialist Educator** (`specialist_educator`) - Trainers
6. **School Support Assistant** (`school_support_assistant`) - Teachers ⭐ **NEW**

## Collaboration Request Workflow

1. **Request Creation**: Teachers, doctors, and trainers can create collaboration requests
2. **Admin Review**: Only the platform administrator can review and approve/reject requests
3. **Access Grant**: Once approved, the requester gains access to collaborate with the specific student
4. **Collaboration Features**: Approved users can create notes, schedule appointments, and create progress reports

## User Experience

### For Teachers
- Teachers can now request collaboration with students they need to work with
- They can maintain their professional profile information
- They receive clear feedback about their request status
- Once approved, they have full access to collaboration features

### For Admins
- Admins can review collaboration requests from all professional roles including teachers
- The admin interface shows the requester's role and specialization
- Admins can approve or reject requests with optional responses

## Technical Implementation

### Role-Based Access Control
- Backend validates user roles before allowing request creation
- Frontend shows/hides UI elements based on user permissions
- Consistent role checking across all collaboration features

### Error Handling
- Clear error messages for unauthorized access attempts
- Proper validation of request data
- User-friendly feedback for all operations

## Testing Considerations

When testing the updated system:

1. **Teacher Registration**: Ensure teachers can register and access the platform
2. **Collaboration Requests**: Verify teachers can create collaboration requests
3. **Admin Approval**: Test that admins can approve teacher requests
4. **Access Control**: Confirm approved teachers can use collaboration features
5. **Profile Management**: Check that teachers can edit their professional information

## Related Documentation

- [Admin System Overview](ADMIN_SYSTEM.md)
- [Collaboration Request Admin-Only Workflow](COLLABORATION_REQUEST_ADMIN_ONLY.md)
- [Student Creation Restrictions](STUDENT_CREATION_RESTRICTIONS.md)
- [Trainer-Only Upload Restrictions](TRAINER_ONLY_UPLOAD_RESTRICTIONS.md) 