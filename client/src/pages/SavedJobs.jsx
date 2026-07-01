import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { Bookmark, MapPin, DollarSign, Trash2, ArrowRight, Loader2, Building } from 'lucide-react';

const SavedJobs = () => {
  const { addToast } = useToast();
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedJobs = async () => {
    try {
      const res = await api.get('/candidate/saved-jobs');
      if (res.data.success) {
        setSavedItems(res.data.data);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to fetch saved jobs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const handleRemove = async (jobId) => {
    try {
      const res = await api.delete(`/candidate/saved-jobs/${jobId}`);
      if (res.data.success) {
        addToast('Saved job removed successfully.', 'success');
        setSavedItems(savedItems.filter(item => item.jobId._id !== jobId));
      }
    } catch (err) {
      addToast('Failed to remove saved job.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-xs text-slate-500">Loading saved bookmarks...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Bookmark className="text-blue-600" /> Bookmarked Positions
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage and track jobs you have saved for later review</p>
      </div>

      {savedItems.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 p-12 text-center rounded-2xl shadow-sm">
          <p className="text-base font-bold text-slate-850 dark:text-slate-200">No saved jobs</p>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Browse open positions on the job board and bookmark roles you are interested in.
          </p>
          <Link to="/jobs" className="mt-4 inline-block bg-blue-600 text-white px-5 py-2 text-xs font-semibold rounded-lg">
            Explore Job Postings
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedItems.map((item) => {
            const job = item.jobId;
            if (!job) return null;
            return (
              <div
                key={item._id}
                className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={job.companyLogo ? `http://localhost:5000/${job.companyLogo}` : '/default-company-logo.png'}
                        alt={job.companyName}
                        onError={(e) => {
                          e.target.src = 'https://api.dicebear.com/7.x/initials/svg?seed=' + job.companyName;
                        }}
                        className="h-10 w-10 rounded-xl object-cover border shrink-0"
                      />
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate" title={job.title}>
                          {job.title}
                        </h3>
                        <p className="text-[11px] text-slate-550 dark:text-slate-400 truncate flex items-center gap-0.5 mt-0.5">
                          <Building size={10} /> {job.companyName}
                        </p>
                        
                        {/* Source Badge */}
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                            item.source === 'Employer'
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
                              : 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400'
                          }`}
                        >
                          {item.source === 'Employer' ? 'Employer Job' : 'Imported Job'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(job._id)}
                      className="text-slate-450 hover:text-rose-600 transition-colors p-1 shrink-0"
                      title="Remove Bookmark"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p 
                    className="text-xs text-slate-655 dark:text-slate-350 line-clamp-2 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: job.description?.replace(/<[^>]*>/g, '') }}
                  ></p>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-700/60 mt-4 pt-4 flex justify-between items-center text-xs">
                  <span className="text-slate-550 flex items-center gap-1 min-w-0">
                    <MapPin size={12} className="shrink-0" /> 
                    <span className="truncate">{job.location}</span>
                  </span>
                  <div className="flex items-center gap-3 shrink-0">
                    {job.salary ? (
                      <span className="font-bold text-slate-800 dark:text-slate-250 flex items-center">
                        <DollarSign size={12} /> {job.salary.toLocaleString()}
                      </span>
                    ) : (
                      <span className="font-semibold text-slate-400 uppercase text-[10px]">
                        Negotiable
                      </span>
                    )}
                    <Link
                      to={`/jobs/${job._id}`}
                      className="rounded-lg bg-slate-50 hover:bg-blue-600 hover:text-white dark:bg-slate-900 dark:hover:bg-blue-600 dark:hover:text-white p-2 transition-all"
                    >
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
