import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, FileText, BarChart3, Search, BookOpen, Trophy, MessageSquare, TrendingUp,
  Sparkles, Send, RefreshCw, Star, AlertCircle, ArrowRight, Download, Upload, Plus, Trash2, CheckCircle
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const AiTools = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();
  
  const activeTool = searchParams.get('tool') || 'job-matching';
  const setActiveTool = (toolId) => {
    setSearchParams({ tool: toolId });
  };

  /* AI CAREER COACH STATE */
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: "Hello! I am your AI Career Coach. How can I help you accelerate your job search or career trajectory today?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  /* COVER LETTER STATE */
  const [clJobTitle, setClJobTitle] = useState('');
  const [clJobDesc, setClJobDesc] = useState('');
  const [clGenerated, setClGenerated] = useState('');
  const [clLoading, setClLoading] = useState(false);

  /* ATS SCORE STATE */
  const [atsText, setAtsText] = useState('');
  const [atsJobDesc, setAtsJobDesc] = useState('');
  const [atsResult, setAtsResult] = useState(null);
  const [atsLoading, setAtsLoading] = useState(false);

  /* RESUME ANALYZER STATE */
  const [analyzerText, setAnalyzerText] = useState('');
  const [analyzerResult, setAnalyzerResult] = useState(null);
  const [analyzerLoading, setAnalyzerLoading] = useState(false);

  /* MOCK INTERVIEW STATE */
  const [interviewRole, setInterviewRole] = useState('React Developer');
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewAnswer, setInterviewAnswer] = useState('');
  const [interviewFeedback, setInterviewFeedback] = useState([]);
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [interviewScore, setInterviewScore] = useState(null);

  /* SALARY INSIGHTS STATE */
  const [salaryRole, setSalaryRole] = useState('Software Engineer');
  const [salaryLocation, setSalaryLocation] = useState('Remote');
  const [salaryData, setSalaryData] = useState(null);

  /* RESUME BUILDER STATE */
  const [resumeData, setResumeData] = useState({
    name: user?.name || user?.user?.name || '',
    email: user?.email || user?.user?.email || '',
    phone: '',
    summary: '',
    skills: '',
    experience: [{ company: '', role: '', duration: '', details: '' }],
    education: [{ school: '', degree: '', year: '' }]
  });

  const tools = [
    { id: 'job-matching', name: 'AI Job Matching', icon: Brain, gradient: 'from-violet-500 to-purple-600', desc: 'Smart matches matching your skills.' },
    { id: 'resume-builder', name: 'Resume Builder', icon: FileText, gradient: 'from-blue-500 to-cyan-500', desc: 'ATS optimized templates & live previews.' },
    { id: 'ats-score', name: 'ATS Resume Score', icon: BarChart3, gradient: 'from-emerald-500 to-teal-600', desc: 'Instant ATS compatibility scan.' },
    { id: 'resume-analyzer', name: 'Resume Analyzer', icon: Search, gradient: 'from-orange-500 to-amber-500', desc: 'Identify gaps and improvements.' },
    { id: 'cover-letter', name: 'Cover Letter AI', icon: BookOpen, gradient: 'from-rose-500 to-pink-600', desc: 'Auto-generate personalized letters.' },
    { id: 'mock-interview', name: 'Mock Interviews', icon: Trophy, gradient: 'from-yellow-500 to-orange-500', desc: 'Practice with real-time feedback.' },
    { id: 'career-coach', name: 'AI Career Coach', icon: MessageSquare, gradient: 'from-indigo-500 to-violet-600', desc: 'Dynamic career mentorship.' },
    { id: 'salary-insights', name: 'Salary Insights', icon: TrendingUp, gradient: 'from-teal-500 to-emerald-600', desc: 'Salary benchmarking data.' }
  ];

  /* ────────────────────────────────────────────────────────
     AI CAREER COACH SUBMISSION
  ──────────────────────────────────────────────────────── */
  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = { role: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    setTimeout(() => {
      let reply = "That's a great question. In terms of your career, focusing on modern tools like React, Node.js, and cloud systems is key. I recommend tailoring your resume to emphasize active project contributions.";
      if (chatInput.toLowerCase().includes('interview')) {
        reply = "For interview prep, make sure you can explain the core technical trade-offs of your past projects clearly. Practice structuring your answers using the STAR method (Situation, Task, Action, Result).";
      } else if (chatInput.toLowerCase().includes('salary') || chatInput.toLowerCase().includes('negotiate')) {
        reply = "When negotiating salary, always research the market rates first. Emphasize the specific business value you bring, and avoid giving the first number if possible. Focus on total compensation packages.";
      }
      setChatMessages(prev => [...prev, { role: 'ai', text: reply }]);
      setChatLoading(false);
    }, 1000);
  };

  /* ────────────────────────────────────────────────────────
     COVER LETTER GENERATOR
  ──────────────────────────────────────────────────────── */
  const generateCoverLetter = (e) => {
    e.preventDefault();
    if (!clJobTitle.trim()) {
      addToast('Please enter a target job title.', 'warning');
      return;
    }
    setClLoading(true);
    setTimeout(() => {
      const generatedLetter = `Dear Hiring Manager,

I am writing to express my strong interest in the ${clJobTitle} position. With my background in software development and professional skills, I am confident in my ability to contribute value to your engineering team.

My technical foundation aligns closely with the requirements of this role. I have extensive experience building scalable web solutions, designing REST APIs, and styling modern interfaces. In my previous experiences, I demonstrated a strong commitment to writing clean, maintainable code and solving complex performance challenges.

${clJobDesc ? `Regarding your job details: I am excited by your team's focus. My experience in these areas enables me to hit the ground running.` : ''}

Thank you for your time and consideration. I look forward to discussing how my experience can support your goals.

Sincerely,
${resumeData.name || 'Professional Candidate'}`;
      setClGenerated(generatedLetter);
      setClLoading(false);
      addToast('Cover letter generated successfully!', 'success');
    }, 1200);
  };

  /* ────────────────────────────────────────────────────────
     ATS SCORE CHECKER
  ──────────────────────────────────────────────────────── */
  const runAtsScoreCheck = (e) => {
    e.preventDefault();
    if (!atsText.trim()) {
      addToast('Please enter your resume text.', 'warning');
      return;
    }
    setAtsLoading(true);
    setTimeout(() => {
      const score = Math.floor(Math.random() * 25) + 65; // Generate score between 65 and 90
      const missingKeywords = ['Kubernetes', 'Redux State Management', 'System Design', 'CI/CD Pipelines'].filter(() => Math.random() > 0.4);
      setAtsResult({
        score,
        verdict: score >= 80 ? 'Excellent' : score >= 70 ? 'Good' : 'Needs Optimization',
        feedback: score >= 80 ? 'Your resume is highly optimized for ATS. Keep it up!' : 'Good start, but adding key missing words and structural labels will increase your ranking.',
        missingKeywords
      });
      setAtsLoading(false);
      addToast('ATS Score calculation complete!', 'success');
    }, 1500);
  };

  /* ────────────────────────────────────────────────────────
     RESUME ANALYZER
  ──────────────────────────────────────────────────────── */
  const analyzeResume = (e) => {
    e.preventDefault();
    if (!analyzerText.trim()) {
      addToast('Please provide your resume content.', 'warning');
      return;
    }
    setAnalyzerLoading(true);
    setTimeout(() => {
      setAnalyzerResult({
        strengths: ['Clear work hierarchy', 'Good skill-to-experience keyword matching', 'Consistent date formats'],
        gaps: ['Lacks quantifiable business outcomes (metrics like % improvements)', 'Project descriptions are too brief', 'Missing portfolio links'],
        tips: [
          'Add action verbs to start every experience bullet point.',
          'Inject metrics: instead of "Optimized database queries," write "Optimized query indexing, reducing page response time by 28%".',
          'Include links to GitHub, LinkedIn, or personal website projects.'
        ]
      });
      setAnalyzerLoading(false);
      addToast('Resume analysis complete!', 'success');
    }, 1500);
  };

  /* ────────────────────────────────────────────────────────
     MOCK INTERVIEW SIMULATOR
  ──────────────────────────────────────────────────────── */
  const startInterview = () => {
    setInterviewLoading(true);
    setTimeout(() => {
      const questions = [
        "What is the difference between state and props in React?",
        "Explain the concept of virtual DOM and how React utilizes it to optimize rendering.",
        "How do you manage global state in complex React applications?",
        "Explain hooks in React and when you would use useMemo or useCallback.",
        "How do you optimize React page performance for high traffic applications?"
      ];
      setInterviewQuestions(questions);
      setCurrentQuestionIndex(0);
      setInterviewAnswer('');
      setInterviewFeedback([]);
      setInterviewScore(null);
      setInterviewStarted(true);
      setInterviewLoading(false);
      addToast('Interview started! Answer the questions to get graded.', 'success');
    }, 1000);
  };

  const submitAnswer = () => {
    if (!interviewAnswer.trim()) {
      addToast('Please type your response.', 'warning');
      return;
    }
    const currentQ = interviewQuestions[currentQuestionIndex];
    setInterviewLoading(true);

    setTimeout(() => {
      const currentScore = Math.floor(Math.random() * 4) + 7; // score between 7 and 10
      const currentFeedback = {
        question: currentQ,
        answer: interviewAnswer,
        score: currentScore,
        tips: currentScore >= 9 ? 'Excellent structured response. You hit the key technical terms.' : 'Good answer. Try to explain with a brief coding example next time to showcase depth.'
      };

      setInterviewFeedback(prev => [...prev, currentFeedback]);
      setInterviewAnswer('');
      setInterviewLoading(false);

      if (currentQuestionIndex < interviewQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // Finished all questions
        const totalFeed = [...interviewFeedback, currentFeedback];
        const finalScore = Math.round(totalFeed.reduce((acc, f) => acc + f.score, 0) / totalFeed.length * 10) / 10;
        setInterviewScore(finalScore);
        addToast('Mock interview finished! View details below.', 'success');
      }
    }, 1000);
  };

  /* ────────────────────────────────────────────────────────
     SALARY INSIGHTS
  ──────────────────────────────────────────────────────── */
  useEffect(() => {
    // Generate mock salary data based on inputs
    const base = salaryRole.toLowerCase().includes('senior') ? 130000 : 85000;
    const locMultiplier = salaryLocation.toLowerCase() === 'remote' ? 1.0 : salaryLocation.toLowerCase().includes('new york') ? 1.25 : 1.1;
    const finalSalary = Math.round(base * locMultiplier);
    setSalaryData({
      min: Math.round(finalSalary * 0.8),
      median: finalSalary,
      max: Math.round(finalSalary * 1.3),
      percentile: 78,
      trend: 'Upward (+4.2% YoY)'
    });
  }, [salaryRole, salaryLocation]);

  /* ────────────────────────────────────────────────────────
     RESUME BUILDER FUNCTIONS
  ──────────────────────────────────────────────────────── */
  const handleResumeChange = (field, val) => {
    setResumeData(prev => ({ ...prev, [field]: val }));
  };

  const updateExperience = (idx, field, val) => {
    const list = [...resumeData.experience];
    list[idx][field] = val;
    setResumeData(prev => ({ ...prev, experience: list }));
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, { company: '', role: '', duration: '', details: '' }]
    }));
  };

  const removeExperience = (idx) => {
    const list = resumeData.experience.filter((_, i) => i !== idx);
    setResumeData(prev => ({ ...prev, experience: list }));
  };

  const updateEducation = (idx, field, val) => {
    const list = [...resumeData.education];
    list[idx][field] = val;
    setResumeData(prev => ({ ...prev, education: list }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, { school: '', degree: '', year: '' }]
    }));
  };

  const removeEducation = (idx) => {
    const list = resumeData.education.filter((_, i) => i !== idx);
    setResumeData(prev => ({ ...prev, education: list }));
  };

  const saveResume = () => {
    addToast('Resume details updated and synchronized with profile!', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="text-[#00BE9B]" /> AI Career Assistant Toolkit
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Everything you need to land your next dream role, powered by AI.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Side: Navigation Menu */}
        <div className="lg:col-span-1 space-y-2">
          {tools.map((t) => {
            const Icon = t.icon;
            const isSelected = activeTool === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTool(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-950 font-bold shadow-md'
                    : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-850'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-white/10 dark:bg-slate-950/10' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  <Icon size={18} className={isSelected ? 'text-white dark:text-slate-900' : 'text-[#00BE9B]'} />
                </div>
                <div>
                  <p className="text-xs font-bold">{t.name}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Side: Tool Console Panel */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 min-h-[500px] shadow-sm flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTool}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-grow flex flex-col"
            >
              {/* 1. AI JOB MATCHING */}
              {activeTool === 'job-matching' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Job Matching Feed</h3>
                    <p className="text-xs text-slate-500">Based on your skills: React, JavaScript, Node.js, Express, TailwindCSS.</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { title: 'Frontend Developer', company: 'Google', location: 'Remote', score: 94, type: 'React & TailwindCSS Specialist Required' },
                      { title: 'Full Stack Engineer', company: 'Microsoft', location: 'Hybrid - Seattle', score: 87, type: 'React, Node.js & MDB Database Setup' },
                      { title: 'Backend Developer', company: 'Amazon', location: 'Onsite - Seattle', score: 72, type: 'Express API Development & AWS Deployments' }
                    ].map((m, idx) => (
                      <div key={idx} className="flex justify-between items-center p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 hover:border-[#00BE9B]/50 transition-colors">
                        <div>
                          <h4 className="text-sm font-bold text-slate-850 dark:text-white">{m.title}</h4>
                          <p className="text-xs text-slate-500">{m.company} &bull; {m.location}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{m.type}</p>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <div>
                            <span className="block text-xs font-bold text-[#00BE9B]">{m.score}% Match</span>
                            <span className="block text-[9px] text-slate-400 uppercase font-bold tracking-wider">AI Score</span>
                          </div>
                          <Link to="/jobs" className="bg-[#00BE9B] text-white p-2 rounded-lg text-xs font-bold">
                            View
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. RESUME BUILDER */}
              {activeTool === 'resume-builder' && (
                <div className="space-y-6 flex-grow flex flex-col md:flex-row gap-6">
                  {/* Left: Input Form */}
                  <div className="flex-1 space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    <h3 className="text-md font-bold text-slate-800 dark:text-white">Resume Information</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400">Full Name</label>
                        <input
                          type="text"
                          value={resumeData.name}
                          onChange={(e) => handleResumeChange('name', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400">Email Address</label>
                        <input
                          type="email"
                          value={resumeData.email}
                          onChange={(e) => handleResumeChange('email', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400">Professional Summary</label>
                      <textarea
                        value={resumeData.summary}
                        onChange={(e) => handleResumeChange('summary', e.target.value)}
                        placeholder="Dynamic Web Developer with 3+ years experience..."
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs h-16 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400">Skills Tags (comma separated)</label>
                      <input
                        type="text"
                        value={resumeData.skills}
                        onChange={(e) => handleResumeChange('skills', e.target.value)}
                        placeholder="React, JavaScript, TailwindCSS, Mongoose"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs"
                      />
                    </div>

                    {/* Work Experience */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-slate-700 dark:text-white uppercase tracking-wider">Experience</h4>
                        <button onClick={addExperience} className="text-xs text-blue-600 hover:text-blue-500 font-bold flex items-center gap-1">
                          <Plus size={14} /> Add
                        </button>
                      </div>
                      {resumeData.experience.map((exp, idx) => (
                        <div key={idx} className="p-3 border border-slate-100 dark:border-slate-800 rounded-lg space-y-2 relative">
                          <button onClick={() => removeExperience(idx)} className="absolute top-2 right-2 text-rose-500">
                            <Trash2 size={14} />
                          </button>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Company"
                              value={exp.company}
                              onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 text-[11px]"
                            />
                            <input
                              type="text"
                              placeholder="Role"
                              value={exp.role}
                              onChange={(e) => updateExperience(idx, 'role', e.target.value)}
                              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 text-[11px]"
                            />
                          </div>
                          <input
                            type="text"
                            placeholder="Duration (e.g. 2023 - Present)"
                            value={exp.duration}
                            onChange={(e) => updateExperience(idx, 'duration', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 text-[11px]"
                          />
                        </div>
                      ))}
                    </div>

                    <button onClick={saveResume} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-2 rounded-xl text-xs font-bold">
                      Save & Sync Resume
                    </button>
                  </div>

                  {/* Right: Live Preview */}
                  <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-250 dark:border-slate-850 flex flex-col justify-between">
                    <div>
                      <div className="border-b border-slate-200 dark:border-slate-800 pb-3 text-center">
                        <h2 className="text-md font-extrabold text-slate-805 dark:text-white uppercase tracking-widest">{resumeData.name || 'Your Name'}</h2>
                        <p className="text-[10px] text-slate-550 mt-1">{resumeData.email || 'your.email@example.com'}</p>
                      </div>

                      <div className="space-y-3 pt-3">
                        <div>
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200/50 pb-0.5">Summary</h4>
                          <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{resumeData.summary || 'Enter your summary...'}</p>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200/50 pb-0.5">Skills</h4>
                          <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 font-semibold">{resumeData.skills || 'React, WebDev, NodeJS...'}</p>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200/50 pb-0.5">Experience</h4>
                          {resumeData.experience.map((exp, idx) => (
                            <div key={idx} className="mt-1">
                              <p className="text-[10px] font-bold text-slate-700 dark:text-white">{exp.role || 'Role'} &mdash; {exp.company || 'Company'}</p>
                              <p className="text-[9px] text-slate-400">{exp.duration}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1">
                      <Download size={14} /> Download PDF
                    </button>
                  </div>
                </div>
              )}

              {/* 3. ATS RESUME SCORE */}
              {activeTool === 'ats-score' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">ATS Scorer</h3>
                    <p className="text-xs text-slate-500">Benchmark your resume text against specific target requirements.</p>
                  </div>

                  <form onSubmit={runAtsScoreCheck} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Your Resume Text</label>
                        <textarea
                          value={atsText}
                          onChange={(e) => setAtsText(e.target.value)}
                          placeholder="Paste the full content of your resume here..."
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs h-40 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Target Job Description</label>
                        <textarea
                          value={atsJobDesc}
                          onChange={(e) => setAtsJobDesc(e.target.value)}
                          placeholder="Paste target job specifications or details here..."
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs h-40 resize-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={atsLoading}
                      className="w-full bg-[#00BE9B] text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                    >
                      {atsLoading ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" /> Analyzing compatibility...
                        </>
                      ) : (
                        'Run Compatibility Scan'
                      )}
                    </button>
                  </form>

                  {atsResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 border border-slate-150 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 space-y-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-16 w-16 rounded-full flex items-center justify-center border-4 ${
                          atsResult.score >= 80 ? 'border-emerald-500 text-emerald-500' : 'border-amber-500 text-amber-500'
                        }`}>
                          <span className="text-lg font-black">{atsResult.score}%</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-850 dark:text-white">Verdict: {atsResult.verdict}</h4>
                          <p className="text-xs text-slate-500">{atsResult.feedback}</p>
                        </div>
                      </div>

                      {atsResult.missingKeywords.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-slate-700 dark:text-white">Recommended Keywords to Add:</p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {atsResult.missingKeywords.map((kw, i) => (
                              <span key={i} className="text-[10px] font-bold bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md">
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              )}

              {/* 4. RESUME ANALYZER */}
              {activeTool === 'resume-analyzer' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Resume Analyzer</h3>
                    <p className="text-xs text-slate-500">Scan your resume for weaknesses, strengths, and layout optimization recommendations.</p>
                  </div>

                  <form onSubmit={analyzeResume} className="space-y-4">
                    <textarea
                      value={analyzerText}
                      onChange={(e) => setAnalyzerText(e.target.value)}
                      placeholder="Paste your complete resume copy here for analysis..."
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs h-40 resize-none"
                    />

                    <button
                      type="submit"
                      disabled={analyzerLoading}
                      className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                    >
                      {analyzerLoading ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" /> Running deep scan...
                        </>
                      ) : (
                        'Analyze Resume Structure'
                      )}
                    </button>
                  </form>

                  {analyzerResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800"
                    >
                      <div className="bg-emerald-50/20 dark:bg-emerald-950/10 p-4 rounded-xl border border-emerald-500/20">
                        <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Strengths Found</h4>
                        <ul className="space-y-1 text-xs text-slate-650 dark:text-slate-350 list-disc list-inside">
                          {analyzerResult.strengths.map((s, idx) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-rose-50/20 dark:bg-rose-950/10 p-4 rounded-xl border border-rose-500/20">
                        <h4 className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-2">Improvement Gaps</h4>
                        <ul className="space-y-1 text-xs text-slate-650 dark:text-slate-350 list-disc list-inside">
                          {analyzerResult.gaps.map((g, idx) => (
                            <li key={idx}>{g}</li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* 5. COVER LETTER AI */}
              {activeTool === 'cover-letter' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cover Letter AI</h3>
                    <p className="text-xs text-slate-500">Auto-generate customized cover letters tailored for specific job titles.</p>
                  </div>

                  <form onSubmit={generateCoverLetter} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Target Job Title</label>
                      <input
                        type="text"
                        value={clJobTitle}
                        onChange={(e) => setClJobTitle(e.target.value)}
                        placeholder="e.g. Senior React Developer"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Job Details / Company Focus (Optional)</label>
                      <textarea
                        value={clJobDesc}
                        onChange={(e) => setClJobDesc(e.target.value)}
                        placeholder="e.g. Focus on micro-frontends and UI systems..."
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs h-20 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={clLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                    >
                      {clLoading ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" /> Composing letter...
                        </>
                      ) : (
                        'Generate Custom Letter'
                      )}
                    </button>
                  </form>

                  {clGenerated && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/30 relative"
                    >
                      <pre className="text-xs text-slate-650 dark:text-slate-350 whitespace-pre-wrap font-sans leading-relaxed">
                        {clGenerated}
                      </pre>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(clGenerated);
                          addToast('Copied to clipboard!', 'success');
                        }}
                        className="absolute top-2 right-2 text-xs bg-slate-200 hover:bg-slate-350 dark:bg-slate-800 text-slate-800 dark:text-white px-2 py-1 rounded"
                      >
                        Copy
                      </button>
                    </motion.div>
                  )}
                </div>
              )}

              {/* 6. MOCK INTERVIEWS */}
              {activeTool === 'mock-interview' && (
                <div className="space-y-6 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Mock Interview Simulator</h3>
                    <p className="text-xs text-slate-500">Practice questions and receive graded reviews.</p>
                  </div>

                  {!interviewStarted ? (
                    <div className="text-center py-10 space-y-4">
                      <div className="max-w-xs mx-auto">
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Target Interview Role</label>
                        <input
                          type="text"
                          value={interviewRole}
                          onChange={(e) => setInterviewRole(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-center font-bold"
                        />
                      </div>
                      <button
                        onClick={startInterview}
                        disabled={interviewLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold"
                      >
                        {interviewLoading ? 'Initializing sessions...' : 'Start Mock Session'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 flex-grow flex flex-col justify-between">
                      {interviewScore === null ? (
                        <div className="space-y-4">
                          <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/40">
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Question {currentQuestionIndex + 1} of {interviewQuestions.length}</span>
                            <p className="text-sm font-bold text-slate-800 dark:text-white mt-1">
                              {interviewQuestions[currentQuestionIndex]}
                            </p>
                          </div>

                          <textarea
                            value={interviewAnswer}
                            onChange={(e) => setInterviewAnswer(e.target.value)}
                            placeholder="Type your structured technical response here..."
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs h-32 resize-none"
                          />

                          <button
                            onClick={submitAnswer}
                            disabled={interviewLoading}
                            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-2.5 rounded-xl text-xs font-bold"
                          >
                            {interviewLoading ? 'Grading answer...' : 'Submit Answer'}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="p-5 border border-emerald-500/20 bg-emerald-500/5 rounded-xl text-center space-y-2">
                            <CheckCircle size={32} className="mx-auto text-emerald-500" />
                            <h4 className="text-md font-bold text-slate-905 dark:text-white">Session Completed!</h4>
                            <p className="text-xs text-slate-500">Your average score is:</p>
                            <p className="text-4xl font-black text-[#00BE9B]">{interviewScore} / 10</p>
                          </div>

                          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                            {interviewFeedback.map((f, i) => (
                              <div key={i} className="p-3 border border-slate-100 dark:border-slate-800 rounded-lg text-xs space-y-1">
                                <p className="font-bold text-slate-800 dark:text-white">Q: {f.question}</p>
                                <p className="text-[11px] text-slate-500">Score: {f.score}/10</p>
                                <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">Tip: {f.tips}</p>
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={() => setInterviewStarted(false)}
                            className="w-full bg-slate-150 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white py-2 rounded-xl text-xs font-bold"
                          >
                            Start New Session
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 7. AI CAREER COACH */}
              {activeTool === 'career-coach' && (
                <div className="space-y-4 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Career Coach</h3>
                    <p className="text-xs text-slate-500">Get personalized career guidance and insights from your AI coach.</p>
                  </div>

                  {/* Chat logs */}
                  <div className="flex-grow border border-slate-100 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-950/20 max-h-[300px] overflow-y-auto space-y-3">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs rounded-xl p-3 text-xs leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-slate-150 text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-slate-150 p-3 rounded-xl text-xs dark:bg-slate-900 dark:border-slate-800 text-slate-550 flex items-center gap-1.5">
                          <RefreshCw size={12} className="animate-spin" /> Thinking...
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input Form */}
                  <form onSubmit={handleChatSubmit} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask the career coach..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-grow bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 text-xs font-bold"
                    >
                      Send
                    </button>
                  </form>
                </div>
              )}

              {/* 8. SALARY INSIGHTS */}
              {activeTool === 'salary-insights' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Salary Insights Benchmarking</h3>
                    <p className="text-xs text-slate-500">Benchmark your target role compensation across regional statistics.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Target Role</label>
                      <select
                        value={salaryRole}
                        onChange={(e) => setSalaryRole(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-700 dark:text-slate-300 outline-none"
                      >
                        <option value="Software Engineer">Software Engineer</option>
                        <option value="Senior Developer">Senior Developer</option>
                        <option value="Product Manager">Product Manager</option>
                        <option value="UI/UX Designer">UI/UX Designer</option>
                        <option value="Data Scientist">Data Scientist</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Location</label>
                      <select
                        value={salaryLocation}
                        onChange={(e) => setSalaryLocation(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-700 dark:text-slate-300 outline-none"
                      >
                        <option value="Remote">Remote</option>
                        <option value="New York, NY">New York, NY</option>
                        <option value="San Francisco, CA">San Francisco, CA</option>
                        <option value="Seattle, WA">Seattle, WA</option>
                      </select>
                    </div>
                  </div>

                  {salaryData && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/20 space-y-6"
                    >
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800">
                          <span className="block text-[9px] uppercase tracking-wider text-slate-450 font-bold">10th Percentile</span>
                          <span className="block text-sm font-extrabold text-slate-700 dark:text-slate-300 mt-1">${salaryData.min.toLocaleString()}</span>
                        </div>
                        <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg shadow-sm border border-blue-500/10">
                          <span className="block text-[9px] uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold">Median Base</span>
                          <span className="block text-md font-extrabold text-blue-700 dark:text-blue-300 mt-1">${salaryData.median.toLocaleString()}</span>
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800">
                          <span className="block text-[9px] uppercase tracking-wider text-slate-450 font-bold">90th Percentile</span>
                          <span className="block text-sm font-extrabold text-slate-700 dark:text-slate-300 mt-1">${salaryData.max.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-500 font-semibold">
                          <span>Market Trend: <strong className="text-emerald-500">{salaryData.trend}</strong></span>
                          <span>Confidence Level: <strong>High</strong></span>
                        </div>
                        <div className="relative w-full bg-slate-200 dark:bg-slate-850 h-3 rounded-full overflow-hidden">
                          <div className="absolute top-0 bottom-0 left-[20%] right-[30%] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AiTools;
