import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LogIn, Mail, Lock, AlertCircle, Eye, EyeOff, User, Briefcase, ShieldCheck } from 'lucide-react';
import Logo from '../components/Logo';

const Login = () => {
  const { login, user } = useAuth();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (user) {
      redirectUser(user.role);
    }
  }, [user]);

  useEffect(() => {
    if (searchParams.get('expired')) {
      setError('Your session has expired. Please log in again.');
      addToast('Session expired. Please log in again.', 'warning');
    }
  }, [searchParams]);

  const redirectUser = (role) => {
    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'employer') navigate('/employer/dashboard');
    else navigate('/candidate/dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        addToast('Sign in successful. Welcome back!', 'success');
      } else {
        setError(res.message);
        addToast(res.message, 'error');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Demo Autofill Helper
  const handleQuickLogin = async (roleType) => {
    setError('');
    setLoading(true);
    let targetEmail = '';
    
    if (roleType === 'candidate') targetEmail = 'candidate@tetrahire.com';
    else if (roleType === 'employer') targetEmail = 'employer@tetrahire.com';
    else if (roleType === 'admin') targetEmail = 'admin@tetrahire.com';

    setEmail(targetEmail);
    setPassword('password');

    try {
      // Small timeout for visual feedback
      await new Promise(resolve => setTimeout(resolve, 600));
      const res = await login(targetEmail, 'password');
      if (res.success) {
        addToast(`Logged in as Demo ${roleType.charAt(0).toUpperCase() + roleType.slice(1)}!`, 'success');
      } else {
        setError(res.message);
        addToast(res.message, 'error');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to authenticate quick login.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Left Column: Visual Sidebar (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0b162c] text-white p-12 flex-col justify-between overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0b162c] via-[#0d2149] to-[#00BE9B]/40 z-0" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#00BE9B]/15 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] z-0" />

        <div className="relative z-10">
          <Logo size="lg" className="[&_span:last-child]:text-white" />
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
            Connect. Recite. <br />
            <span className="text-[#00BE9B]">Deploy Your Future.</span>
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            The next-generation hiring engine. Manage jobs, review portfolios, and coordinate workflows in an elegant, lightning-fast dashboard system.
          </p>
        </div>

        <div className="relative z-10 pt-8 border-t border-white/10 text-xs text-slate-400 flex items-center justify-between">
          <span>&copy; {new Date().getFullYear()} TetraHire</span>
          <span className="flex items-center gap-1">
            <ShieldCheck size={12} className="text-[#00BE9B]" /> Secure JWT Sandbox
          </span>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="w-full lg:w-1/2 flex items-start lg:items-center justify-center px-5 py-8 sm:p-12 md:p-16 min-h-screen lg:min-h-0">
        <div className="max-w-md w-full space-y-8 animate-fade-in">
          {/* Header Mobile Logo */}
          <div className="text-center space-y-3">
            <div className="flex justify-center lg:hidden mb-2">
              <Logo size="lg" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Welcome Back
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Sign in to manage your TetraHire recruiter or candidate profile
            </p>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-900 rounded-xl text-rose-800 dark:text-rose-300 text-xs flex gap-2.5 items-start animate-fade-in">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-[#00BE9B] transition-colors" size={16} />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-base lg:text-sm text-slate-800 dark:text-slate-100 outline-none transition-all focus:border-[#00BE9B] focus:ring-2 focus:ring-[#00BE9B]/10 shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-[#00BE9B] hover:text-[#00BE9B]/85 font-semibold transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-[#00BE9B] transition-colors" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-11 pr-12 text-base lg:text-sm text-slate-800 dark:text-slate-100 outline-none transition-all focus:border-[#00BE9B] focus:ring-2 focus:ring-[#00BE9B]/10 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-[#00BE9B] transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00BE9B] hover:bg-[#00BE9B]/90 text-white font-semibold text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#00BE9B]/10 hover:shadow-[#00BE9B]/20 active:scale-[0.98] transition-all disabled:opacity-65 cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In'} <LogIn size={15} />
            </button>
          </form>

          {/* Quick Demo Credentials Panel */}
          <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-500 uppercase tracking-wider">Quick Demo Sandbox Login</span>
              <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">Auto DB Bypass</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('candidate')}
                className="py-2.5 px-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:border-[#00BE9B] hover:bg-[#00BE9B]/5 text-slate-700 dark:text-slate-300 transition-all flex flex-col items-center gap-1 cursor-pointer"
              >
                <User size={14} className="text-[#00BE9B]" />
                Candidate
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('employer')}
                className="py-2.5 px-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:border-[#00BE9B] hover:bg-[#00BE9B]/5 text-slate-700 dark:text-slate-300 transition-all flex flex-col items-center gap-1 cursor-pointer"
              >
                <Briefcase size={14} className="text-[#00BE9B]" />
                Employer
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="py-2.5 px-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:border-red-400 hover:bg-red-500/5 text-slate-700 dark:text-slate-300 transition-all flex flex-col items-center gap-1 cursor-pointer"
              >
                <ShieldCheck size={14} className="text-red-400" />
                Admin
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#00BE9B] hover:text-[#00BE9B]/85 font-bold transition-colors">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
