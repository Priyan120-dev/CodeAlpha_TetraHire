import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Building, Globe, Users, Briefcase, FileText, Upload, Key, Loader2 } from 'lucide-react';

const EmployerProfile = () => {
  const { user, fetchUserProfile } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('company');

  // Company profile fields
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [industry, setIndustry] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  // Logo upload state
  const [logoFile, setLogoFile] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    if (user) {
      setCompanyName(user.companyName || '');
      setWebsite(user.website || '');
      setCompanySize(user.companySize || '1-10');
      setIndustry(user.industry || '');
      setDescription(user.description || '');
      setLocation(user.location || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', {
        companyName,
        website,
        companySize,
        industry,
        description,
        location,
      });

      if (res.data.success) {
        addToast('Company profile updated successfully!', 'success');
        await fetchUserProfile();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadLogo = async (e) => {
    e.preventDefault();
    if (!logoFile) return;

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append('logo', logoFile);

    try {
      const res = await api.post('/employer/upload-logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        addToast('Company logo updated successfully!', 'success');
        setLogoFile(null);
        await fetchUserProfile();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Upload failed. Check file dimensions/size.', 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangingPass(true);
    try {
      const res = await api.put('/auth/change-password', { currentPassword, newPassword });
      if (res.data.success) {
        addToast('Password changed successfully.', 'success');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to change password.', 'error');
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Nav */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-4 shadow-sm h-fit space-y-2">
          {[
            { id: 'company', label: 'Company Profile', icon: Building },
            { id: 'logo', label: 'Upload Logo', icon: Upload },
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
          {activeSection === 'company' && (
            <form onSubmit={handleUpdateProfile} className="space-y-6 text-sm text-slate-800 dark:text-slate-200">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Company Profile Details</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-550 dark:text-slate-400">Company Name</label>
                  <div className="relative">
                    <Building size={15} className="absolute left-3 top-3 text-slate-450" />
                    <input
                      type="text"
                      required
                      placeholder="Acme Corporation"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-9 pr-3 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-550 dark:text-slate-400">Website URL</label>
                  <div className="relative">
                    <Globe size={15} className="absolute left-3 top-3 text-slate-450" />
                    <input
                      type="url"
                      placeholder="https://acme.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-9 pr-3 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-550 dark:text-slate-400">Location (City, Country)</label>
                  <input
                    type="text"
                    placeholder="Boston, MA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-550 dark:text-slate-400">Company Size</label>
                  <select
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs outline-none focus:border-blue-500 text-slate-800 dark:text-slate-250"
                  >
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="500+">500+ employees</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-550 dark:text-slate-400">Industry Sector</label>
                  <input
                    type="text"
                    placeholder="Software, Finance, Biotech..."
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-550 dark:text-slate-400">Company Bio / Description</label>
                <textarea
                  rows={5}
                  placeholder="Explain what your company does, your products, your vision..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-250"
                ></textarea>
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

          {activeSection === 'logo' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Company Logo</h2>
              <p className="text-xs text-slate-500">Upload your company brand identity icon/logo. Supported formats: JPG, PNG. Max 2MB.</p>

              {user?.logo && (
                <div className="flex items-center gap-4 p-4 border border-slate-100 dark:border-slate-800 rounded-xl">
                  <img
                    src={`http://localhost:5000/${user.logo}`}
                    alt="Company logo preview"
                    className="h-16 w-16 rounded-xl object-cover border"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-850 dark:text-slate-250">Active Brand Logo</h4>
                    <p className="text-[10px] text-slate-400">This is shown publicly on job boards</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleUploadLogo} className="border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 bg-slate-50/40 dark:bg-slate-900/10 flex flex-col sm:flex-row justify-between items-center gap-4 transition-colors">
                <input
                  type="file"
                  required
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files[0])}
                  className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <button
                  type="submit"
                  disabled={uploadingLogo}
                  className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 px-5 shadow-sm active:scale-95 transition-all"
                >
                  {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                </button>
              </form>
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

export default EmployerProfile;
