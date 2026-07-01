import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { FileText, Calendar, CheckCircle2, AlertTriangle, Trash2, ArrowRight, Loader2 } from 'lucide-react';

const Applications = () => {
  const { addToast } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/candidate/applications');
      if (res.data.success) {
        setApplications(res.data.data);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load job applications.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) return;
    try {
      const res = await api.delete(`/candidate/applications/${appId}`);
      if (res.data.success) {
        addToast('Application withdrawn successfully.', 'success');
        setApplications(applications.filter(app => app._id !== appId));
      }
    } catch (err) {
      addToast('Failed to withdraw application.', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Selected':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-350 dark:border-emerald-900';
      case 'Rejected':
        return 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/20 dark:text-rose-350 dark:border-rose-900';
      case 'Interview':
        return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/20 dark:text-amber-350 dark:border-amber-900';
      case 'Shortlisted':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-350 dark:border-indigo-900';
      case 'Under Review':
        return 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/20 dark:text-sky-350 dark:border-sky-900';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200 dark:bg-slate-900 dark:text-slate-350 dark:border-slate-850';
    }
  };

  const statusSteps = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected'];

  const getStepIndex = (status) => {
    if (status === 'Rejected') return -1;
    return statusSteps.indexOf(status);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-xs text-slate-500">Loading submitted applications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="text-blue-600" /> My Applications
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Track the status timeline of your submitted job proposals</p>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 p-12 text-center rounded-2xl shadow-sm">
          <p className="text-base font-bold text-slate-850 dark:text-slate-200">No applications found</p>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            You haven't submitted any job proposals yet. Find jobs that fit your skillset and apply.
          </p>
          <Link to="/jobs" className="mt-4 inline-block bg-blue-600 text-white px-5 py-2 text-xs font-semibold rounded-lg">
            Find Openings
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => {
            const job = app.jobId;
            if (!job) return null;
            const currentStep = getStepIndex(app.status);

            return (
              <div
                key={app._id}
                className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm space-y-6"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-750 pb-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{job.title}</h3>
                    <p className="text-xs text-slate-500">{job.jobType} &bull; {job.location}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                      <Calendar size={12} /> Applied: {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg border text-xs font-bold ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                    {app.status === 'Applied' && (
                      <button
                        onClick={() => handleWithdraw(app._id)}
                        className="text-slate-400 hover:text-rose-650 p-1"
                        title="Withdraw Application"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Timeline */}
                {app.status === 'Rejected' ? (
                  <div className="p-4 bg-rose-50 border border-rose-200 dark:bg-rose-950/20 dark:border-rose-900 rounded-xl flex gap-3 items-center">
                    <AlertTriangle className="text-rose-500" size={18} />
                    <p className="text-xs text-rose-800 dark:text-rose-350">
                      We appreciate your interest in this position. Unfortunately, the company has chosen not to move forward with your application at this time.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hiring Status Timeline</p>
                    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-2">
                      {statusSteps.map((step, idx) => (
                        <div key={step} className="flex-1 flex items-center gap-2">
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                            idx <= currentStep
                              ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
                              : 'bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-900 dark:border-slate-800'
                          }`}>
                            {idx < currentStep ? '✓' : idx + 1}
                          </div>
                          <span className={`text-xs font-semibold ${
                            idx <= currentStep ? 'text-slate-850 dark:text-slate-200' : 'text-slate-400'
                          }`}>
                            {step}
                          </span>
                          {idx < statusSteps.length - 1 && (
                            <div className={`hidden sm:block flex-1 h-0.5 transition-colors ${
                              idx < currentStep ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'
                            }`} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Link
                    to={`/jobs/${job._id}`}
                    className="text-xs font-bold text-blue-600 hover:text-blue-550 flex items-center gap-1"
                  >
                    View Original Job Posting <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Applications;
