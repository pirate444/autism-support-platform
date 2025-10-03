"use client";

import React, { useState } from "react";
import axios from "axios";
import { apiUrl, getAuthHeaders } from '../../../../utils/api';
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const courseCategories = [
  "autism awareness",
  "teaching strategies",
  "behavioral management",
  "communication skills",
  "sensory integration",
  "social skills training",
  "parent support",
  "assessment methods",
];

export default function CourseBuilderPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    category: "",
    duration: "",
    courseType: "text",
    videoUrl: "",
    thumbnailUrl: "",
    isFree: true,
    price: "",
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Only allow trainers
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;
      if (!user || user.role !== "specialist_educator") {
        toast.error("Only trainers can create courses.");
        router.replace("/dashboard/courses");
      }
    }
  }, [router]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleVideoUpload = async () => {
    if (!videoFile) {
      toast.error("Please select a video file");
      return;
    }
    setUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append("video", videoFile);
      const response = await axios.post(
        apiUrl('/api/courses/upload/video'),
        formData,
        {
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setForm((prev) => ({ ...prev, videoUrl: response.data.videoUrl }));
      toast.success("Video uploaded successfully!");
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to upload video";
      toast.error(message);
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleThumbnailUpload = async () => {
    if (!thumbnailFile) {
      toast.error("Please select a thumbnail image");
      return;
    }
    setUploadingThumbnail(true);
    try {
      const formData = new FormData();
      formData.append("thumbnail", thumbnailFile);
      const response = await axios.post(
        apiUrl('/api/courses/upload/thumbnail'),
        formData,
        {
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setForm((prev) => ({ ...prev, thumbnailUrl: response.data.thumbnailUrl }));
      toast.success("Thumbnail uploaded successfully!");
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to upload thumbnail";
      toast.error(message);
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Validate price for paid courses
    if (!form.isFree && (!form.price || parseFloat(form.price) <= 0)) {
      toast.error("Please enter a valid price for paid courses");
      return;
    }
    
    setSubmitting(true);
    try {
      const courseData = {
        ...form,
        duration: parseInt(form.duration) || 0,
        isFree: form.isFree,
        price: form.isFree ? 0 : parseFloat(form.price),
      };
      await axios.post(
        apiUrl('/api/courses/'),
        courseData,
        { headers: getAuthHeaders() }
      );
      toast.success("Course created successfully!");
      router.replace("/dashboard/courses");
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to create course";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Create New Course</h1>
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Title *
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleFormChange}
                className="input-field"
                placeholder="Enter course title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Type
              </label>
              <select
                name="courseType"
                value={form.courseType}
                onChange={handleFormChange}
                className="input-field"
              >
                <option value="text">Text-based Course</option>
                <option value="video">Video Course</option>
                <option value="mixed">Mixed Content</option>
              </select>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleFormChange}
                className="input-field"
              >
                <option value="">Select category</option>
                {courseCategories.map((category) => (
                  <option key={category} value={category}>
                    {category.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                name="duration"
                value={form.duration}
                onChange={handleFormChange}
                className="input-field"
                placeholder="Estimated duration in minutes"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Pricing
              </label>
              <select
                name="isFree"
                value={form.isFree.toString()}
                onChange={(e) => setForm({ ...form, isFree: e.target.value === 'true' })}
                className="input-field"
              >
                <option value="true">Free Course</option>
                <option value="false">Paid Course</option>
              </select>
            </div>
            {!form.isFree && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (USD)
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleFormChange}
                  className="input-field"
                  placeholder="Enter price in USD"
                  min="0"
                  step="0.01"
                  required={!form.isFree}
                />
              </div>
            )}
          </div>
          {!form.isFree && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-yellow-800 text-xs font-bold">!</span>
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Paid Course Notice
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      This course will require admin approval for user access. Users will need to submit access requests that you can approve or reject through the admin panel.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleFormChange}
              className="input-field"
              rows={3}
              placeholder="Describe the course content and objectives"
              required
            />
          </div>
          {(form.courseType === "video" || form.courseType === "mixed") && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900">Video Content</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Video File
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                      className="input-field flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleVideoUpload}
                      disabled={!videoFile || uploadingVideo}
                      className="btn-primary px-4 py-2 disabled:opacity-50"
                    >
                      {uploadingVideo ? "Uploading..." : "Upload"}
                    </button>
                  </div>
                  {form.videoUrl && (
                    <div className="mt-2">
                      <p className="text-sm text-green-600">✓ Video uploaded</p>
                      <video src={form.videoUrl} controls style={{ maxWidth: 300, marginTop: 8 }} />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Thumbnail
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                      className="input-field flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleThumbnailUpload}
                      disabled={!thumbnailFile || uploadingThumbnail}
                      className="btn-primary px-4 py-2 disabled:opacity-50"
                    >
                      {uploadingThumbnail ? "Uploading..." : "Upload"}
                    </button>
                  </div>
                  {form.thumbnailUrl && (
                    <div className="mt-2">
                      <p className="text-sm text-green-600">✓ Thumbnail uploaded</p>
                      <img src={form.thumbnailUrl} alt="Thumbnail" style={{ maxWidth: 120, marginTop: 8 }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Content
            </label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleFormChange}
              className="input-field"
              rows={6}
              placeholder="Enter detailed course content, instructions, or additional notes"
            />
          </div>
          <div className="flex gap-4">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Creating..." : "Create Course"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => router.replace("/dashboard/courses")}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 