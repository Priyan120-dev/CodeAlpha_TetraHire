import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Search, ArrowRight, Brain, FileText, BarChart3, BookOpen,
  MessageSquare, Trophy, TrendingUp, Bell, MapPin, Briefcase,
  Star, CheckCircle, ChevronLeft, ChevronRight, Mic,
  Users, Rocket, Globe, Building2, Target,
  Clock, Sparkles
} from 'lucide-react';

/* ─────────────────────────────────────────────
   ANIMATED COUNTER HOOK
───────────────────────────────────────────── */
function useCounter(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

/* ─────────────────────────────────────────────
   STAT COUNTER ITEM
───────────────────────────────────────────── */
function StatItem({ value, suffix, label, color, start }) {
  const count = useCounter(value, 2200, start);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-center space-y-1"
    >
      <p className={`text-4xl sm:text-5xl font-black ${color}`}>
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   FEATURE CARD
───────────────────────────────────────────── */
function FeatureCard({ icon: Icon, title, description, gradient, delay, toolId }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -6, scale: 1.02 }}
      onClick={() => toolId && navigate(`/ai-tools?tool=${toolId}`)}
      className={`group relative bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-950/50 transition-all duration-300 overflow-hidden ${toolId ? 'cursor-pointer' : 'cursor-default'}`}
    >
      {/* Gradient border on hover */}
      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${gradient} p-[1px]`}>
        <div className="absolute inset-[1px] rounded-2xl bg-white dark:bg-slate-900" />
      </div>
      {/* Glow effect */}
      <div className={`absolute -inset-4 opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-2xl bg-gradient-to-br ${gradient} rounded-3xl`} />

      <div className="relative z-10 space-y-4">
        <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={22} className="text-white" />
        </div>
        <div className="space-y-2">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">{title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   COMPANY LOGO CARD
───────────────────────────────────────────── */
function CompanyCard({ name, jobs, logo, delay }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative group flex flex-col items-center justify-center gap-3 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-slate-950/60 hover:border-[#00BE9B]/50 dark:hover:border-[#00BE9B]/40 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-[#00BE9B]" />
      <div className="text-3xl font-black text-slate-700 dark:text-slate-300 group-hover:text-[#00BE9B] transition-colors duration-300 select-none">
        {logo}
      </div>
      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{name}</span>
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg z-10"
          >
            {jobs} Open Jobs
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-white" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   MAIN HOME COMPONENT
───────────────────────────────────────────── */
const Home = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [statsInView, setStatsInView] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [typingCursor, setTypingCursor] = useState(true);
  const statsRef = useRef(null);
  const statsObserver = useInView(statsRef, { once: true });

  // Typing cursor hides after 2.5s
  useEffect(() => {
    const t = setTimeout(() => setTypingCursor(false), 2500);
    return () => clearTimeout(t);
  }, []);

  // Trigger stat counters
  useEffect(() => {
    if (statsObserver) setStatsInView(true);
  }, [statsObserver]);

  const testimonials = [
    { name: 'Priya Sharma', role: 'Software Engineer', company: 'Google', rating: 5, text: 'TetraHire matched me to my dream job at Google in under 2 weeks. The AI match score was spot on — every suggestion felt tailor-made for my profile.', avatar: 'PS', verified: true },
    { name: 'Arjun Mehta', role: 'Product Manager', company: 'Microsoft', rating: 5, text: 'The ATS resume scorer saved me from countless rejections. After optimizing my resume through TetraHire, my interview rate went from 5% to 42%.', avatar: 'AM', verified: true },
    { name: 'Sneha Nair', role: 'UI/UX Designer', company: 'Zoho', rating: 5, text: 'The mock interview prep is absolutely world-class. I walked into my Zoho interview completely calm and confident — got the offer on the spot!', avatar: 'SN', verified: true },
    { name: 'Rahul Gupta', role: 'Data Scientist', company: 'Amazon', rating: 5, text: 'Salary Insights helped me negotiate a 35% raise. I finally had the data to back up my ask. TetraHire is a game-changer for serious professionals.', avatar: 'RG', verified: true },
  ];

  const testimonialCount = testimonials.length;
  // Auto-advance testimonials
  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % testimonialCount), 4000);
    return () => clearInterval(t);
  }, [testimonialCount]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs?search=${search}${location ? `&location=${location}` : ''}`);
  };

  /* DATA ─────────── */
  const features = [
    { icon: Brain, title: 'AI Job Matching', description: 'Smart ML algorithms match your profile to the best-fit opportunities.', gradient: 'from-violet-500 to-purple-600', delay: 0, toolId: 'job-matching' },
    { icon: FileText, title: 'Resume Builder', description: 'Design ATS-optimized resumes with guided templates and live previews.', gradient: 'from-blue-500 to-cyan-500', delay: 0.05, toolId: 'resume-builder' },
    { icon: BarChart3, title: 'ATS Resume Score', description: 'Instantly check your resume compatibility with Applicant Tracking Systems.', gradient: 'from-emerald-500 to-teal-600', delay: 0.1, toolId: 'ats-score' },
    { icon: Search, title: 'Resume Analyzer', description: 'Deep-scan your resume for gaps, keywords, and improvement areas.', gradient: 'from-orange-500 to-amber-500', delay: 0.15, toolId: 'resume-analyzer' },
    { icon: BookOpen, title: 'Cover Letter AI', description: 'Auto-generate personalized, compelling cover letters in seconds.', gradient: 'from-rose-500 to-pink-600', delay: 0.2, toolId: 'cover-letter' },
    { icon: Trophy, title: 'Mock Interviews', description: 'Practice with AI-powered mock interviews and detailed performance reviews.', gradient: 'from-yellow-500 to-orange-500', delay: 0.25, toolId: 'mock-interview' },
    { icon: MessageSquare, title: 'AI Career Coach', description: 'Get personalized, real-time career guidance from your AI mentor.', gradient: 'from-indigo-500 to-violet-600', delay: 0.3, toolId: 'career-coach' },
    { icon: TrendingUp, title: 'Salary Insights', description: 'Benchmark your compensation with verified real-world market data.', gradient: 'from-teal-500 to-emerald-600', delay: 0.35, toolId: 'salary-insights' },
    { icon: Building2, title: 'Company Reviews', description: 'Read authentic employee reviews and culture insights before you apply.', gradient: 'from-sky-500 to-blue-600', delay: 0.4 },
    { icon: Bell, title: 'Job Alerts', description: 'Get notified instantly when your dream role goes live.', gradient: 'from-fuchsia-500 to-purple-600', delay: 0.45 },
    { icon: Target, title: 'Application Tracker', description: 'Manage your entire job pipeline in a Kanban-style dashboard.', gradient: 'from-green-500 to-emerald-600', delay: 0.5 },
    { icon: Users, title: 'Recruiter Chat', description: 'Message verified recruiters and hiring managers directly in-app.', gradient: 'from-red-500 to-rose-600', delay: 0.55 },
  ];

  const companies = [
    { name: 'Google', logo: 'G', jobs: 142 },
    { name: 'Microsoft', logo: 'M', jobs: 98 },
    { name: 'Amazon', logo: 'A', jobs: 213 },
    { name: 'TCS', logo: 'T', jobs: 345 },
    { name: 'Infosys', logo: 'i', jobs: 287 },
    { name: 'Accenture', logo: 'Ac', jobs: 198 },
    { name: 'Zoho', logo: 'Z', jobs: 67 },
    { name: 'IBM', logo: 'IBM', jobs: 89 },
    { name: 'Cognizant', logo: 'C', jobs: 156 },
  ];


  const popularSearches = ['React Developer', 'Product Manager', 'Data Scientist', 'UI/UX Designer', 'Backend Engineer'];
  const recentSearches = ['Frontend Developer', 'Remote Marketing'];

  const stats = [
    { value: 10000, suffix: '+', label: 'Active Jobs', color: 'text-[#00BE9B]' },
    { value: 2000, suffix: '+', label: 'Partner Companies', color: 'text-blue-500' },
    { value: 50000, suffix: '+', label: 'Job Seekers', color: 'text-violet-500' },
    { value: 98, suffix: '%', label: 'Satisfaction Rate', color: 'text-rose-500' },
    { value: 95, suffix: '%', label: 'AI Match Accuracy', color: 'text-amber-500' },
  ];

  const trustedBy = ['Wipro', 'HCL', 'Infosys', 'Capgemini', 'Deloitte', 'KPMG', 'Oracle', 'SAP'];

  /* ANIMATIONS ─────────── */
  const heroVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };
  const wordVariant = {
    hidden: { opacity: 0, y: 30, x: -20 },
    visible: { opacity: 1, y: 0, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };


  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#0a0f1e] transition-colors duration-200 overflow-x-hidden">

      {/* ──────────────────────────────────────────
          HERO SECTION
      ────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">

        {/* Animated mesh gradient background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-[#0a0f1e] dark:via-[#0d1629] dark:to-[#0a1a15]" />
          {/* Floating blurred circles */}
          <motion.div
            animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[10%] left-[15%] w-[500px] h-[500px] bg-[#00BE9B]/10 dark:bg-[#00BE9B]/6 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-blue-500/8 dark:bg-blue-500/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, 20, 0], y: [0, 20, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
            className="absolute top-[40%] right-[30%] w-[300px] h-[300px] bg-violet-500/6 dark:bg-violet-500/4 rounded-full blur-3xl"
          />
          {/* Tiny floating particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -20, 0], opacity: [0.05, 0.15, 0.05] }}
              transition={{ duration: 4 + i * 0.7, repeat: Infinity, delay: i * 0.5 }}
              className="absolute w-1 h-1 rounded-full bg-[#00BE9B]"
              style={{ left: `${10 + i * 12}%`, top: `${20 + (i % 3) * 20}%` }}
            />
          ))}
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b30_1px,transparent_1px),linear-gradient(to_bottom,#1e293b30_1px,transparent_1px)] bg-[size:64px_64px] opacity-70 dark:opacity-30" />
        </div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">

          {/* LEFT: Text Content */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00BE9B]/10 dark:bg-[#00BE9B]/15 text-[#00BE9B] text-xs font-bold border border-[#00BE9B]/20 backdrop-blur-sm"
            >
              <span className="flex h-2 w-2 rounded-full bg-[#00BE9B] animate-pulse" />
              AI-Powered Hiring Platform · 2025
            </motion.div>

            {/* Animated headline */}
            <motion.h1
              variants={heroVariants}
              initial="hidden"
              animate="visible"
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-slate-900 dark:text-white leading-[1.05] tracking-tight"
            >
              <motion.span variants={wordVariant} className="block">
                Smart Hiring
              </motion.span>
              <motion.span variants={{ ...wordVariant, visible: { ...wordVariant.visible, transition: { duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] } } }} className="block">
                Starts Here with
              </motion.span>
              <motion.span
                variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.4, ease: [0.34, 1.56, 0.64, 1] } } }}
                className="block relative inline-flex items-center"
              >
                <span className="relative">
                  <span className="bg-gradient-to-r from-[#00BE9B] via-emerald-400 to-teal-500 bg-clip-text text-transparent">
                    TetraHire
                  </span>
                  {/* Hand-drawn underline animation */}
                  <motion.svg
                    className="absolute -bottom-1 left-0 w-full"
                    viewBox="0 0 300 12"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1.1, ease: 'easeOut' }}
                  >
                    <motion.path
                      d="M2 8 Q75 2 150 8 Q225 14 298 6"
                      stroke="#00BE9B"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, delay: 1.1, ease: 'easeOut' }}
                    />
                  </motion.svg>
                </span>
                {/* Blinking cursor */}
                <AnimatePresence>
                  {typingCursor && (
                    <motion.span
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                      className="ml-1 inline-block w-[3px] h-[0.85em] bg-[#00BE9B] rounded-sm align-middle"
                    />
                  )}
                </AnimatePresence>
              </motion.span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed"
            >
              The AI-powered recruitment platform trusted by 50,000+ professionals.
              Match faster, apply smarter, and land your dream role.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <Link
                to="/jobs"
                className="group relative inline-flex items-center justify-center gap-2.5 px-7 py-4 bg-[#00BE9B] hover:bg-[#00a882] text-white font-bold text-sm rounded-2xl shadow-lg shadow-[#00BE9B]/25 hover:shadow-xl hover:shadow-[#00BE9B]/30 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2.5">
                  <Briefcase size={17} />
                  Find Jobs
                  <motion.span
                    className="inline-block"
                    whileHover={{ x: 4 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <ArrowRight size={16} />
                  </motion.span>
                </span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </Link>

              <Link
                to="/candidate/profile"
                className="group inline-flex items-center justify-center gap-2.5 px-7 py-4 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-bold text-sm rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:scale-[1.03] hover:border-[#00BE9B]/50 dark:hover:border-[#00BE9B]/50 active:scale-[0.97] transition-all duration-200"
              >
                <FileText size={17} />
                Upload Resume
                <motion.span
                  className="inline-block"
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <ArrowRight size={16} className="text-slate-400" />
                </motion.span>
              </Link>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="w-full max-w-xl relative"
            >
              <form onSubmit={handleSearch}>
                <div className="flex flex-col sm:flex-row gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-slate-950/60 border border-slate-200/70 dark:border-slate-800">
                  {/* Job search */}
                  <div className="flex items-center gap-2 flex-1 px-3 relative">
                    <Search size={16} className="text-slate-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Job title, skills, company..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 outline-none placeholder-slate-400 py-2 text-base lg:text-sm"
                    />
                    <button type="button" className="text-slate-400 hover:text-[#00BE9B] transition-colors shrink-0">
                      <Mic size={15} />
                    </button>
                  </div>

                  {/* Location divider */}
                  <div className="hidden sm:block w-px bg-slate-200 dark:bg-slate-700 my-1" />

                  {/* Location input */}
                  <div className="flex items-center gap-2 px-3 min-w-[120px]">
                    <MapPin size={15} className="text-slate-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 outline-none placeholder-slate-400 py-2 text-base lg:text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    className="rounded-xl bg-[#00BE9B] text-white font-bold text-sm py-3 px-6 hover:bg-[#00a882] transition-all active:scale-95 flex items-center gap-2 justify-center whitespace-nowrap shadow-md shadow-[#00BE9B]/20"
                  >
                    Search <ArrowRight size={15} />
                  </button>
                </div>

                {/* Search suggestions dropdown */}
                <AnimatePresence>
                  {showSuggestions && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-50 space-y-4"
                    >
                      {recentSearches.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recent</p>
                          {recentSearches.map((s) => (
                            <button key={s} type="button" onClick={() => setSearch(s)} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-[#00BE9B] w-full text-left">
                              <Clock size={12} className="text-slate-400" /> {s}
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Popular</p>
                        <div className="flex flex-wrap gap-2">
                          {popularSearches.map((s) => (
                            <button key={s} type="button" onClick={() => setSearch(s)} className="text-[11px] font-semibold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-[#00BE9B]/10 hover:text-[#00BE9B] transition-colors">
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-[11px] text-slate-400 font-semibold pt-0.5">Trending:</span>
                {popularSearches.slice(0, 4).map((t) => (
                  <button key={t} onClick={() => { setSearch(t); navigate(`/jobs?search=${t}`); }} className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-[#00BE9B] dark:hover:text-[#00BE9B] transition-colors">
                    #{t.replace(' ', '')}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Interactive Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative hidden lg:block"
          >
            {/* Premium glow behind card */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#00BE9B]/20 to-blue-500/10 rounded-3xl blur-3xl scale-110 -z-10" />

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              {/* Glassmorphism dashboard card */}
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-200/60 dark:border-slate-700/60 shadow-2xl p-6 space-y-5 relative overflow-hidden">

                {/* Subtle gradient overlay */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[#00BE9B]/10 to-transparent rounded-3xl" />

                {/* Window dots */}
                <div className="flex items-center gap-2 relative z-10">
                  <div className="h-3 w-3 rounded-full bg-red-400 hover:bg-red-500 transition-colors cursor-pointer" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400 hover:bg-yellow-500 transition-colors cursor-pointer" />
                  <div className="h-3 w-3 rounded-full bg-[#00BE9B] hover:bg-emerald-500 transition-colors cursor-pointer" />
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#00BE9B] bg-[#00BE9B]/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00BE9B] animate-pulse inline-block" />
                      Live Dashboard
                    </span>
                  </div>
                </div>

                {/* Notification badge */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-slate-900 dark:text-white">Application Pipeline</p>
                    <p className="text-[10px] text-slate-400">Last updated: just now</p>
                  </div>
                  <div className="relative">
                    <Bell size={18} className="text-slate-500" />
                    <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">3</span>
                  </div>
                </div>

                {/* Animated pipeline bars */}
                <div className="space-y-3 relative z-10">
                  {[
                    { label: 'Submitted', pct: 45, count: 214, color: '#00BE9B' },
                    { label: 'Under Review', pct: 38, count: 182, color: '#3b82f6' },
                    { label: 'Interviewing', pct: 22, count: 105, color: '#8b5cf6' },
                    { label: 'Offer Extended', pct: 12, count: 57, color: '#f59e0b' },
                  ].map((item, i) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                        <span>{item.label}</span>
                        <span style={{ color: item.color }}>{item.pct}% ({item.count})</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.pct}%` }}
                          transition={{ duration: 1.2, delay: 0.8 + i * 0.1, ease: 'easeOut' }}
                          className="h-1.5 rounded-full"
                          style={{ background: item.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Match Score card */}
                <div className="bg-gradient-to-br from-[#00BE9B]/10 to-emerald-50/50 dark:from-[#00BE9B]/10 dark:to-slate-800/50 rounded-2xl p-4 border border-[#00BE9B]/20 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Match Score</p>
                      <p className="text-2xl font-black text-[#00BE9B]">94%</p>
                      <p className="text-[10px] text-slate-500">Google SWE Role · Senior Level</p>
                    </div>
                    <div className="relative h-16 w-16">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="26" stroke="#e2e8f0" strokeWidth="6" fill="none" />
                        <motion.circle
                          cx="32" cy="32" r="26"
                          stroke="#00BE9B" strokeWidth="6" fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 26}`}
                          initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 26 * 0.06 }}
                          transition={{ duration: 1.5, delay: 1, ease: 'easeOut' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles size={20} className="text-[#00BE9B]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 relative z-10">
                  {[
                    { label: 'Active Jobs', value: '18', color: 'text-[#00BE9B]' },
                    { label: 'Recruiters', value: '6', color: 'text-blue-500' },
                    { label: 'Matches', value: '94%', color: 'text-violet-500' },
                  ].map((s) => (
                    <div key={s.label} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center border border-slate-200/50 dark:border-slate-700/50">
                      <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Floating card 1 */}
            <motion.div
              animate={{ y: [0, -5, 0], rotate: [0, 1, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -top-6 -right-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 px-4 py-3 flex items-center gap-3"
            >
              <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <CheckCircle size={16} className="text-[#00BE9B]" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-900 dark:text-white">Offer Received!</p>
                <p className="text-[9px] text-slate-400">Senior Dev · ₹42 LPA</p>
              </div>
            </motion.div>

            {/* Floating card 2 */}
            <motion.div
              animate={{ y: [0, 5, 0], rotate: [0, -1, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 px-4 py-3 flex items-center gap-3"
            >
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <Users size={16} className="text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-900 dark:text-white">+127 Recruiters</p>
                <p className="text-[9px] text-slate-400">viewed your profile today</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-slate-300 dark:border-slate-700 flex items-start justify-center pt-1.5"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
          </motion.div>
        </motion.div>
      </section>

      {/* ──────────────────────────────────────────
          TRUSTED BY TICKER
      ────────────────────────────────────────── */}
      <section className="py-10 border-y border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-6 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trusted by professionals at</p>
        </div>
        <div className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-50 dark:from-[#0a0f1e] to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-50 dark:from-[#0a0f1e] to-transparent z-10" />
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="flex gap-10 items-center whitespace-nowrap"
          >
            {[...trustedBy, ...trustedBy].map((company, i) => (
              <span key={i} className="text-lg font-black text-slate-300 dark:text-slate-700 hover:text-[#00BE9B] dark:hover:text-[#00BE9B] transition-colors duration-300 cursor-default select-none px-4">
                {company}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ──────────────────────────────────────────
          STATISTICS SECTION
      ────────────────────────────────────────── */}
      <section ref={statsRef} className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#0b162c] to-[#0d2149] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#00BE9B10_0%,transparent_70%)]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-xs font-bold text-[#00BE9B] uppercase tracking-widest mb-3">By The Numbers</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Platform Statistics</h2>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
            {stats.map((s) => (
              <StatItem key={s.label} value={s.value} suffix={s.suffix} label={s.label} color={s.color} start={statsInView} />
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────
          FEATURES GRID
      ────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0a0f1e]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16 space-y-4"
          >
            <p className="text-xs font-bold text-[#00BE9B] uppercase tracking-widest">Everything You Need</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Your Complete Career{' '}
              <span className="bg-gradient-to-r from-[#00BE9B] to-teal-500 bg-clip-text text-transparent">Toolkit</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              From AI-powered job matching to salary insights — everything you need to accelerate your career, in one place.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────
          FEATURED COMPANIES
      ────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50/80 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14 space-y-4"
          >
            <p className="text-xs font-bold text-[#00BE9B] uppercase tracking-widest">Top Employers</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Featured Companies Hiring Now
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto">
              Join thousands of candidates already hired by the world's leading organizations.
            </p>
          </motion.div>

          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4">
            {companies.map((c, i) => (
              <CompanyCard key={c.name} {...c} delay={i * 0.05} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#00BE9B] hover:text-[#00a882] transition-colors group"
            >
              View all hiring companies
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ──────────────────────────────────────────
          HOW IT WORKS
      ────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0a0f1e]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 space-y-4"
          >
            <p className="text-xs font-bold text-[#00BE9B] uppercase tracking-widest">Simple Process</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Land Your Dream Job in 4 Steps
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connector line */}
            <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />

            {[
              { step: '01', icon: Users, title: 'Create Profile', desc: 'Sign up and build your professional profile in minutes.' },
              { step: '02', icon: Brain, title: 'AI Matching', desc: 'Our AI scans thousands of jobs to find your perfect match.' },
              { step: '03', icon: FileText, title: 'Apply Instantly', desc: 'One-click apply with your AI-optimized resume.' },
              { step: '04', icon: Trophy, title: 'Get Hired', desc: 'Accept offers and launch your next career chapter.' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col items-center text-center space-y-4"
              >
                <div className="relative">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#00BE9B] to-teal-600 flex items-center justify-center shadow-lg shadow-[#00BE9B]/20 z-10 relative">
                    <item.icon size={26} className="text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black flex items-center justify-center">
                    {item.step}
                  </span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────
          TESTIMONIALS
      ────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-slate-900/50 dark:to-[#0a1a15]/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14 space-y-4"
          >
            <p className="text-xs font-bold text-[#00BE9B] uppercase tracking-widest">Success Stories</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Loved by Professionals
            </h2>
          </motion.div>

          {/* Testimonial Carousel */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4 }}
                className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-10 border border-slate-200/60 dark:border-slate-800 shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#00BE9B]/10 to-transparent rounded-3xl" />

                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <blockquote className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-medium mb-8 relative">
                  <span className="text-6xl text-[#00BE9B]/20 font-serif absolute -top-4 -left-2">"</span>
                  {testimonials[activeTestimonial].text}
                </blockquote>

                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#00BE9B] to-teal-600 flex items-center justify-center text-white font-black text-sm">
                    {testimonials[activeTestimonial].avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{testimonials[activeTestimonial].name}</p>
                      {testimonials[activeTestimonial].verified && (
                        <CheckCircle size={14} className="text-[#00BE9B] fill-[#00BE9B] text-white" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {testimonials[activeTestimonial].role} · {testimonials[activeTestimonial].company}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setActiveTestimonial((p) => (p - 1 + testimonials.length) % testimonials.length)}
                className="p-2.5 rounded-full border border-slate-200 dark:border-slate-700 hover:border-[#00BE9B] hover:text-[#00BE9B] text-slate-500 transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTestimonial(i)}
                    className={`rounded-full transition-all duration-300 ${i === activeTestimonial ? 'w-6 h-2.5 bg-[#00BE9B]' : 'w-2.5 h-2.5 bg-slate-300 dark:bg-slate-700 hover:bg-[#00BE9B]/50'}`}
                  />
                ))}
              </div>
              <button
                onClick={() => setActiveTestimonial((p) => (p + 1) % testimonials.length)}
                className="p-2.5 rounded-full border border-slate-200 dark:border-slate-700 hover:border-[#00BE9B] hover:text-[#00BE9B] text-slate-500 transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────
          CTA SECTION
      ────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0b162c] via-[#0d2149] to-[#051a13] -z-10" />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#00BE9B]/10 rounded-full blur-3xl -z-10"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#00BE9B08_0%,transparent_60%)] -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00BE9B]/15 text-[#00BE9B] text-xs font-bold border border-[#00BE9B]/25">
              <Rocket size={12} />
              Start Your Journey Today — It's Free
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              Your Dream Career{' '}
              <span className="bg-gradient-to-r from-[#00BE9B] to-emerald-400 bg-clip-text text-transparent">
                Starts Today
              </span>
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              Join 50,000+ professionals who found their dream jobs through TetraHire's AI-powered platform.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/register"
              className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#00BE9B] hover:bg-[#00a882] text-white font-bold rounded-2xl shadow-lg shadow-[#00BE9B]/25 hover:shadow-xl hover:shadow-[#00BE9B]/30 hover:scale-[1.03] active:scale-97 transition-all duration-200"
            >
              <Sparkles size={17} />
              Create Free Account
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/jobs"
              className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-white/10 hover:bg-white/15 text-white font-bold rounded-2xl border border-white/20 hover:border-white/40 hover:scale-[1.03] active:scale-97 transition-all duration-200 backdrop-blur-sm"
            >
              <Globe size={17} />
              Explore Jobs
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-6 text-xs text-slate-500"
          >
            {['No credit card required', 'Free forever plan', '50K+ active jobs', '98% satisfaction'].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle size={12} className="text-[#00BE9B]" />
                {item}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default Home;
