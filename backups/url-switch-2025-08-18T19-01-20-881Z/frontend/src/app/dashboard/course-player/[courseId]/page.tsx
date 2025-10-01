"use client"

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

interface Lesson {
  _id: string;
  title: string;
  lessonType: "video" | "article" | "file";
}

interface Section {
  _id: string;
  title: string;
  lessons: Lesson[];
}

interface LessonDetail {
  _id: string;
  title: string;
  lessonType: "video" | "article" | "file";
  videoUrl?: string;
  articleContent?: string;
  fileUrl?: string;
  fileName?: string;
  attachments?: { url: string; originalName?: string; filename?: string }[];
}

export default function CoursePlayerPage() {
  const params = useParams();
  const courseId = params?.courseId;

  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [lessonDetail, setLessonDetail] = useState<LessonDetail | null>(null);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonError, setLessonError] = useState("");
  const [courseProgress, setCourseProgress] = useState<{ progress: number; completedLessons: string[] }>({ progress: 0, completedLessons: [] });
  const [progressLoading, setProgressLoading] = useState(false);

  useEffect(() => {
    const fetchSectionsAndLessons = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch sections for the course
        const token = localStorage.getItem("token");
        const sectionRes = await axios.get(
          `http://localhost:8080/api/course-sections/course/${courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const sectionsData = sectionRes.data;
        // Fetch lessons for each section
        const sectionsWithLessons = await Promise.all(
          sectionsData.map(async (section: any) => {
            const lessonRes = await axios.get(
              `http://localhost:8080/api/course-lessons/section/${section._id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            return {
              ...section,
              lessons: lessonRes.data || [],
            };
          })
        );
        setSections(sectionsWithLessons);
      } catch (err: any) {
        setError("Failed to load sections or lessons.");
      } finally {
        setLoading(false);
      }
    };
    if (courseId) fetchSectionsAndLessons();
  }, [courseId]);

  // Fetch lesson detail when selectedLessonId changes
  useEffect(() => {
    const fetchLessonDetail = async () => {
      if (!selectedLessonId) return;
      setLessonLoading(true);
      setLessonError("");
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:8080/api/course-lessons/${selectedLessonId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLessonDetail(res.data);
      } catch (err: any) {
        setLessonError("Failed to load lesson content.");
        setLessonDetail(null);
      } finally {
        setLessonLoading(false);
      }
    };
    fetchLessonDetail();
  }, [selectedLessonId]);

  // Fetch course progress
  useEffect(() => {
    const fetchProgress = async () => {
      if (!courseId) return;
      setProgressLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:8080/api/courses/${courseId}/progress`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCourseProgress(res.data);
      } catch (err) {
        setCourseProgress({ progress: 0, completedLessons: [] });
      } finally {
        setProgressLoading(false);
      }
    };
    fetchProgress();
  }, [courseId]);

  // Mark lesson as complete
  const handleMarkComplete = async () => {
    if (!selectedLessonId) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8080/api/courses/${courseId}/progress`,
        { lessonId: selectedLessonId, isCompleted: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Lesson marked as complete!");
      // Refresh progress
      const res = await axios.get(
        `http://localhost:8080/api/courses/${courseId}/progress`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCourseProgress(res.data);
    } catch (err) {
      toast.error("Failed to mark lesson as complete.");
    }
  };

  // Defensive check for completedLessons
  const isLessonCompleted =
    selectedLessonId &&
    Array.isArray(courseProgress.completedLessons) &&
    courseProgress.completedLessons.includes(selectedLessonId);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar: Sections & Lessons */}
      <aside className="w-72 bg-white border-r p-6 hidden md:block">
        <h2 className="text-lg font-bold mb-4">Sections & Lessons</h2>
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : sections.length === 0 ? (
          <div className="text-gray-400">No sections found.</div>
        ) : (
          <ul className="space-y-4">
            {sections.map((section) => (
              <li key={section._id}>
                <div className="font-semibold text-primary-700 mb-1">{section.title}</div>
                <ul className="ml-4 space-y-1">
                  {section.lessons.length === 0 ? (
                    <li className="text-xs text-gray-400">No lessons</li>
                  ) : (
                    section.lessons.map((lesson) => (
                      <li
                        key={lesson._id}
                        className={`text-sm text-gray-700 hover:underline cursor-pointer ${selectedLessonId === lesson._id ? 'font-bold text-primary-700' : ''}`}
                        onClick={() => setSelectedLessonId(lesson._id)}
                      >
                        {lesson.title} <span className="text-xs text-gray-400">({lesson.lessonType})</span>
                      </li>
                    ))
                  )}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </aside>
      {/* Main Content Area */}
      <main className="flex-1 p-8 bg-gray-50 min-h-screen flex flex-col items-center">
        {/* Progress Bar */}
        <div className="mb-8 w-full max-w-3xl">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-semibold text-gray-700">Course Progress</span>
            <span className="text-xs text-gray-600">{progressLoading ? '...' : `${courseProgress.progress || 0}%`}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${courseProgress.progress || 0}%` }}
            ></div>
          </div>
        </div>
        <div className="w-full max-w-3xl">
          <h1 className="text-3xl font-bold mb-6 text-center">Course Player</h1>
          {/* Lesson Content */}
          {selectedLessonId ? (
            lessonLoading ? (
              <div className="text-gray-400 text-center">Loading lesson...</div>
            ) : lessonError ? (
              <div className="text-red-500 text-center">{lessonError}</div>
            ) : lessonDetail ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
                <h2 className="text-2xl font-semibold mb-4 text-center">{lessonDetail.title}</h2>
                {lessonDetail.lessonType === "video" && (
                  lessonDetail.videoUrl ? (
                    <div className="w-full flex justify-center mb-6">
                      <video controls src={lessonDetail.videoUrl} className="rounded-xl shadow-lg w-full max-w-2xl aspect-video bg-black" />
                    </div>
                  ) : Array.isArray(lessonDetail.attachments) && lessonDetail.attachments.length > 0 ? (
                    <div className="w-full flex justify-center mb-6">
                      <video controls src={lessonDetail.attachments[0].url} className="rounded-xl shadow-lg w-full max-w-2xl aspect-video bg-black" />
                    </div>
                  ) : (
                    <div className="text-red-500 mb-4 text-center">No video available for this lesson.</div>
                  )
                )}
                {lessonDetail.lessonType === "article" && lessonDetail.articleContent && (
                  <div className="prose max-w-none mb-4" dangerouslySetInnerHTML={{ __html: lessonDetail.articleContent }} />
                )}
                {lessonDetail.lessonType === "file" && Array.isArray(lessonDetail.attachments) && lessonDetail.attachments.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {lessonDetail.attachments.map((file, idx) => (
                      <a
                        key={idx}
                        href={file.url}
                        download={file.originalName || file.filename || `lesson-file-${idx+1}`}
                        className="btn-primary inline-block"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download {file.originalName || file.filename || `File ${idx+1}`}
                      </a>
                    ))}
                  </div>
                )}
                {/* Mark as Complete Button */}
                <button
                  className={`mt-6 px-8 py-3 rounded-full text-lg font-semibold transition bg-primary-600 text-white shadow hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400 ${isLessonCompleted ? 'opacity-60 cursor-not-allowed' : ''}`}
                  onClick={handleMarkComplete}
                  disabled={isLessonCompleted}
                >
                  {isLessonCompleted ? "Completed" : "Mark as Complete"}
                </button>
              </div>
            ) : null
          ) : (
            <div className="text-gray-400 text-center">Select a lesson to view its content.</div>
          )}
        </div>
      </main>
    </div>
  );
}