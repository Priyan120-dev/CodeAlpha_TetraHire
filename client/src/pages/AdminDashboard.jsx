import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { ShieldAlert, Users, Briefcase, FileCheck, CheckCircle2, XCircle, Trash2, Calendar, FileText, BarChart, RefreshCw, Loader2 } from 'lucide-react';

const AdminDashboard = () => {
  const { addToast } = useToast();

  const [stats, setStats] = useState({ totalUsers: 0, totalCandidates: 0, totalEmployers: 0, totalJobs: 0, totalApplications: 0, pendingVerifications: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  // Lists state
  const [users, setUsers] = useState([]);
  const [employers, setEmployers] = useState([]); // to show verification requests
  const [jobs, setJobs] = useState([]);
  const [reports, setReports] = useState(null);

  const [usersPage, setUsersPage] = useState(1);
  const [jobsPage, setJobsPage] = useState(1);

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTabContent = async () => {
    try {
      if (activeTab === 'users') {
        const res = await api.get(`/admin/users?page=${usersPage}&limit=10`);
        if (res.data.success) setUsers(res.data.data);
      } else if (activeTab === 'verifications') {
        const res = await api.get('/admin/employer-verifications');
        if (res.data.success) {
          setEmployers(res.data.data);
        }
      } else if (activeTab === 'jobs') {
        const res = await api.get(`/admin/jobs?page=${jobsPage}&limit=10`);
        if (res.data.success) setJobs(res.data.data);
      } else if (activeTab === 'reports') {
        const res = await api.get('/admin/reports');
        if (res.data.success) setReports(res.data.data);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load tab contents.', 'error');
    }
  };

  const loadAll = async () => {
    setLoading(true);
    await fetchDashboardStats();
    await fetchTabContent();
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, [activeTab, usersPage, jobsPage]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user permanently? This will erase all profiles, applications, and logs.')) return;
    try {
      const res = await api.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        addToast('User deleted successfully.', 'success');
        fetchTabContent();
        fetchDashboardStats();
      }
    } catch (err) {
      addToast('Failed to delete user.', 'error');
    }
  };

  const handleVerifyEmployer = async (employerId, status) => {
    try {
      const res = await api.put(`/admin/employers/${employerId}/verify`, { status });
      if (res.data.success) {
        addToast(`Employer verification status updated to ${status}.`, 'success');
        fetchTabContent();
        fetchDashboardStats();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Verification update failed.', 'error');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting permanently?')) return;
    try {
      const res = await api.delete(`/admin/jobs/${jobId}`);
      if (res.data.success) {
        addToast('Job posting deleted permanently.', 'success');
        fetchTabContent();
        fetchDashboardStats();
      }
    } catch (err) {
      addToast('Failed to delete job.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-xs text-slate-500">Loading admin suite...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="text-red-500 shrink-0" size={26} /> System Admin Panel
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage users, verify employers, and review platform reports</p>
        </div>
        <button
          onClick={loadAll}
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-250 p-2.5 hover:bg-slate-50 flex items-center justify-center min-w-[40px] min-h-[40px]"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm text-center">
          <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.totalUsers}</p>
          <p className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Total Users</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm text-center">
          <p className="text-xl font-bold text-blue-600">{stats.totalCandidates}</p>
          <p className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Candidates</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm text-center">
          <p className="text-xl font-bold text-indigo-600">{stats.totalEmployers}</p>
          <p className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Employers</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm text-center">
          <p className="text-xl font-bold text-emerald-600">{stats.totalJobs}</p>
          <p className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Jobs Posted</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm text-center">
          <p className="text-xl font-bold text-sky-600">{stats.totalApplications}</p>
          <p className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Applications</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm text-center">
          <p className="text-xl font-bold text-red-500 animate-pulse">{stats.pendingVerifications}</p>
          <p className="text-[9px] font-bold text-slate-455 uppercase tracking-wider">Pending Verification</p>
        </div>
      </div>

      {/* Tabs - horizontally scrollable on mobile */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 gap-1 overflow-x-auto no-scrollbar">
        {['users', 'verifications', 'jobs', 'reports'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-2 text-xs sm:text-sm font-bold capitalize transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-250'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl shadow-sm overflow-hidden p-6">
        {activeTab === 'users' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Registered Accounts</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-500 border-collapse">
                <thead className="text-xs text-slate-750 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-2.5">Name</th>
                    <th className="px-4 py-2.5">Email</th>
                    <th className="px-4 py-2.5">Role</th>
                    <th className="px-4 py-2.5">Joined</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-750 text-xs">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                      <td className="px-4 py-3 font-bold text-slate-850 dark:text-slate-200">{u.name}</td>
                      <td className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'admin' ? 'bg-red-50 text-red-650' : u.role === 'employer' ? 'bg-indigo-50 text-indigo-650' : 'bg-blue-50 text-blue-650'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="text-[11px] text-rose-600 hover:text-rose-500 font-bold flex items-center justify-end gap-1 ml-auto"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'verifications' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Employer Verification Reviews</h3>
            <p className="text-xs text-slate-550">Review and verify employer access status. Verification status allows employers to publish job posts.</p>
            
            {/* List verification requests */}
            <div className="space-y-4 mt-4">
              {employers.map((emp) => (
                <div key={emp._id} className="p-4 border border-slate-200/60 dark:border-slate-700/60 rounded-xl bg-slate-50/40 dark:bg-slate-900/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200">{emp.companyName || emp.name}</h4>
                    <p className="text-xs text-slate-500">{emp.email}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                      emp.verificationStatus === 'Verified'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                        : emp.verificationStatus === 'Rejected'
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400'
                        : 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
                    }`}>
                      {emp.verificationStatus}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVerifyEmployer(emp._id, 'Verified')}
                      disabled={emp.verificationStatus === 'Verified'}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <FileCheck size={14} /> Verify
                    </button>
                    <button
                      onClick={() => handleVerifyEmployer(emp._id, 'Rejected')}
                      disabled={emp.verificationStatus === 'Rejected'}
                      className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))}
              {employers.length === 0 && (
                <p className="text-xs text-slate-500">No employer verification requests available.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">All Platform Jobs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-500 border-collapse">
                <thead className="text-xs text-slate-750 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-2.5">Title</th>
                    <th className="px-4 py-2.5">Location</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-750 text-xs">
                  {jobs.map((j) => (
                    <tr key={j._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-bold text-slate-850 dark:text-slate-200">{j.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{j.category}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{j.location}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          j.status === 'Open' ? 'bg-emerald-50 text-emerald-650' : 'bg-rose-50 text-rose-650'
                        }`}>
                          {j.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteJob(j._id)}
                          className="text-[11px] text-rose-600 hover:text-rose-500 font-bold flex items-center justify-end gap-1 ml-auto"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reports' && reports && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Reports & Activity Aggregation</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Users size={14} className="text-blue-500" /> Signup Trends by Role
                </h4>
                <div className="space-y-2 text-xs">
                  {reports.signupTrend?.map((trend, i) => (
                    <div key={i} className="flex justify-between p-2 bg-slate-50 dark:bg-slate-900/40 rounded">
                      <span className="font-semibold">{trend._id.role.toUpperCase()} (Month {trend._id.month}/{trend._id.year})</span>
                      <span className="font-bold text-slate-700 dark:text-slate-250">{trend.count} signups</span>
                    </div>
                  ))}
                  {(!reports.signupTrend || reports.signupTrend.length === 0) && (
                    <p className="text-slate-400">No trend logs found.</p>
                  )}
                </div>
              </div>

              <div className="border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart size={14} className="text-indigo-500" /> Applications Status Distribution
                </h4>
                <div className="space-y-2 text-xs">
                  {reports.applicationStatuses?.map((stat, i) => (
                    <div key={i} className="flex justify-between p-2 bg-slate-50 dark:bg-slate-900/40 rounded">
                      <span className="font-semibold">{stat._id || 'Applied'}</span>
                      <span className="font-bold text-slate-700 dark:text-slate-250">{stat.count} items</span>
                    </div>
                  ))}
                  {(!reports.applicationStatuses || reports.applicationStatuses.length === 0) && (
                    <p className="text-slate-400">No application status data.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
