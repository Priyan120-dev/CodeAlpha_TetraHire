import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Mail, Phone, MapPin, Award, BookOpen, FileText, Upload, Trash2, Key, Loader2 } from 'lucide-react';


const LinkedInIcon = ({ size = 15, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GitHubIcon = ({ size = 15, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const CandidateProfile = () => {
  const { user, fetchUserProfile } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');

  // Profile fields state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  // Resume upload state
  const [resumes, setResumes] = useState([]);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setLocation(user.location || '');
      setBio(user.bio || '');
      setSkills(user.skills ? (Array.isArray(user.skills) ? user.skills.join(', ') : user.skills) : '');
      setProfileImage(user.profileImage || '');
      setLinkedin(user.linkedin || '');
      setGithub(user.github || '');
      fetchResumes();
    }
  }, [user]);

  const fetchResumes = async () => {
    if (!user || user.role !== 'candidate') return;
    try {
      const res = await api.get('/candidate/resumes');
      if (res.data.success) {
        setResumes(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addToast('Image size should be less than 2MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const parsedSkills = skills.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
      const res = await api.put('/auth/profile', {
        name,
        phone,
        location,
        bio,
        skills: parsedSkills,
        profileImage,
        linkedin,
        github,
      });

      if (res.data.success) {
        addToast('Profile updated successfully!', 'success');
        await fetchUserProfile();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadResume = async (e) => {
    e.preventDefault();
    if (!resumeFile) return;

    setUploadingResume(true);
    const formData = new FormData();
    formData.append('resume', resumeFile);

    try {
      const res = await api.post('/candidate/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        addToast('Resume uploaded successfully!', 'success');
        setResumeFile(null);
        fetchResumes();
        await fetchUserProfile();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Upload failed. Check file size/format.', 'error');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const res = await api.put('/auth/change-password', { currentPassword, newPassword });
    if (res.data.success) {
      addToast('Password changed successfully.', 'success');
      setCurrentPassword('');
      setNewPassword('');
    }
  };

  const handleDownloadResume = async (resumeId, fileName) => {
    try {
      const response = await api.get(`/candidate/resumes/${resumeId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      addToast('Resume downloaded successfully.', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to download resume.', 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Nav */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-4 shadow-sm h-fit space-y-2">
          {[
            { id: 'profile', label: 'My Profile', icon: User },
            { id: 'resumes', label: 'Manage Resumes', icon: FileText },
            { id: 'security', label: 'Change Password', icon: Key },
          ].map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeSection === sec.id
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
            >
              <sec.icon size={16} /> {sec.label}
            </button>
          ))}
        </div>

        {/* Right Content Column */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 p-6 md:p-8 rounded-2xl shadow-sm">
          {activeSection === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-6 text-sm text-slate-800 dark:text-slate-200">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Profile Details</h2>

              {/* Profile Image Section */}
              <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="relative group">
                  <img
                    src={profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
                    alt="Profile Preview"
                    className="h-24 w-24 rounded-full object-cover border-4 border-white dark:border-slate-850 shadow-md ring-2 ring-[#00BE9B]/20"
                  />
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-200">
                    <Upload size={18} className="text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="text-center sm:text-left space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200">Profile Image</h3>
                  <p className="text-[11px] text-slate-400 max-w-[280px]">Upload a professional JPG or PNG. Image will be saved to your profile.</p>
                  <div className="flex gap-2 justify-center sm:justify-start">
                    <label className="text-xs font-semibold text-[#00BE9B] hover:text-[#00BE9B]/90 bg-[#00BE9B]/10 hover:bg-[#00BE9B]/20 px-3 py-1.5 rounded-lg cursor-pointer transition-all">
                      Choose File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    {profileImage && (
                      <button
                        type="button"
                        onClick={() => setProfileImage('')}
                        className="text-xs font-semibold text-red-500 hover:text-red-655 bg-red-50 dark:bg-red-950/20 px-3 py-1.5 rounded-lg transition-all"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-550 dark:text-slate-400">Full Name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-3 text-slate-450" />
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-9 pr-3 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-550 dark:text-slate-400">Phone Number</label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-3 text-slate-450" />
                    <input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-9 pr-3 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-550 dark:text-slate-400">Location</label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3 top-3 text-slate-450" />
                    <input
                      type="text"
                      placeholder="e.g. Remote / Boston, MA"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-9 pr-3 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-550 dark:text-slate-400">Key Skills (Comma separated)</label>
                  <div className="relative">
                    <Award size={15} className="absolute left-3 top-3 text-slate-450" />
                    <input
                      type="text"
                      placeholder="React, Tailwind CSS, Node.js"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-9 pr-3 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-550 dark:text-slate-400">Biography / Summary</label>
                <textarea
                  rows={4}
                  placeholder="Tell employers about your professional history, targets, and expertise..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-250"
                ></textarea>
              </div>

              {/* Social profiles row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-550 dark:text-slate-400">LinkedIn Profile URL</label>
                  <div className="relative">
                    <LinkedInIcon size={15} className="absolute left-3 top-3 text-[#0a66c2]" />
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-9 pr-3 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-550 dark:text-slate-400">GitHub Profile URL</label>
                  <div className="relative">
                    <GitHubIcon size={15} className="absolute left-3 top-3 text-slate-800 dark:text-slate-200" />
                    <input
                      type="url"
                      placeholder="https://github.com/username"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-9 pr-3 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 px-6 rounded-lg shadow-md hover:shadow-blue-500/10 active:scale-97 transition-all"
              >
                {loading ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          )}

          {activeSection === 'resumes' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">My Resumes</h2>
              <p className="text-xs text-slate-500">Upload PDF versions of your CV. You can select from these when applying for open positions.</p>

              {/* Upload form */}
              <form onSubmit={handleUploadResume} className="border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 bg-slate-50/40 dark:bg-slate-900/10 flex flex-col md:flex-row justify-between items-center gap-4 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Upload size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-850 dark:text-slate-200">Upload New Resume</h4>
                    <p className="text-[10px] text-slate-400">PDF formats only, Max 5MB file size</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto items-stretch">
                  <input
                    type="file"
                    required
                    accept=".pdf"
                    onChange={(e) => setResumeFile(e.target.files[0])}
                    className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <button
                    type="submit"
                    disabled={uploadingResume}
                    className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 px-5 shadow-sm active:scale-95 transition-all"
                  >
                    {uploadingResume ? 'Uploading...' : 'Upload CV'}
                  </button>
                </div>
              </form>

              {/* List */}
              <div className="space-y-3 pt-4">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-350 border-b pb-2">Uploaded Files</h3>
                {resumes.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No resumes uploaded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {resumes.map((res) => (
                      <div
                        key={res._id}
                        className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <FileText size={15} className="text-blue-500" />
                          <span className="font-semibold text-slate-850 dark:text-slate-250 truncate max-w-[200px]">{res.fileName}</span>
                          <span className="text-[9px] text-slate-400">({new Date(res.uploadedAt).toLocaleDateString()})</span>
                        </div>
                        <button
                          onClick={() => handleDownloadResume(res._id, res.fileName)}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-500"
                        >
                          Download PDF
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <form onSubmit={handleChangePassword} className="space-y-6 text-sm text-slate-800 dark:text-slate-200">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Change Password</h2>

              <div className="space-y-1.5 max-w-sm">
                <label className="text-xs font-bold text-slate-550 dark:text-slate-400">Current Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5 max-w-sm">
                <label className="text-xs font-bold text-slate-550 dark:text-slate-400">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={changingPass}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 px-6 rounded-lg shadow-md hover:shadow-blue-500/10 active:scale-97 transition-all"
              >
                {changingPass ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;
