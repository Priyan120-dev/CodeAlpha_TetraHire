import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { MapPin, Briefcase, DollarSign, Calendar, Send, Bookmark, BookmarkCheck, ChevronLeft, ArrowUpRight, CheckCircle, Ban, Loader2, Globe, Building } from 'lucide-react';

const JobDetails = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [resumeUploadFile, setResumeUploadFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  const fetchJobDetails = async () => {
    try {
      const res = await api.get(`/candidate/jobs/${jobId}`);
      if (res.data.success) {
        setJob(res.data.data);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load job details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationAndSavedStatus = async () => {
    if (!user || user.role !== 'candidate') return;

    try {
      // Fetch applications to see if candidate already applied
      const appRes = await api.get('/candidate/applications');
      if (appRes.data.success) {
        const found = appRes.data.data.find((app) => app.jobId?._id === jobId);
        if (found) setHasApplied(true);
      }

      // Check saved jobs
      const savedRes = await api.get('/candidate/saved-jobs');
      if (savedRes.data.success) {
        const foundSaved = savedRes.data.data.some((item) => item.jobId?._id === jobId);
        if (foundSaved) setIsSaved(true);
      }

      // Fetch uploaded resumes
      const resRes = await api.get('/candidate/resumes');
      if (resRes.data.success) {
        setResumes(resRes.data.data);
        if (resRes.data.data.length > 0) {
          setSelectedResumeId(resRes.data.data[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  useEffect(() => {
    if (user && user.role === 'candidate') {
      checkApplicationAndSavedStatus();
    }
  }, [user, jobId]);

  const handleSaveJob = async () => {
    if (!user) {
      addToast('Please login to save jobs.', 'warning');
      return navigate('/login');
    }

    try {
      if (isSaved) {
        await api.delete(`/candidate/saved-jobs/${jobId}`);
        setIsSaved(false);
        addToast('Job removed from saved bookmarks.', 'success');
      } else {
        await api.post('/candidate/saved-jobs', { jobId });
        setIsSaved(true);
        addToast('Job saved to bookmarks successfully!', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Action failed.', 'error');
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeUploadFile) return;

    setUploadingResume(true);
    const formData = new FormData();
    formData.append('resume', resumeUploadFile);

    try {
      const res = await api.post('/candidate/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        addToast('Resume uploaded successfully!', 'success');
        // Refresh resumes list
        const resRes = await api.get('/candidate/resumes');
        if (resRes.data.success) {
          setResumes(resRes.data.data);
          setSelectedResumeId(res.data.data._id);
        }
        setResumeUploadFile(null);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to upload resume.', 'error');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!selectedResumeId) {
      addToast('Please select or upload a resume to apply.', 'warning');
      return;
    }

    setApplying(true);
    try {
      const res = await api.post('/candidate/apply', {
        jobId,
        resumeId: selectedResumeId,
        coverLetter,
      });
      if (res.data.success) {
        addToast('Application submitted successfully!', 'success');
        setHasApplied(true);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Application failed.', 'error');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-xs text-slate-500">Loading position details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Position Not Found</h2>
        <p className="text-xs text-slate-500">This job may have expired or been removed by the employer.</p>
        <Link to="/jobs" className="inline-block bg-blue-600 text-white text-xs font-semibold px-5 py-2.5 rounded-lg">
          Back to Listings
        </Link>
      </div>
    );
  }

  const isImported = job.source === 'Arbeitnow';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 lg:pb-10 space-y-6">
      {/* Back link */}
      <Link to="/jobs" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">
        <ChevronLeft size={14} /> Back to Job List
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Job Info Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-5 md:p-8 shadow-sm space-y-5">
            {/* Header: badges + title + save */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                    {job.category}
                  </span>
                  {/* Source Badge */}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isImported
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                    }`}
                  >
                    {isImported ? 'Arbeitnow' : 'TetraHire'}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                  {job.title}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                  <Building size={13} /> {job.companyName}
                </p>
              </div>
              <button
                onClick={handleSaveJob}
                className={`p-2.5 rounded-xl border flex items-center justify-center transition-all shrink-0 min-w-[40px] min-h-[40px] ${
                  isSaved
                    ? 'border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-400'
                    : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-850'
                }`}
              >
                {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
              </button>
            </div>

            {/* Quick Details row */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl transition-colors duration-200">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Job Type</p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                  <Briefcase size={12} className="text-blue-600" /> {job.jobType}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contract</p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                  <Briefcase size={12} className="text-blue-600" /> {job.employmentType}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Salary Range</p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                  <DollarSign size={12} className="text-blue-600" /> {job.salary ? `$${job.salary.toLocaleString()}` : 'Negotiable'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Posted Date</p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                  <Calendar size={12} className="text-blue-600" /> {new Date(job.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Job Description</h3>
              <p 
                className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: job.description }}
              ></p>
            </div>

            {job.skillsRequired && job.skillsRequired.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Skills Required / Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skillsRequired.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Apply & Employer column - hidden on mobile, visible on desktop */}
        <div className="hidden lg:block space-y-6">
          {/* Apply Card */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 p-6 rounded-2xl shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Submit Application</h3>

            {isImported ? (
              // Apply Flow for Arbeitnow jobs
              <div className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  You are being redirected to the employer's official careers page to apply for this job.
                </p>
                <a
                  href={job.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs py-3 rounded-lg flex items-center justify-center gap-1.5 shadow-md active:scale-97 transition-all"
                >
                  Apply on Official Site <ArrowUpRight size={14} />
                </a>
              </div>
            ) : (
              // Existing TetraHire apply flow for Employer jobs
              !user ? (
                <div className="space-y-3 text-center py-2">
                  <p className="text-xs text-slate-500">Sign in as a candidate to apply for this job post.</p>
                  <Link to="/login" className="block w-full bg-blue-600 text-white py-2.5 rounded-lg text-xs font-semibold hover:bg-blue-700">
                    Login & Apply
                  </Link>
                </div>
              ) : user.role !== 'candidate' ? (
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-center flex flex-col items-center gap-2 border border-slate-200/40 dark:border-slate-700/40">
                  <Ban className="text-amber-500" size={24} />
                  <p className="text-xs text-slate-500">
                    Only candidates can submit applications. You are logged in as an <strong>{user.role}</strong>.
                  </p>
                </div>
              ) : hasApplied ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-xl text-center flex flex-col items-center gap-2">
                  <CheckCircle className="text-emerald-500" size={24} />
                  <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Already Applied</p>
                  <p className="text-[11px] text-slate-500">You can track your application status in the dashboard.</p>
                  <Link to="/applications" className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-500 flex items-center gap-1">
                    View Applications <ArrowUpRight size={12} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {resumes.length === 0 ? (
                    <form onSubmit={handleResumeUpload} className="space-y-3 border border-dashed border-slate-200 dark:border-slate-700 p-4 rounded-xl">
                      <p className="text-xs text-slate-500 text-center">You haven't uploaded any resumes yet. Upload one now to apply.</p>
                      <input
                        type="file"
                        required
                        accept=".pdf"
                        onChange={(e) => setResumeUploadFile(e.target.files[0])}
                        className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <button
                        type="submit"
                        disabled={uploadingResume}
                        className="w-full bg-blue-600 text-white text-xs font-semibold py-2 rounded-lg hover:bg-blue-700"
                      >
                        {uploadingResume ? 'Uploading...' : 'Upload PDF'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleApply} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Select Resume</label>
                        <select
                          value={selectedResumeId}
                          onChange={(e) => setSelectedResumeId(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs outline-none focus:border-blue-500 text-slate-800 dark:text-slate-250"
                        >
                          {resumes.map((res) => (
                            <option key={res._id} value={res._id}>
                              {res.fileName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Cover Letter (Optional)</label>
                        <textarea
                          rows={4}
                          placeholder="Why do you think you are a fit for this position..."
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs outline-none focus:border-blue-500 text-slate-800 dark:text-slate-250"
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        disabled={applying}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-md hover:shadow-blue-500/10 active:scale-97 transition-all"
                      >
                        {applying ? 'Submitting...' : 'Submit Application'} <Send size={13} />
                      </button>
                    </form>
                  )}
                </div>
              )
            )}
          </div>

          {/* Employer / Info Card */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Company Details</h3>
            <div className="flex items-center gap-3">
              <img
                src={job.companyLogo ? `http://localhost:5000/${job.companyLogo}` : '/default-company-logo.png'}
                alt={job.companyName}
                onError={(e) => {
                  e.target.src = 'https://api.dicebear.com/7.x/initials/svg?seed=' + job.companyName;
                }}
                className="h-12 w-12 rounded-xl object-cover border border-slate-100 dark:border-slate-700"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">{job.companyName}</h4>
                {isImported ? (
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-500 font-semibold flex items-center gap-1 mt-0.5"
                  >
                    View Job Source <Globe size={12} />
                  </a>
                ) : (
                  job.companyWebsite && (
                    <a
                      href={job.companyWebsite}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-500 font-semibold"
                    >
                      Visit Website
                    </a>
                  )
                )}
              </div>
            </div>
            
            {isImported ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                This is an externally imported job listing from the Arbeitnow Job Board. Application reviews and hiring procedures are managed directly on their site.
              </p>
            ) : (
              <>
                {job.companyDescription && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-4 mt-2">
                    {job.companyDescription}
                  </p>
                )}
                <Link
                  to={`/company/${job.employerId}`}
                  className="block w-full border border-slate-200 dark:border-slate-700 text-center py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-250 hover:bg-slate-50 dark:hover:bg-slate-850"
                >
                  View Company Profile
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Apply Bar */}
      {user && user.role === 'candidate' && !hasApplied && !isImported && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 py-3 safe-area-inset-bottom">
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            <button
              onClick={handleSaveJob}
              className={`p-3 rounded-xl border flex items-center justify-center transition-all shrink-0 min-w-[46px] ${
                isSaved
                  ? 'border-blue-200 bg-blue-50 text-blue-600'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
            </button>
            <button
              onClick={handleApply}
              disabled={applying || !selectedResumeId}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-sm py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-97 transition-all"
            >
              {applying ? 'Submitting...' : 'Submit Application'} <Send size={15} />
            </button>
          </div>
        </div>
      )}
      {user && user.role === 'candidate' && hasApplied && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-emerald-600/95 backdrop-blur-md border-t border-emerald-700 px-4 py-3">
          <div className="flex items-center justify-center gap-2 text-white text-sm font-semibold">
            <CheckCircle size={18} /> Application Submitted
          </div>
        </div>
      )}
      {isImported && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 py-3">
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm py-3 rounded-xl text-center"
          >
            Apply on Official Site <ArrowUpRight size={14} className="inline" />
          </a>
        </div>
      )}
    </div>
  );
};

export default JobDetails;
