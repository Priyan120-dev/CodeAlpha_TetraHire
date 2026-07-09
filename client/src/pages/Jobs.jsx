import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { Search, MapPin, Briefcase, DollarSign, Calendar, SlidersHorizontal, ArrowRight, Globe, Building } from 'lucide-react';

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useToast();
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [limit] = useState(6);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [jobType, setJobType] = useState(searchParams.get('jobType') || '');
  const [employmentType, setEmploymentType] = useState(searchParams.get('employmentType') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: searchParams.get('search') || '',
        location: searchParams.get('location') || '',
        jobType: searchParams.get('jobType') || '',
        employmentType: searchParams.get('employmentType') || '',
        category: searchParams.get('category') || '',
      };

      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== '')
      );

      const res = await api.get('/candidate/jobs', { params: cleanParams });
      if (res.data.success) {
        setJobs(res.data.data);
        setTotal(res.data.total || res.data.count || 0);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load jobs list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [searchParams, page]);

  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    const newParams = {};
    if (search) newParams.search = search;
    if (location) newParams.location = location;
    if (jobType) newParams.jobType = jobType;
    if (employmentType) newParams.employmentType = employmentType;
    if (category) newParams.category = category;
    newParams.page = '1';
    setPage(1);
    setSearchParams(newParams);
    setShowFiltersMobile(false);
  };

  const handleClearFilters = () => {
    setSearch('');
    setLocation('');
    setJobType('');
    setEmploymentType('');
    setCategory('');
    setPage(1);
    setSearchParams({});
    setShowFiltersMobile(false);
  };

  const totalPages = Math.ceil(total / limit);

  // Skeleton Card component for loading state
  const SkeletonCard = () => (
    <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm space-y-4 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-20"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-24"></div>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-1">
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
      </div>
      <div className="flex gap-1.5 pt-1">
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-12"></div>
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
      </div>
      <div className="border-t border-slate-100 dark:border-slate-700/60 pt-4 flex justify-between items-center">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Explore Open Positions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Discover and apply to verified jobs on TetraHire</p>
        </div>
        <button
          onClick={() => setShowFiltersMobile(!showFiltersMobile)}
          className="md:hidden flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200"
        >
          <SlidersHorizontal size={16} /> Filters
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar/Drawer */}
        <div
          className={`${
            showFiltersMobile
              ? 'fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-end justify-center lg:static lg:bg-transparent lg:backdrop-blur-none lg:flex-none lg:z-auto'
              : 'hidden lg:block'
          } lg:col-span-1`}
          onClick={() => setShowFiltersMobile(false)}
        >
          <div
            className="w-full max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-800 p-6 rounded-t-3xl border border-slate-200/60 dark:border-slate-700/60 shadow-2xl space-y-6 lg:rounded-2xl lg:shadow-sm lg:max-h-none lg:w-auto animate-slide-up lg:animate-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                <SlidersHorizontal size={15} /> Filters
              </h3>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs text-blue-600 hover:text-blue-500 font-semibold"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={() => setShowFiltersMobile(false)}
                  className="lg:hidden text-xs text-slate-500 font-semibold"
                >
                  Close
                </button>
              </div>
            </div>

            <form onSubmit={handleApplyFilters} className="space-y-4 text-sm">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Keyword Search</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Title or desc..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-9 pr-3 text-xs outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 min-h-[44px] lg:min-h-0"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Location</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Remote, Berlin..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 pl-9 pr-3 text-xs outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 min-h-[44px] lg:min-h-0"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 px-3 text-xs outline-none focus:border-blue-500 text-slate-700 dark:text-slate-200 min-h-[44px] lg:min-h-0"
                >
                  <option value="">All Categories</option>
                  <option value="Technology">Technology</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                  <option value="Design">Design</option>
                  <option value="Sales">Sales</option>
                  <option value="Customer Support">Customer Support</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Job Location Type</label>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 px-3 text-xs outline-none focus:border-blue-500 text-slate-700 dark:text-slate-200 min-h-[44px] lg:min-h-0"
                >
                  <option value="">All Types</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Onsite">Onsite</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Employment Type</label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 px-3 text-xs outline-none focus:border-blue-500 text-slate-700 dark:text-slate-200 min-h-[44px] lg:min-h-0"
                >
                  <option value="">All Contracts</option>
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-3 rounded-lg shadow-sm hover:shadow-blue-500/10 active:scale-97 transition-all min-h-[48px]"
              >
                Apply Filters
              </button>
            </form>
          </div>
        </div>

        {/* Jobs Listing Column */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-12 text-center shadow-sm">
              <p className="text-base font-bold text-slate-800 dark:text-slate-250">No jobs match your search</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Try adjusting your filters or clearing search keywords to find open job postings.
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-4 rounded-lg bg-blue-600 text-white px-5 py-2 text-xs font-semibold hover:bg-blue-700"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <>
              {/* Jobs Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map((job) => (
                  <div
                    key={job._id}
                    className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                          {job.category}
                        </span>
                        
                        {/* Source Badge */}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            job.source === 'Employer'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
                          }`}
                        >
                          {job.source === 'Employer' ? 'Employer Job' : 'Imported Job'}
                        </span>
                      </div>
                      
                      {/* Title & Company Row */}
                      <div className="flex items-start gap-3">
                        <img
                          src={job.companyLogo ? `http://localhost:5000/${job.companyLogo}` : '/default-company-logo.png'}
                          alt={job.companyName}
                          onError={(e) => {
                            e.target.src = 'https://api.dicebear.com/7.x/initials/svg?seed=' + job.companyName;
                          }}
                          className="h-10 w-10 rounded-xl object-cover border border-slate-100 dark:border-slate-700 mt-1 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white truncate" title={job.title}>
                            {job.title}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate flex items-center gap-1">
                            <Building size={12} /> {job.companyName}
                          </p>
                        </div>
                      </div>

                      {/* Location & Remote & Employment Type badges */}
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-semibold rounded flex items-center gap-0.5">
                          <Briefcase size={10} /> {job.employmentType}
                        </span>
                        {job.jobType === 'Remote' && (
                          <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded">
                            Remote
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed pt-1">
                        {job.description?.replace(/<[^>]*>/g, '') /* strip html for description preview */}
                      </p>

                      {/* Tags */}
                      {job.skillsRequired && job.skillsRequired.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {job.skillsRequired.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[9px] text-slate-500 dark:text-slate-400 rounded-md font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                          {job.skillsRequired.length > 3 && (
                            <span className="text-[9px] text-slate-400 font-bold self-center">
                              +{job.skillsRequired.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-700/60 mt-4 pt-4 flex justify-between items-center">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <MapPin size={12} className="text-slate-400 shrink-0" />
                        <span className="text-xs text-slate-500 truncate max-w-[120px]" title={job.location}>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {job.salary ? (
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-250 flex items-center">
                            <DollarSign size={12} />
                            {job.salary.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-400 uppercase">
                            Negotiable
                          </span>
                        )}
                        <Link
                          to={`/jobs/${job._id}`}
                          className="rounded-lg bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-700 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-blue-600 dark:hover:text-white p-2 transition-all active:scale-95"
                          title="View Details"
                        >
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-6">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 px-2">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
