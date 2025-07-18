# Video Upload Troubleshooting Guide

## Overview

This guide helps trainers resolve common video upload issues when creating courses on the Autism Support Platform.

## Common Error Messages and Solutions

### 1. "Failed to upload video" (Generic Error)

**Possible Causes:**
- Network connectivity issues
- Server not running
- File permissions problems
- Uploads directory not accessible

**Solutions:**
1. **Check Network Connection**
   - Ensure you have a stable internet connection
   - Try refreshing the page and uploading again

2. **Verify Server Status**
   - Make sure the backend server is running on port 5000
   - Check server logs for any errors

3. **File Permissions**
   - Ensure the uploads directory has proper write permissions
   - Contact system administrator if needed

### 2. "Invalid video file type" Error

**Allowed Video Formats:**
- MP4 (video/mp4)
- WebM (video/webm)
- OGG (video/ogg)
- AVI (video/avi)
- MOV (video/mov)

**Solutions:**
1. **Convert Video Format**
   - Use a video converter to change to MP4 format
   - Recommended: MP4 with H.264 codec

2. **Check File Extension**
   - Ensure the file has the correct extension (.mp4, .webm, etc.)
   - Sometimes files have wrong extensions

### 3. "Video file too large" Error

**Size Limits:**
- Maximum file size: 200MB
- Recommended: Under 100MB for better performance

**Solutions:**
1. **Compress Video**
   - Use video compression tools
   - Reduce resolution (720p is usually sufficient)
   - Lower bitrate

2. **Split Large Videos**
   - Break into smaller segments
   - Create multiple lessons

### 4. "Upload timed out" Error

**Causes:**
- Large file size
- Slow internet connection
- Server timeout

**Solutions:**
1. **Reduce File Size**
   - Compress video before uploading
   - Use lower quality settings

2. **Check Connection**
   - Use a faster internet connection
   - Try uploading during off-peak hours

3. **Increase Timeout**
   - The system now has a 5-minute timeout
   - Contact support if issues persist

### 5. "Failed to save video file" Error

**Causes:**
- Disk space issues
- Directory permissions
- Server configuration problems

**Solutions:**
1. **Check Disk Space**
   - Ensure server has sufficient storage
   - Contact administrator

2. **Verify Directory Structure**
   - Uploads directory should exist: `backend/uploads/`
   - Proper write permissions required

## Step-by-Step Troubleshooting

### Step 1: Verify File Requirements
```
✅ File format: MP4, WebM, OGG, AVI, or MOV
✅ File size: Under 100MB
✅ File is not corrupted
✅ File has proper extension
```

### Step 2: Check Browser Console
1. Open browser developer tools (F12)
2. Go to Console tab
3. Try uploading video
4. Look for error messages
5. Note any specific error codes

### Step 3: Test with Different File
1. Try uploading a smaller test video (under 10MB)
2. Use MP4 format if possible
3. Check if the issue is file-specific

### Step 4: Check Network Tab
1. Open browser developer tools
2. Go to Network tab
3. Try uploading video
4. Look for failed requests
5. Check response status codes

## Best Practices for Video Uploads

### File Preparation
1. **Format**: Use MP4 with H.264 codec
2. **Resolution**: 720p (1280x720) is sufficient
3. **Bitrate**: 1-2 Mbps for good quality
4. **Duration**: Keep under 30 minutes per video
5. **Size**: Aim for under 100MB (max 200MB)

### Upload Process
1. **Stable Connection**: Use wired connection if possible
2. **Single Upload**: Don't upload multiple files simultaneously
3. **Wait for Completion**: Don't close browser during upload
4. **Verify Success**: Check that video URL is generated

### Video Content Guidelines
1. **Clear Audio**: Ensure good sound quality
2. **Stable Video**: Avoid shaky footage
3. **Good Lighting**: Well-lit environment
4. **Professional Content**: Educational and appropriate

## Technical Support

### Information to Provide
When contacting support, include:
1. **Error Message**: Exact error text
2. **File Details**: Size, format, duration
3. **Browser**: Chrome, Firefox, Safari, Edge
4. **Console Logs**: Any error messages
5. **Network Logs**: Failed request details

### Debug Information
The system now provides detailed error information:
- File type validation
- Size validation
- Server error details
- File path information

## Prevention Tips

1. **Regular Testing**: Test uploads with small files first
2. **Backup Files**: Keep original video files
3. **Format Standards**: Use consistent video formats
4. **Size Management**: Compress videos before uploading
5. **Network Monitoring**: Check connection stability

## Server-Side Improvements

Recent updates include:
- ✅ Automatic uploads directory creation
- ✅ Better error messages with specific details
- ✅ File validation before saving
- ✅ Increased timeout for large files
- ✅ Enhanced logging for debugging

## Contact Information

If you continue to experience issues:
1. Check this troubleshooting guide first
2. Review browser console for specific errors
3. Try with a different video file
4. Contact platform administrator with error details

---

**Last Updated**: [Current Date]
**Version**: 1.0 