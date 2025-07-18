const Notification = require('../models/Notification');
const User = require('../models/User');
const Student = require('../models/Student');
const Course = require('../models/Course');

class NotificationService {
  // Create a notification
  static async createNotification(notificationData) {
    try {
      const notification = new Notification(notificationData);
      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Collaboration request approved
  static async notifyCollaborationRequestApproved(request, approvedBy) {
    const student = await Student.findById(request.student);
    const approver = await User.findById(approvedBy);
    
    await this.createNotification({
      recipient: request.requester,
      type: 'collaboration_request_approved',
      title: 'Collaboration Request Approved',
      message: `Your collaboration request for student ${student?.name || 'Unknown'} has been approved by ${approver?.name || 'Admin'}.`,
      data: {
        studentName: student?.name,
        approverName: approver?.name,
        requestType: request.requestType
      },
      relatedStudent: request.student,
      relatedUser: approvedBy,
      relatedCollaborationRequest: request._id
    });
  }

  // Collaboration request rejected
  static async notifyCollaborationRequestRejected(request, rejectedBy, adminResponse) {
    const student = await Student.findById(request.student);
    const rejector = await User.findById(rejectedBy);
    
    await this.createNotification({
      recipient: request.requester,
      type: 'collaboration_request_rejected',
      title: 'Collaboration Request Rejected',
      message: `Your collaboration request for student ${student?.name || 'Unknown'} has been rejected by ${rejector?.name || 'Admin'}.${adminResponse ? ` Reason: ${adminResponse}` : ''}`,
      data: {
        studentName: student?.name,
        rejectorName: rejector?.name,
        requestType: request.requestType,
        adminResponse
      },
      relatedStudent: request.student,
      relatedUser: rejectedBy,
      relatedCollaborationRequest: request._id
    });
  }

  // New collaboration request received (for admin)
  static async notifyNewCollaborationRequest(request) {
    const student = await Student.findById(request.student);
    const requester = await User.findById(request.requester);
    
    // Find admin users
    const adminUsers = await User.find({ isAdmin: true });
    
    for (const admin of adminUsers) {
      await this.createNotification({
        recipient: admin._id,
        type: 'collaboration_request_received',
        title: 'New Collaboration Request',
        message: `${requester?.name || 'Unknown'} has requested collaboration access for student ${student?.name || 'Unknown'}.`,
        data: {
          studentName: student?.name,
          requesterName: requester?.name,
          requestType: request.requestType,
          reason: request.reason
        },
        relatedStudent: request.student,
        relatedUser: request.requester,
        relatedCollaborationRequest: request._id
      });
    }
  }

  // Note added to assigned student
  static async notifyNoteAdded(note, studentId, createdBy) {
    const student = await Student.findById(studentId);
    const creator = await User.findById(createdBy);
    // Notify all users assigned to this student (including the creator)
    if (student && student.assignedUsers) {
      for (const assignedUserId of student.assignedUsers) {
        try {
          await this.createNotification({
            recipient: assignedUserId,
            type: 'note_added',
            title: 'New Note Added',
            message: `${creator?.name || 'Unknown'} added a note for student ${student.name}.`,
            data: {
              studentName: student.name,
              creatorName: creator?.name,
              noteContent: note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '')
            },
            relatedStudent: studentId,
            relatedUser: createdBy
          });
          console.log(`[Notification] Note added: sent to user ${assignedUserId} for student ${studentId}`);
        } catch (err) {
          console.error(`[Notification] Error sending note notification to user ${assignedUserId}:`, err);
        }
      }
    }
  }

  // Appointment added to assigned student
  static async notifyAppointmentAdded(appointment, studentId, createdBy) {
    const student = await Student.findById(studentId);
    const creator = await User.findById(createdBy);
    // Notify all users assigned to this student (including the creator)
    if (student && student.assignedUsers) {
      for (const assignedUserId of student.assignedUsers) {
        try {
          await this.createNotification({
            recipient: assignedUserId,
            type: 'appointment_added',
            title: 'New Appointment Scheduled',
            message: `${creator?.name || 'Unknown'} scheduled an appointment for student ${student.name}.`,
            data: {
              studentName: student.name,
              creatorName: creator?.name,
              appointmentTitle: appointment.title,
              appointmentTime: appointment.startTime
            },
            relatedStudent: studentId,
            relatedUser: createdBy
          });
          console.log(`[Notification] Appointment added: sent to user ${assignedUserId} for student ${studentId}`);
        } catch (err) {
          console.error(`[Notification] Error sending appointment notification to user ${assignedUserId}:`, err);
        }
      }
    }
  }

  // Progress report added to assigned student
  static async notifyProgressReportAdded(report, studentId, createdBy) {
    const student = await Student.findById(studentId);
    const creator = await User.findById(createdBy);
    // Notify all users assigned to this student (including the creator)
    if (student && student.assignedUsers) {
      for (const assignedUserId of student.assignedUsers) {
        try {
          await this.createNotification({
            recipient: assignedUserId,
            type: 'progress_report_added',
            title: 'New Progress Report',
            message: `${creator?.name || 'Unknown'} added a progress report for student ${student.name}.`,
            data: {
              studentName: student.name,
              creatorName: creator?.name,
              reportCategory: report.category,
              reportDate: report.reportDate
            },
            relatedStudent: studentId,
            relatedUser: createdBy
          });
          console.log(`[Notification] Progress report added: sent to user ${assignedUserId} for student ${studentId}`);
        } catch (err) {
          console.error(`[Notification] Error sending progress report notification to user ${assignedUserId}:`, err);
        }
      }
    }
  }

  // Student assigned to user
  static async notifyStudentAssigned(studentId, assignedUserId, assignedBy) {
    const student = await Student.findById(studentId);
    const assigner = await User.findById(assignedBy);
    
    await this.createNotification({
      recipient: assignedUserId,
      type: 'student_assigned',
      title: 'Student Assigned to You',
      message: `Student ${student?.name || 'Unknown'} has been assigned to you by ${assigner?.name || 'Admin'}.`,
      data: {
        studentName: student?.name,
        assignerName: assigner?.name
      },
      relatedStudent: studentId,
      relatedUser: assignedBy
    });
  }

  // Student unassigned from user
  static async notifyStudentUnassigned(studentId, unassignedUserId, unassignedBy) {
    const student = await Student.findById(studentId);
    const unassigner = await User.findById(unassignedBy);
    
    await this.createNotification({
      recipient: unassignedUserId,
      type: 'student_unassigned',
      title: 'Student Unassigned',
      message: `Student ${student?.name || 'Unknown'} has been unassigned from you by ${unassigner?.name || 'Admin'}.`,
      data: {
        studentName: student?.name,
        unassignerName: unassigner?.name
      },
      relatedStudent: studentId,
      relatedUser: unassignedBy
    });
  }

  // New team member added to student
  static async notifyNewTeamMember(studentId, newUserIds, existingUserId, assignedBy) {
    const student = await Student.findById(studentId);
    const assigner = await User.findById(assignedBy);
    const newUsers = await User.find({ _id: { $in: newUserIds } });
    
    const newUserNames = newUsers.map(user => user.name).join(', ');
    
    await this.createNotification({
      recipient: existingUserId,
      type: 'new_team_member',
      title: 'New Team Member Added',
      message: `${assigner?.name || 'Admin'} added ${newUserNames} to the team for student ${student?.name || 'Unknown'}.`,
      data: {
        studentName: student?.name,
        assignerName: assigner?.name,
        newTeamMembers: newUserNames,
        newUserIds: newUserIds
      },
      relatedStudent: studentId,
      relatedUser: assignedBy
    });
  }

  // New course created
  static async notifyCourseCreated(course, createdBy) {
    const creator = await User.findById(createdBy);
    
    // Notify all users except the creator
    const users = await User.find({ _id: { $ne: createdBy } });
    
    for (const user of users) {
      await this.createNotification({
        recipient: user._id,
        type: 'course_created',
        title: 'New Course Available',
        message: `${creator?.name || 'Unknown'} created a new course: ${course.title}.`,
        data: {
          courseTitle: course.title,
          creatorName: creator?.name
        },
        relatedCourse: course._id,
        relatedUser: createdBy
      });
    }
  }

  // Course published
  static async notifyCoursePublished(course, publishedBy) {
    const publisher = await User.findById(publishedBy);
    
    // Notify all users except the publisher
    const users = await User.find({ _id: { $ne: publishedBy } });
    
    for (const user of users) {
      await this.createNotification({
        recipient: user._id,
        type: 'course_published',
        title: 'Course Published',
        message: `Course "${course.title}" has been published by ${publisher?.name || 'Admin'}.`,
        data: {
          courseTitle: course.title,
          publisherName: publisher?.name
        },
        relatedCourse: course._id,
        relatedUser: publishedBy
      });
    }
  }

  // System announcement
  static async notifySystemAnnouncement(title, message, recipients = null) {
    let users;
    
    if (recipients) {
      users = await User.find({ _id: { $in: recipients } });
    } else {
      users = await User.find();
    }
    
    for (const user of users) {
      await this.createNotification({
        recipient: user._id,
        type: 'system_announcement',
        title,
        message,
        data: {
          isSystemAnnouncement: true
        }
      });
    }
  }

  // Course access request received (for admin)
  static async notifyCourseAccessRequest(accessRequest) {
    const course = await Course.findById(accessRequest.course);
    const requester = await User.findById(accessRequest.user);
    
    // Find admin users
    const adminUsers = await User.find({ isAdmin: true });
    
    for (const admin of adminUsers) {
      await this.createNotification({
        recipient: admin._id,
        type: 'course_access_request',
        title: 'New Course Access Request',
        message: `${requester?.name || 'Unknown'} has requested access to course "${course?.title || 'Unknown'}".`,
        data: {
          courseTitle: course?.title,
          requesterName: requester?.name,
          requestReason: accessRequest.requestReason
        },
        relatedCourse: accessRequest.course,
        relatedUser: accessRequest.user
      });
    }
  }

  // Course access approved
  static async notifyCourseAccessApproved(accessRequest) {
    const course = await Course.findById(accessRequest.course);
    const responder = await User.findById(accessRequest.respondedBy);
    
    await this.createNotification({
      recipient: accessRequest.user,
      type: 'course_access_approved',
      title: 'Course Access Approved',
      message: `Your access request for course "${course?.title || 'Unknown'}" has been approved by ${responder?.name || 'Admin'}.`,
      data: {
        courseTitle: course?.title,
        responderName: responder?.name,
        adminResponse: accessRequest.adminResponse
      },
      relatedCourse: accessRequest.course,
      relatedUser: accessRequest.respondedBy
    });
  }

  // Course access rejected
  static async notifyCourseAccessRejected(accessRequest) {
    const course = await Course.findById(accessRequest.course);
    const responder = await User.findById(accessRequest.respondedBy);
    
    await this.createNotification({
      recipient: accessRequest.user,
      type: 'course_access_rejected',
      title: 'Course Access Rejected',
      message: `Your access request for course "${course?.title || 'Unknown'}" has been rejected by ${responder?.name || 'Admin'}.`,
      data: {
        courseTitle: course?.title,
        responderName: responder?.name,
        adminResponse: accessRequest.adminResponse
      },
      relatedCourse: accessRequest.course,
      relatedUser: accessRequest.respondedBy
    });
  }
}

module.exports = NotificationService; 