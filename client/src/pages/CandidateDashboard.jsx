import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LayoutDashboard, FileText, CheckCircle, Clock, Calendar, ArrowRight, Bookmark, Loader2, Sparkles } from 'lucide-react';

const CandidateDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [stats, setStats] = useState({ totalApplications: 0, savedJobs: 0, interviews: 0, selectedJobs: 0 });
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch applications
      const appRes = await api.get('/candidate/applications');
      let appList = [];
      let total = 0;
      let interviews = 0;
      let selected = 0;
      
      if (appRes.data.success) {
        appList = appRes.data.data;
        setApplications(appList.slice(0, 5));
        total = appList.length;
        interviews = appList.filter(a => a.status === 'Interview').length;
        selected = appList.filter(a => a.status === 'Selected').length;
      }

      // Fetch saved jobs count from real API
      let savedCount = 0;
      try {
        const savedRes = await api.get('/candidate/saved-jobs');
        if (savedRes.data.success) {
          savedCount = savedRes.data.data.length;
        }
      } catch (e) {
        // Saved jobs endpoint may fail if no saved jobs exist
        savedCount = 0;
      }

      setStats({
        totalApplications: total,
        savedJobs: savedCount,
        interviews,
        selectedJobs: selected
      });
    } catch (err) {
      console.error(err);
      addToast('Failed to load candidate stats.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Calculate profile completion based on actual user data
  const getProfileCompletion = () => {
    if (!user) return 0;
    let score = 0;
    const checks = [
      user.user?.name,
      user.user?.email,
      user.profile?.phone,
      user.profile?.location,
      user.profile?.bio,
      user.profile?.skills?.length > 0,
      user.profile?.education,
      user.profile?.experience,
      user.profile?.resume,
    ];
    checks.forEach(c => { if (c) score++; });
    return Math.round((score / checks.length) * 100);
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-xs text-slate-500">Loading dashboard stats...</p>
      </div>
    );
  }

  const profileCompletion = getProfileCompletion();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Welcome back, {user?.user?.name || user?.name}!</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Here is your recruitment application dashboard overview</p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalApplications}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Applications</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Bookmark size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.savedJobs}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Saved Bookmarks</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.interviews}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Interviews</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.selectedJobs}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Selected Offers</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Applications List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 p-6 rounded-2xl shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-3">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText size={18} className="text-blue-600" /> Recent Applications
            </h3>
            <Link to="/applications" className="text-xs text-blue-600 hover:text-blue-500 font-semibold flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <p className="text-xs text-slate-500">You haven't submitted any job applications yet.</p>
              <Link to="/jobs" className="inline-block bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg">
                Explore Jobs
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app._id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl gap-3 transition-all"
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200">{app.jobId?.title || 'Unknown Position'}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{app.jobId?.jobType} &bull; {app.jobId?.employmentType}</p>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
                      <Calendar size={12} />
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                        app.status === 'Selected'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20'
                          : app.status === 'Rejected'
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20'
                          : app.status === 'Interview'
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20'
                          : 'bg-blue-50 text-blue-600 dark:bg-blue-950/20'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-6">
          {/* Profile Completion Card */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white">Profile Completion</h3>
            <p className="text-xs text-slate-500">
              Keep your profile details, education history, and skills updated to improve job recommendations.
            </p>
            {/* Progress bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-350">
                <span>Completion Status</span>
                <span>{profileCompletion}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-750 h-2.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${profileCompletion}%` }}></div>
              </div>
            </div>
            <div className="pt-2">
              <Link
                to="/candidate/profile"
                className="block w-full text-center py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-xs font-semibold transition-all active:scale-97"
              >
                Update Profile Details
              </Link>
            </div>
          </div>

          {/* AI Tools Card */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="text-[#00BE9B]" size={20} />
              <h3 className="font-bold text-slate-900 dark:text-white">AI Career Toolkit</h3>
            </div>
            <p className="text-xs text-slate-500">
              Accelerate your recruitment success using our advanced interactive career tools.
            </p>
            <div className="space-y-2 pt-2">
              <Link
                to="/ai-tools?tool=resume-builder"
                className="block w-full text-center py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md hover:shadow-blue-500/10 transition-all active:scale-97"
              >
                Open AI Career Tools
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
