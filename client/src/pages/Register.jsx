import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserPlus, Mail, Lock, User, Briefcase, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import Logo from '../components/Logo';

const Register = () => {
  const { register, user } = useAuth();
  const { addToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('candidate');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      redirectUser(user.role);
    }
  }, [user]);

  const redirectUser = (role) => {
    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'employer') navigate('/employer/dashboard');
    else navigate('/candidate/dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (role === 'employer' && !companyName) {
      setError('Company name is required for Employer accounts.');
      addToast('Company name is required.', 'error');
      setLoading(false);
      return;
    }

    try {
      const payload = { name, email, password, role };
      if (role === 'employer') {
        payload.companyName = companyName;
      }

      const res = await register(payload);
      if (res.success) {
        addToast('Registration successful. Welcome to TetraHire!', 'success');
      } else {
        setError(res.message);
        addToast(res.message, 'error');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create account.';
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
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#00BE9B]/15 rounded-full blur-3xl" />
        <div className="absolute top-20 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:16px_16px] z-0" />

        <div className="relative z-10">
          <Logo size="lg" className="[&_span:last-child]:text-white" />
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
            Launch Your Journey <br />
            <span className="text-[#00BE9B]">With TetraHire.</span>
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            Create an account to gain instant access to thousands of listings, direct application management tools, and recruiter verification features.
          </p>
        </div>

        <div className="relative z-10 pt-8 border-t border-white/10 text-xs text-slate-400 flex items-center justify-between">
          <span>&copy; {new Date().getFullYear()} TetraHire</span>
          <span className="flex items-center gap-1">
            <ShieldCheck size={12} className="text-[#00BE9B]" /> 100% Sandbox Safe
          </span>
        </div>
      </div>

      {/* Right Column: Registration Form */}
      <div className="w-full lg:w-1/2 flex items-start lg:items-center justify-center px-5 py-8 sm:p-12 md:p-16 min-h-screen lg:min-h-0">
        <div className="max-w-md w-full space-y-8 animate-fade-in">
          {/* Header Mobile Logo */}
          <div className="text-center space-y-3">
            <div className="flex justify-center lg:hidden mb-2">
              <Logo size="lg" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Create an Account
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Sign up today and experience professional hiring matching
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
                Full Name
              </label>
              <div className="relative group">
                <User className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-[#00BE9B] transition-colors" size={16} />
                <input
                  type="text"
                  required
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-base lg:text-sm text-slate-800 dark:text-slate-100 outline-none transition-all focus:border-[#00BE9B] focus:ring-2 focus:ring-[#00BE9B]/10 shadow-sm"
                />
              </div>
            </div>

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
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-[#00BE9B] transition-colors" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Min. 6 characters"
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

            {/* Interactive Role Cards */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Register As
              </label>
              <div className="grid grid-cols-2 gap-3.5">
                {/* Candidate Card */}
                <button
                  type="button"
                  onClick={() => setRole('candidate')}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all select-none h-28 cursor-pointer relative ${
                    role === 'candidate'
                      ? 'border-[#00BE9B] bg-[#00BE9B]/5 ring-2 ring-[#00BE9B]/10 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <User size={20} className={role === 'candidate' ? 'text-[#00BE9B]' : 'text-slate-400'} />
                    {role === 'candidate' && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#00BE9B]" />
                    )}
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold ${role === 'candidate' ? 'text-[#00BE9B]' : 'text-slate-800 dark:text-slate-200'}`}>Candidate</h3>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Find jobs, submit CV, and track applications.</p>
                  </div>
                </button>

                {/* Employer Card */}
                <button
                  type="button"
                  onClick={() => setRole('employer')}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all select-none h-28 cursor-pointer relative ${
                    role === 'employer'
                      ? 'border-[#00BE9B] bg-[#00BE9B]/5 ring-2 ring-[#00BE9B]/10 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <Briefcase size={20} className={role === 'employer' ? 'text-[#00BE9B]' : 'text-slate-400'} />
                    {role === 'employer' && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#00BE9B]" />
                    )}
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold ${role === 'employer' ? 'text-[#00BE9B]' : 'text-slate-800 dark:text-slate-200'}`}>Employer</h3>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Post openings, review applications, hire talent.</p>
                  </div>
                </button>
              </div>
            </div>

            {role === 'employer' && (
              <div className="space-y-1.5 animate-fade-in">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Company Name
                </label>
                <div className="relative group">
                  <Briefcase className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-[#00BE9B]" size={16} />
                  <input
                    type="text"
                    required
                    placeholder="Acme Corporation"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-base lg:text-sm text-slate-800 dark:text-slate-100 outline-none transition-all focus:border-[#00BE9B] focus:ring-2 focus:ring-[#00BE9B]/10 shadow-sm"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00BE9B] hover:bg-[#00BE9B]/90 text-white font-semibold text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#00BE9B]/10 hover:shadow-[#00BE9B]/20 active:scale-[0.98] transition-all disabled:opacity-65 cursor-pointer"
            >
              {loading ? 'Registering...' : 'Sign Up'} <UserPlus size={15} />
            </button>
          </form>

          <p className="text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-[#00BE9B] hover:text-[#00BE9B]/85 font-bold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
