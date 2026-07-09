import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Plus, Briefcase, Users, CheckCircle, Ban, Edit, Trash2, Calendar, FileText, ChevronRight, X, User, ArrowRight, Loader2 } from 'lucide-react';

const EmployerDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [stats, setStats] = useState({ activeJobs: 0, closedJobs: 0, totalApplicants: 0, averageApplicantsPerJob: 0 });
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [applicantsModalOpen, setApplicantsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  // Form state for posting a job
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    jobType: 'Remote',
    employmentType: 'Full Time',
    salary: '',
    experience: '',
    skillsRequired: '',
    category: 'Technology',
    deadline: '',
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsRes = await api.get('/employer/dashboard');
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      // Fetch employer jobs
      const jobsRes = await api.get('/employer/jobs');
      if (jobsRes.data.success) {
        setJobs(jobsRes.data.data);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/employer/jobs', formData);
      if (res.data.success) {
        addToast('New job position posted successfully!', 'success');
        setPostModalOpen(false);
        setFormData({
          title: '',
          description: '',
          location: '',
          jobType: 'Remote',
          employmentType: 'Full Time',
          salary: '',
          experience: '',
          skillsRequired: '',
          category: 'Technology',
          deadline: '',
        });
        fetchDashboardData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to post job. Make sure you are verified.', 'error');
    }
  };

  const handleSoftDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      const res = await api.delete(`/employer/jobs/${jobId}`);
      if (res.data.success) {
        addToast('Job posting deleted successfully.', 'success');
        fetchDashboardData();
      }
    } catch (err) {
      addToast('Failed to delete job.', 'error');
    }
  };

  const handleCloseJob = async (jobId) => {
    try {
      const res = await api.put(`/employer/jobs/${jobId}/close`);
      if (res.data.success) {
        addToast('Job status changed to Closed.', 'success');
        fetchDashboardData();
      }
    } catch (err) {
      addToast('Failed to close job.', 'error');
    }
  };

  const viewApplicants = async (job) => {
    setSelectedJob(job);
    setApplicantsModalOpen(true);
    setLoadingApplicants(true);
    try {
      const res = await api.get(`/employer/jobs/${job._id}/applicants`);
      if (res.data.success) {
        setApplicants(res.data.data);
      }
    } catch (err) {
      addToast('Failed to load applicants.', 'error');
    } finally {
      setLoadingApplicants(false);
    }
  };

  const updateApplicantStatus = async (appId, status) => {
    try {
      const res = await api.put(`/employer/applications/${appId}/status`, { status });
      if (res.data.success) {
        addToast(`Status updated to ${status}.`, 'success');
        if (selectedJob) {
          const freshRes = await api.get(`/employer/jobs/${selectedJob._id}/applicants`);
          if (freshRes.data.success) setApplicants(freshRes.data.data);
        }
      }
    } catch (err) {
      addToast('Failed to update applicant status.', 'error');
    }
  };

  const handleDownloadResume = async (resumeId, candidateName) => {
    try {
      const response = await api.get(`/employer/resumes/${resumeId}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${candidateName}_Resume.pdf`);
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-xs text-slate-500">Loading employer console...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Employer Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">Post open roles, manage applicants, and check hiring metrics</p>
        </div>
        <button
          onClick={() => setPostModalOpen(true)}
          className="w-full sm:w-auto rounded-xl bg-blue-600 text-white text-sm font-semibold px-5 py-3 flex items-center justify-center gap-1.5 hover:bg-blue-700 shadow-md hover:shadow-blue-500/10 active:scale-95 transition-all min-h-[48px]"
        >
          <Plus size={16} /> Post a Job
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Briefcase size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.activeJobs}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Jobs</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Ban size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.closedJobs}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Closed Jobs</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalApplicants}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Applicants</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.averageApplicantsPerJob}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Applicants / Job</p>
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-white">Active Postings</h3>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-sm text-slate-500">You haven't posted any jobs yet.</p>
            <button
              onClick={() => setPostModalOpen(true)}
              className="rounded-lg bg-blue-600 text-white px-4 py-2 text-xs font-semibold"
            >
              Post Your First Job
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400 border-collapse">
              <thead className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3">Job Details</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Deadline</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-950 dark:text-white">{job.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{job.category} &bull; {job.employmentType}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium">{job.location}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          job.status === 'Open'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20'
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20'
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium">{new Date(job.deadline).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => viewApplicants(job)}
                        className="text-xs text-blue-600 hover:text-blue-500 font-bold"
                      >
                        Applicants
                      </button>
                      {job.status === 'Open' && (
                        <button
                          onClick={() => handleCloseJob(job._id)}
                          className="text-xs text-slate-500 hover:text-slate-600 font-medium"
                        >
                          Close
                        </button>
                      )}
                      <button
                        onClick={() => handleSoftDelete(job._id)}
                        className="text-xs text-rose-600 hover:text-rose-500 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Post Job Modal */}
      {postModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl p-6 md:p-8 relative max-h-[90vh] overflow-y-auto animate-fade-in">
            <button
              onClick={() => setPostModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Post a New Job</h2>
            <form onSubmit={handlePostJob} className="space-y-4 text-sm text-slate-800 dark:text-slate-250">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Job Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Software Engineer"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:border-blue-500 text-slate-800 dark:text-slate-250"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:border-blue-500 text-slate-800 dark:text-slate-250"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                    <option value="Design">Design</option>
                    <option value="Sales">Sales</option>
                    <option value="Customer Support">Customer Support</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Detailed Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Explain responsibilities, requirements..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:border-blue-500 text-slate-800 dark:text-slate-250"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Remote, Boston, MA"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:border-blue-500 text-slate-800 dark:text-slate-250"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Salary (Annual USD)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 85000"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:border-blue-500 text-slate-800 dark:text-slate-250"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Job Type</label>
                  <select
                    value={formData.jobType}
                    onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:border-blue-500 text-slate-800 dark:text-slate-250"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Onsite">Onsite</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Contract</label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:border-blue-500 text-slate-800 dark:text-slate-250"
                  >
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Application Deadline</label>
                  <input
                    type="date"
                    required
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:border-blue-500 text-slate-800 dark:text-slate-250"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Skills Required (Comma separated)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. JavaScript, React, Node.js"
                  value={formData.skillsRequired}
                  onChange={(e) => setFormData({ ...formData, skillsRequired: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 outline-none focus:border-blue-500 text-slate-800 dark:text-slate-250"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setPostModalOpen(false)}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 px-5 py-2 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 text-white px-6 py-2 hover:bg-blue-700 font-semibold shadow-md"
                >
                  Create Posting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Applicants List Modal */}
      {applicantsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl p-6 md:p-8 relative max-h-[90vh] overflow-y-auto animate-fade-in">
            <button
              onClick={() => setApplicantsModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Applicants for "{selectedJob?.title}"
            </h2>
            <p className="text-xs text-slate-500 mb-6">Review candidate resumes and update application statuses</p>

            {loadingApplicants ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-blue-600" size={24} />
              </div>
            ) : applicants.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-350">No applications received yet</p>
                <p className="text-xs text-slate-500">Active candidates will appear here once they submit resumes.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applicants.map((app) => (
                  <div
                    key={app._id}
                    className="p-5 border border-slate-200/60 dark:border-slate-700/60 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={app.candidateId?.profileImage ? `http://localhost:5000/${app.candidateId.profileImage}` : '/default-profile.png'}
                          alt={app.candidateId?.name}
                          onError={(e) => {
                            e.target.src = 'https://api.dicebear.com/7.x/initials/svg?seed=' + app.candidateId?.name;
                          }}
                          className="h-10 w-10 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{app.candidateId?.name}</h4>
                          <p className="text-xs text-slate-500">{app.candidateId?.email}</p>
                        </div>
                      </div>
                      {app.coverLetter && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                          "{app.coverLetter}"
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-0 pt-3 md:pt-0 border-slate-100">
                      {app.resumeId && (
                        <button
                          onClick={() => handleDownloadResume(app.resumeId._id, app.candidateId?.name)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-500 flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg"
                        >
                          <FileText size={14} /> Download CV
                        </button>
                      )}
                      <select
                        value={app.status}
                        onChange={(e) => updateApplicantStatus(app._id, e.target.value)}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs outline-none font-semibold text-slate-700 dark:text-slate-300"
                      >
                        <option value="Applied">Applied</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Interview">Interview</option>
                        <option value="Selected">Selected</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerDashboard;
