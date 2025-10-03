"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";

// Inline Modal component
const Modal = ({ isOpen, onClose, children }) => isOpen ? (
  <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
    <div style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 300, position: 'relative' }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 8, right: 8 }}>X</button>
      {children}
    </div>
  </div>
) : null;

const isTrainerOrAdmin = (user) => user && (["trainer", "admin", "specialist_educator"].includes(user.role));

export default function CourseBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [lessonsBySection, setLessonsBySection] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [sectionForm, setSectionForm] = useState({ title: "", description: "" });
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonForm, setLessonForm] = useState({ title: "", lessonType: "video", content: "", sectionId: "" });
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [lessonFile, setLessonFile] = useState<File | null>(null);

  // Fetch user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoadingUser(false);
  }, []);

  // Access control
  useEffect(() => {
    if (!loadingUser && (!user || !isTrainerOrAdmin(user))) {
      router.replace("/dashboard/courses");
    }
  }, [user, loadingUser, router]);

  // Fetch course info
  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/courses/${courseId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setCourse(res.data))
      .catch(err => {
        if (err.response) {
          if (err.response.status === 401 || err.response.status === 403) {
            setError("You are not authorized to view this course. Please log in as a trainer or admin.");
          } else if (err.response.data && err.response.data.message === "No token provided.") {
            setError("Authentication required. Please log in.");
          } else if (err.response.status === 404) {
            setError("Course not found.");
          } else {
            setError("An error occurred: " + (err.response.data?.message || err.message));
          }
        } else {
          setError("An error occurred: " + err.message);
        }
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  // Fetch sections and lessons
  useEffect(() => {
    if (!courseId) return;
    const token = localStorage.getItem("token");
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/course-sections/course/${courseId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setSections(res.data);
        // Fetch lessons for each section
        res.data.forEach(section => {
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/course-lessons/section/${section._id}`, { headers: { Authorization: `Bearer ${token}` } })
            .then(lesRes => setLessonsBySection(prev => ({ ...prev, [section._id]: lesRes.data })));
        });
      });
  }, [courseId]);

  // Section handlers
  const openSectionModal = (section) => {
    console.log("Opening section modal with:", section);
    if (section) {
      setSectionForm({ title: section.title, description: section.description || "" });
      setEditingSectionId(section._id);
    } else {
      setSectionForm({ title: "", description: "" });
      setEditingSectionId(null);
    }
    setShowSectionModal(true);
  };
  const handleSectionFormChange = (e) => {
    setSectionForm({ ...sectionForm, [e.target.name]: e.target.value });
  };
  const handleSectionSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    try {
      if (editingSectionId) {
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/course-sections/${editingSectionId}`, { ...sectionForm }, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        console.log("Creating new section with data:", { ...sectionForm, courseId });
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/course-sections/`, { ...sectionForm, courseId }, { headers: { Authorization: `Bearer ${token}` } });
        console.log("Section created successfully:", response.data);
      }
      setShowSectionModal(false);
      // Refresh sections
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/course-sections/course/${courseId}`, { headers: { Authorization: `Bearer ${token}` } });
      setSections(res.data);
    } catch (error) {
      console.error("Error submitting section:", error);
      if (error.response) {
        console.error("Server error:", error.response.data);
        alert("Error: " + (error.response.data?.message || "Failed to save section"));
      } else {
        alert("Error: " + error.message);
      }
    }
  };
  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm("Are you sure you want to delete this section? This will also delete all its lessons.")) return;
    const token = localStorage.getItem("token");
    await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/course-sections/${sectionId}`, { headers: { Authorization: `Bearer ${token}` } });
    // Refresh sections
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/course-sections/course/${courseId}`, { headers: { Authorization: `Bearer ${token}` } });
    setSections(res.data);
  };
  const moveSection = async (sectionId, direction) => {
    const idx = sections.findIndex((s) => s._id === sectionId);
    if (idx === -1) return;
    const newOrder = [...sections];
    if (direction === "up" && idx > 0) {
      [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
    } else if (direction === "down" && idx < sections.length - 1) {
      [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
    } else {
      return;
    }
    // Update order in backend
    const token = localStorage.getItem("token");
    await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/course-sections/course/${courseId}/reorder`, { sectionOrders: newOrder.map((s, i) => ({ sectionId: s._id, order: i })) }, { headers: { Authorization: `Bearer ${token}` } });
    setSections(newOrder);
  };

  // Lesson handlers
  const openLessonModal = (sectionId, lesson) => {
    if (lesson) {
      setLessonForm({
        title: lesson.title,
        lessonType: lesson.lessonType,
        content: lesson.content || "",
        sectionId: sectionId, // Always set sectionId
      });
      setEditingLessonId(lesson._id);
    } else {
      setLessonForm({ title: "", lessonType: "video", content: "", sectionId }); // Always set sectionId
      setEditingLessonId(null);
    }
    setShowLessonModal(true);
  };
  const handleLessonFormChange = (e) => {
    setLessonForm({ ...lessonForm, [e.target.name]: e.target.value });
  };
  const handleLessonFileChange = (e) => {
    setLessonFile(e.target.files[0]);
  };
  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    // Debug: log lessonForm and lessonFile
    console.log("Submitting lesson:", lessonForm, lessonFile);
    // Prevent submission if required fields are missing
    if (!lessonForm.title || !lessonForm.lessonType || !lessonForm.sectionId) {
      alert("Title, lesson type, and section are required.");
      return;
    }
    if (lessonForm.lessonType === "file" && lessonFile) {
      // Step 1: Upload file
      const uploadForm = new FormData();
      uploadForm.append("file", lessonFile);
      const uploadRes = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/course-lessons/upload/file`,
        uploadForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Step 2: Create lesson with attachment info
      const fileInfo = uploadRes.data;
      const lessonData = {
        ...lessonForm,
        attachments: [
          {
            filename: fileInfo.filename,
            originalName: fileInfo.originalName,
            url: fileInfo.fileUrl,
            fileType: fileInfo.mimetype,
            fileSize: fileInfo.fileSize || fileInfo.size,
            description: ""
          }
        ]
      };
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/course-lessons/`,
        lessonData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } else {
      // Other lesson types (video, text, article)
      let dataToSend: any = { ...lessonForm };
      let config = { headers: { Authorization: `Bearer ${token}` } };
      if (lessonForm.lessonType === "video" && lessonFile) {
        const formData = new FormData();
        formData.append("title", lessonForm.title);
        formData.append("lessonType", lessonForm.lessonType);
        formData.append("sectionId", lessonForm.sectionId);
        if (lessonForm.content) formData.append("content", lessonForm.content);
        formData.append("file", lessonFile);
        dataToSend = formData;
        // Do NOT set Content-Type for FormData; let the browser handle it
        config = { headers: { Authorization: `Bearer ${token}` } };
      }
      if (editingLessonId) {
        await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/course-lessons/${editingLessonId}`, dataToSend, config);
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/course-lessons/`, dataToSend, config);
      }
    }
    setShowLessonModal(false);
    setLessonFile(null);
    // Refresh lessons for the section
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/course-lessons/section/${lessonForm.sectionId}`, { headers: { Authorization: `Bearer ${token}` } });
    setLessonsBySection((prev) => ({ ...prev, [lessonForm.sectionId]: res.data }));
  };
  const handleDeleteLesson = async (lessonId, sectionId) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;
    const token = localStorage.getItem("token");
    await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/course-lessons/${lessonId}`, { headers: { Authorization: `Bearer ${token}` } });
    // Refresh lessons for the section
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/course-lessons/section/${sectionId}`, { headers: { Authorization: `Bearer ${token}` } });
    setLessonsBySection((prev) => ({ ...prev, [sectionId]: res.data }));
  };
  const moveLesson = async (sectionId, lessonId, direction) => {
    const lessons = lessonsBySection[sectionId] || [];
    const idx = lessons.findIndex((l) => l._id === lessonId);
    if (idx === -1) return;
    const newOrder = [...lessons];
    if (direction === "up" && idx > 0) {
      [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
    } else if (direction === "down" && idx < lessons.length - 1) {
      [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
    } else {
      return;
    }
    // Update order in backend
    const token = localStorage.getItem("token");
    await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/course-lessons/section/${sectionId}/reorder`, { lessonOrders: newOrder.map((l, i) => ({ lessonId: l._id, order: i })) }, { headers: { Authorization: `Bearer ${token}` } });
    setLessonsBySection((prev) => ({ ...prev, [sectionId]: newOrder }));
  };

  if (loadingUser || !isTrainerOrAdmin(user)) return <div>Loading...</div>;
  if (error) return <div className="text-red-600 text-center mt-8">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Course Builder</h1>
        {loading ? (
          <div>Loading...</div>
        ) : !course ? (
          <div>Course not found.</div>
        ) : (
          <>
            {/* Course Info */}
            <div className="bg-white rounded shadow p-4 mb-6">
              <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
              <p className="text-gray-700 mb-2">{course.description}</p>
              {course.thumbnailUrl && (
                <img src={course.thumbnailUrl} alt="Thumbnail" className="w-40 h-24 object-cover rounded" />
              )}
              <div className="text-sm text-gray-500 mt-2">
                Status: {course.status} | Created: {new Date(course.createdAt).toLocaleDateString()}
              </div>
            </div>
            {/* Sections & Lessons Outline */}
            <div className="bg-white rounded shadow p-4">
              <h3 className="text-lg font-semibold mb-4">Course Outline</h3>
              <ol className="space-y-6">
                {sections.map((section, sIdx) => (
                  <li key={section._id} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-blue-700">{section.title}</span>
                        {section.description && (
                          <span className="ml-2 text-gray-500">- {section.description}</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button className="btn-secondary btn-xs" onClick={() => openSectionModal(section)}>Edit</button>
                        <button className="btn-danger btn-xs" onClick={() => handleDeleteSection(section._id)}>Delete</button>
                        <button className="btn-xs" onClick={() => moveSection(section._id, "up")} disabled={sIdx === 0}>↑</button>
                        <button className="btn-xs" onClick={() => moveSection(section._id, "down")} disabled={sIdx === sections.length - 1}>↓</button>
                      </div>
                    </div>
                    {/* Lessons in this section */}
                    <ol className="ml-6 mt-2 space-y-2">
                      {(lessonsBySection[section._id] || []).map((lesson, lIdx) => (
                        <li key={lesson._id} className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{lesson.title}</span>
                            <span className="ml-2 text-xs text-gray-500">[{lesson.lessonType}]</span>
                          </div>
                          <div className="flex gap-2">
                            <button className="btn-secondary btn-xs" onClick={() => openLessonModal(section._id, lesson)}>Edit</button>
                            <button className="btn-danger btn-xs" onClick={() => handleDeleteLesson(lesson._id, section._id)}>Delete</button>
                            <button className="btn-xs" onClick={() => moveLesson(section._id, lesson._id, "up")} disabled={lIdx === 0}>↑</button>
                            <button className="btn-xs" onClick={() => moveLesson(section._id, lesson._id, "down")} disabled={lIdx === (lessonsBySection[section._id]?.length || 0) - 1}>↓</button>
                          </div>
                        </li>
                      ))}
                      <li>
                        <button className="btn-primary btn-xs mt-2" onClick={() => openLessonModal(section._id, undefined)}>+ Add Lesson</button>
                      </li>
                    </ol>
                  </li>
                ))}
                <li>
                  <button 
                    className="btn-primary btn-xs mt-4" 
                    onClick={() => {
                      console.log("Add Section button clicked");
                      openSectionModal(undefined);
                    }}
                  >
                    + Add Section
                  </button>
                </li>
              </ol>
            </div>
            {/* Section Modal */}
            <Modal isOpen={showSectionModal} onClose={() => setShowSectionModal(false)}>
              <form onSubmit={handleSectionSubmit} className="space-y-4 p-4">
                <h2 className="text-lg font-semibold mb-2">{editingSectionId ? "Edit Section" : "Add Section"}</h2>
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={sectionForm.title}
                    onChange={handleSectionFormChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    name="description"
                    value={sectionForm.description}
                    onChange={handleSectionFormChange}
                    className="input-field"
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <button type="submit" className="btn-primary">{editingSectionId ? "Save" : "Add"}</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowSectionModal(false)}>Cancel</button>
                </div>
              </form>
            </Modal>
            {/* Lesson Modal */}
            <Modal isOpen={showLessonModal} onClose={() => { setShowLessonModal(false); setLessonFile(null); }}>
              <form onSubmit={handleLessonSubmit}>
                <h2>{editingLessonId ? "Edit Lesson" : "Add Lesson"}</h2>
                <div style={{ marginBottom: 12 }}>
                  <label>Title</label>
                  <input type="text" name="title" value={lessonForm.title} onChange={handleLessonFormChange} required style={{ width: '100%' }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label>Lesson Type</label>
                  <select name="lessonType" value={lessonForm.lessonType} onChange={handleLessonFormChange} style={{ width: '100%' }}>
                    <option value="video">Video</option>
                    <option value="text">Text</option>
                    <option value="file">File</option>
                    <option value="article">Article</option>
                  </select>
                </div>
                {/* Show fields based on lesson type */}
                {lessonForm.lessonType === "video" && (
                  <div style={{ marginBottom: 12 }}>
                    <label>Upload Video</label>
                    <input type="file" accept="video/*" onChange={handleLessonFileChange} />
                  </div>
                )}
                {lessonForm.lessonType === "file" && (
                  <div style={{ marginBottom: 12 }}>
                    <label>Upload File</label>
                    <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt" onChange={handleLessonFileChange} />
                  </div>
                )}
                {(lessonForm.lessonType === "text" || lessonForm.lessonType === "article") && (
                  <div style={{ marginBottom: 12 }}>
                    <label>Content</label>
                    <textarea name="content" value={lessonForm.content} onChange={handleLessonFormChange} style={{ width: '100%' }} rows={5} />
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button type="button" onClick={() => { setShowLessonModal(false); setLessonFile(null); }}>Cancel</button>
                  <button type="submit">{editingLessonId ? "Save" : "Add"}</button>
                </div>
              </form>
            </Modal>
          </>
        )}
      </div>
    </div>
  );
} 