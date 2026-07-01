import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { Building, Globe, MapPin, Users, Briefcase, Calendar, ChevronRight, Loader2 } from 'lucide-react';

const CompanyDetails = () => {
  const { employerId } = useParams();
  const { addToast } = useToast();

  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyAndJobs = async () => {
      try {
        // Fetch company profile details
        const compRes = await api.get(`/candidate/company/${employerId}`);
        if (compRes.data.success) {
          setCompany(compRes.data.data);
        }

        // Fetch jobs posted by this employer
        const jobsRes = await api.get(`/candidate/jobs?employerId=${employerId}`);
        if (jobsRes.data.success) {
          setJobs(jobsRes.data.data);
        }
      } catch (err) {
        console.error(err);
        addToast('Failed to load company details.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyAndJobs();
  }, [employerId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-xs text-slate-500">Loading company details...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <h2 className="text-xl font-bold text-slate-855 dark:text-white">Company Profile Not Found</h2>
        <p className="text-xs text-slate-500">The requested employer profile does not exist or has been disabled.</p>
        <Link to="/jobs" className="inline-block bg-blue-600 text-white text-xs font-semibold px-5 py-2.5 rounded-lg">
          Back to Listings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Profile Info */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 p-6 md:p-8 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={company.logo ? `http://localhost:5000/${company.logo}` : '/default-company-logo.png'}
            alt={company.companyName}
            onError={(e) => {
              e.target.src = 'https://api.dicebear.com/7.x/initials/svg?seed=' + company.companyName;
            }}
            className="h-16 w-16 rounded-2xl object-cover border border-slate-150 shadow-sm"
          />
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{company.companyName}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-semibold">
              <span className="flex items-center gap-1"><Building size={14} /> {company.industry || 'General Sector'}</span>
              <span className="flex items-center gap-1"><MapPin size={14} /> {company.location || 'HQ Location'}</span>
              <span className="flex items-center gap-1"><Users size={14} /> {company.companySize || '1-10'} employees</span>
            </div>
          </div>
        </div>

        {company.website && (
          <a
            href={company.website}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-slate-200 dark:border-slate-700 px-5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 flex items-center gap-1 shadow-sm w-full md:w-auto text-center justify-center"
          >
            <Globe size={14} /> Visit Website
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Biography description */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 p-6 md:p-8 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">About the Company</h3>
            <p className="text-sm text-slate-650 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {company.description || 'No detailed biography provided for this company.'}
            </p>
          </div>
        </div>

        {/* Active Open Positions list */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b pb-2">Active Positions</h3>
          {jobs.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No open job postings available at this time.</p>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <Link
                  key={job._id}
                  to={`/jobs/${job._id}`}
                  className="block p-3 rounded-lg border border-slate-100 dark:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-850 dark:text-slate-200 truncate max-w-[160px]">{job.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{job.jobType} &bull; {job.location}</p>
                    </div>
                    <ChevronRight size={14} className="text-slate-400 mt-1 shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDetails;
