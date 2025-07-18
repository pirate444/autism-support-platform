# Trainer-Only Restrictions

## Overview

The platform now restricts the ability to upload and manage activities, courses, and games to **only trainers (Specialist Educators)**. This ensures quality control and proper educational content management.

## What Trainers Can Do

### Activities & Games
- ✅ Upload new activities and games
- ✅ Create educational content
- ✅ Manage activity categories and types
- ✅ Upload files (PDFs, videos, worksheets)

### Courses
- ✅ Create new training courses
- ✅ Upload course videos and thumbnails
- ✅ Publish/unpublish courses
- ✅ Update and delete courses
- ✅ Manage course content and structure

### General Platform Access
- ✅ Access all platform features
- ✅ Collaborate with students (with admin approval)
- ✅ View and use existing content

## What Other Users Can Do

### Activities & Games
- ✅ Browse existing activities and games
- ✅ Search and filter activities
- ✅ Download and use activities
- ❌ Cannot upload new activities
- ❌ Cannot create new games

### Courses
- ✅ Browse existing courses
- ✅ Enroll in courses
- ✅ Track course progress
- ✅ Complete courses
- ❌ Cannot create new courses
- ❌ Cannot upload course content

## User Interface Changes

### Activities Page
- **Trainers**: See "Upload New Activity" button
- **Other Users**: See notice about trainer-only uploads
- **All Users**: Can browse and use existing activities

### Courses Page
- **Trainers**: See "Create New Course" button
- **Other Users**: See notice about trainer-only course creation
- **All Users**: Can browse and enroll in courses

### Dashboard
- **Trainers**: Full access to all features
- **Other Users**: Limited access based on role

## Backend Security

### API Endpoints Protected
- `POST /api/activities` - Create activities (trainers only)
- `POST /api/courses` - Create courses (trainers only)
- `PUT /api/courses/:id` - Update courses (trainers only)
- `DELETE /api/courses/:id` - Delete courses (trainers only)
- `PUT /api/courses/:id/publish` - Publish courses (trainers only)
- `POST /api/courses/upload/video` - Upload videos (trainers only)
- `POST /api/courses/upload/thumbnail` - Upload thumbnails (trainers only)

### Permission Checks
- All upload endpoints validate user role
- Only `specialist_educator` role allowed
- Clear error messages for unauthorized access

## Benefits

### Quality Control
- Ensures educational content meets standards
- Prevents inappropriate or low-quality uploads
- Maintains platform reputation

### Content Management
- Centralized content creation by qualified professionals
- Consistent educational approach
- Better organization of resources

### Security
- Prevents unauthorized content uploads
- Protects against malicious files
- Maintains platform integrity

## User Roles Affected

### Specialist Educator (Trainer)
- **Full Access**: Can upload and manage all content
- **Responsibilities**: Create quality educational materials
- **Permissions**: All platform features available

### Other Professional Roles
- **Child Psychiatrist**: Can browse and use content
- **Psychologist**: Can browse and use content
- **Speech Therapist**: Can browse and use content
- **Occupational Therapist**: Can browse and use content
- **School Support Assistant**: Can browse and use content
- **Ministry Staff**: Can browse and use content

### Parents
- **Limited Access**: Can browse and use content
- **No Upload**: Cannot create new content
- **Focus**: Using resources for their children

## Troubleshooting

### "Only trainers can..." Error
- **Cause**: User role is not `specialist_educator`
- **Solution**: Contact admin to change role or use existing content

### Upload Button Not Visible
- **Cause**: User is not a trainer
- **Solution**: Only trainers see upload buttons

### Permission Denied
- **Cause**: Backend role validation failed
- **Solution**: Ensure user has correct role in database

## Best Practices

### For Trainers
1. **Quality Content**: Create high-quality educational materials
2. **Proper Categorization**: Use appropriate categories and types
3. **File Management**: Upload appropriate file formats and sizes
4. **Regular Updates**: Keep content current and relevant

### For Other Users
1. **Browse Content**: Explore existing activities and courses
2. **Provide Feedback**: Report issues with content
3. **Request Content**: Ask trainers for specific materials
4. **Use Responsibly**: Follow usage guidelines

## Support

For content-related issues:
1. **Content Requests**: Contact trainers for specific materials
2. **Technical Issues**: Report problems to platform admin
3. **Role Changes**: Request role updates from admin
4. **Content Quality**: Provide feedback to content creators

## Future Enhancements

### Potential Features
- Content approval workflow
- Content rating system
- User-generated content with moderation
- Advanced content management tools
- Content analytics and usage tracking 