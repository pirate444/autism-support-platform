"use client"

import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  specialization?: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  location?: string;
  dateOfBirth?: string;
  gender?: string;
  qualifications?: string;
  yearsOfExperience?: number;
  workplace?: string;
  childName?: string;
  childAge?: number;
  childDiagnosis?: string;
  school?: string;
  grade?: string;
  supportNeeds?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: "",
    specialization: "",
    phone: "",
    bio: "",
    location: "",
    dateOfBirth: "",
    gender: "",
    qualifications: "",
    yearsOfExperience: "",
    workplace: "",
    childName: "",
    childAge: "",
    childDiagnosis: "",
    school: "",
    grade: "",
    supportNeeds: ""
  });
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Get user from localStorage
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "null") : null;
  const userId = user?.id;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`https://autism-support-platform-production.up.railway.app/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
        setForm({
          name: res.data.name || "",
          specialization: res.data.specialization || "",
          phone: res.data.phone || "",
          bio: res.data.bio || "",
          location: res.data.location || "",
          dateOfBirth: res.data.dateOfBirth ? res.data.dateOfBirth.substring(0, 10) : "",
          gender: res.data.gender || "",
          qualifications: res.data.qualifications || "",
          yearsOfExperience: res.data.yearsOfExperience?.toString() || "",
          workplace: res.data.workplace || "",
          childName: res.data.childName || "",
          childAge: res.data.childAge?.toString() || "",
          childDiagnosis: res.data.childDiagnosis || "",
          school: res.data.school || "",
          grade: res.data.grade || "",
          supportNeeds: res.data.supportNeeds || ""
        });
      } catch (err) {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchProfile();
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `https://autism-support-platform-production.up.railway.app/api/users/${userId}`,
        {
          name: form.name,
          specialization: form.specialization,
          phone: form.phone,
          bio: form.bio,
          location: form.location,
          dateOfBirth: form.dateOfBirth,
          gender: form.gender,
          qualifications: form.qualifications,
          yearsOfExperience: form.yearsOfExperience ? parseInt(form.yearsOfExperience) : undefined,
          workplace: form.workplace,
          childName: form.childName,
          childAge: form.childAge ? parseInt(form.childAge) : undefined,
          childDiagnosis: form.childDiagnosis,
          school: form.school,
          grade: form.grade,
          supportNeeds: form.supportNeeds
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(res.data);
      setEditMode(false);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || !userId) return;
    setAvatarUploading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      const res = await axios.post(
        `https://autism-support-platform-production.up.railway.app/api/users/${userId}/avatar`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            // Remove Content-Type header - let browser set it automatically for FormData
          } 
        }
      );
      setProfile(res.data.user);
      setAvatarFile(null);
      toast.success("Avatar updated!");
    } catch (err: any) {
      console.error("Avatar upload error:", err);
      const errorMessage = err.response?.data?.message || "Failed to upload avatar.";
      toast.error(errorMessage);
    } finally {
      setAvatarUploading(false);
    }
  };

  if (loading) return <div className="p-8">Loading profile...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!profile) return <div className="p-8">No profile found.</div>;

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <div className="bg-white rounded-lg shadow p-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-6 mb-6">
          <div>
            {profile.avatar ? (
              <img src={`https://autism-support-platform-production.up.railway.app${profile.avatar}`} alt="Avatar" className="w-20 h-20 rounded-full object-cover border" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-400 border">
                <span>{profile.name[0]}</span>
              </div>
            )}
          </div>
          <div>
            <input type="file" accept="image/*" onChange={handleAvatarChange} />
            <button
              type="button"
              className="btn-primary mt-2"
              onClick={handleAvatarUpload}
              disabled={!avatarFile || avatarUploading}
            >
              {avatarUploading ? "Uploading..." : "Upload Avatar"}
            </button>
          </div>
        </div>
        {/* Main Profile Form */}
        <form onSubmit={handleSave}>
          {/* Universal Fields */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            {editMode ? (
              <input type="text" name="name" value={form.name} onChange={handleChange} className="input-field" required />
            ) : (
              <div className="text-gray-900 font-semibold">{profile.name}</div>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="text-gray-900">{profile.email}</div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <div className="text-gray-900 capitalize">{profile.role.replace(/_/g, ' ')}</div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            {editMode ? (
              <input type="text" name="phone" value={form.phone} onChange={handleChange} className="input-field" />
            ) : (
              <div className="text-gray-900">{profile.phone || <span className="text-gray-400">N/A</span>}</div>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            {editMode ? (
              <input type="text" name="location" value={form.location} onChange={handleChange} className="input-field" />
            ) : (
              <div className="text-gray-900">{profile.location || <span className="text-gray-400">N/A</span>}</div>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            {editMode ? (
              <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} className="input-field" />
            ) : (
              <div className="text-gray-900">{profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : <span className="text-gray-400">N/A</span>}</div>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            {editMode ? (
              <select name="gender" value={form.gender} onChange={handleChange} className="input-field">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            ) : (
              <div className="text-gray-900">{profile.gender || <span className="text-gray-400">N/A</span>}</div>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            {editMode ? (
              <textarea name="bio" value={form.bio} onChange={handleChange} className="input-field" rows={3} />
            ) : (
              <div className="text-gray-900 whitespace-pre-line">{profile.bio || <span className="text-gray-400">N/A</span>}</div>
            )}
          </div>
          {/* Professional Fields */}
          {(profile.role === "child_psychiatrist" || profile.role === "psychologist" || profile.role === "speech_therapist" || profile.role === "occupational_therapist" || profile.role === "specialist_educator" || profile.role === "school_support_assistant") && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                {editMode ? (
                  <input type="text" name="specialization" value={form.specialization} onChange={handleChange} className="input-field" />
                ) : (
                  <div className="text-gray-900">{profile.specialization || <span className="text-gray-400">N/A</span>}</div>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualifications</label>
                {editMode ? (
                  <input type="text" name="qualifications" value={form.qualifications} onChange={handleChange} className="input-field" />
                ) : (
                  <div className="text-gray-900">{profile.qualifications || <span className="text-gray-400">N/A</span>}</div>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                {editMode ? (
                  <input type="number" name="yearsOfExperience" value={form.yearsOfExperience} onChange={handleChange} className="input-field" />
                ) : (
                  <div className="text-gray-900">{profile.yearsOfExperience || <span className="text-gray-400">N/A</span>}</div>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Workplace</label>
                {editMode ? (
                  <input type="text" name="workplace" value={form.workplace} onChange={handleChange} className="input-field" />
                ) : (
                  <div className="text-gray-900">{profile.workplace || <span className="text-gray-400">N/A</span>}</div>
                )}
              </div>
            </>
          )}
          {/* Parent Fields */}
          {profile.role === "parent" && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Child's Name</label>
                {editMode ? (
                  <input type="text" name="childName" value={form.childName} onChange={handleChange} className="input-field" />
                ) : (
                  <div className="text-gray-900">{profile.childName || <span className="text-gray-400">N/A</span>}</div>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Child's Age</label>
                {editMode ? (
                  <input type="number" name="childAge" value={form.childAge} onChange={handleChange} className="input-field" />
                ) : (
                  <div className="text-gray-900">{profile.childAge || <span className="text-gray-400">N/A</span>}</div>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                {editMode ? (
                  <input type="text" name="childDiagnosis" value={form.childDiagnosis} onChange={handleChange} className="input-field" />
                ) : (
                  <div className="text-gray-900">{profile.childDiagnosis || <span className="text-gray-400">N/A</span>}</div>
                )}
              </div>
            </>
          )}
          {/* Student Fields */}
          {profile.role === "student" && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
                {editMode ? (
                  <input type="text" name="school" value={form.school} onChange={handleChange} className="input-field" />
                ) : (
                  <div className="text-gray-900">{profile.school || <span className="text-gray-400">N/A</span>}</div>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                {editMode ? (
                  <input type="text" name="grade" value={form.grade} onChange={handleChange} className="input-field" />
                ) : (
                  <div className="text-gray-900">{profile.grade || <span className="text-gray-400">N/A</span>}</div>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Support Needs</label>
                {editMode ? (
                  <input type="text" name="supportNeeds" value={form.supportNeeds} onChange={handleChange} className="input-field" />
                ) : (
                  <div className="text-gray-900">{profile.supportNeeds || <span className="text-gray-400">N/A</span>}</div>
                )}
              </div>
            </>
          )}
          <div className="flex gap-4 mt-6">
            {editMode ? (
              <>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setEditMode(false)} disabled={saving}>
                  Cancel
                </button>
              </>
            ) : (
              <button type="button" className="btn-primary" onClick={() => setEditMode(true)}>
                Edit Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
} 