import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { 
  Users, Briefcase, Building2, BarChart3, Mail, Lock, 
  Eye, EyeOff, ShieldCheck, ArrowRight, ArrowLeft, Loader2, Sparkles, Check
} from 'lucide-react';

const SignIn = () => {
  const [email, setEmail] = useState('gumansingh.web@gmail.com');
  const [password, setPassword] = useState('12345678');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      const user = await login(email.trim(), password);
      
      if (user && user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        setError('Access denied. Administrator privileges required.');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setError(err.response?.data?.message || 'Invalid admin credentials. Please verify your email and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ebf3ff] via-[#dbeafe] to-[#c7d2fe] flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-8%] w-[45vw] h-[45vw] rounded-full bg-blue-300/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-300/30 blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative w-full max-w-6xl bg-white/40 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(28,57,143,0.18)] border border-white/80 p-4 sm:p-8 md:p-10 lg:p-12 z-10 flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
        
        {/* Left Side: Brand, Value Proposition & Laptop Preview Mockup */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between self-stretch">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/25">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-extrabold tracking-tight text-gray-900">
                  JobBazar<span className="text-blue-600">.com</span>
                </span>
                <p className="text-[11px] text-gray-500 font-medium tracking-wide">Connecting Talent with Opportunity</p>
              </div>
            </div>

            {/* Title & Subtitle */}
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-3">
              Admin <span className="text-blue-600">Panel</span>
            </h1>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-8 max-w-md">
              Manage Jobs, Users, Companies and keep your platform running smoothly.
            </p>

            {/* Feature Highlights */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Manage Users</h4>
                  <p className="text-xs text-gray-500">Job seekers, employers & admins</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0 text-purple-600">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Monitor Job Listings</h4>
                  <p className="text-xs text-gray-500">Approve, edit and track jobs</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Manage Companies</h4>
                  <p className="text-xs text-gray-500">Verify and maintain company profiles</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-600">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">View Reports</h4>
                  <p className="text-xs text-gray-500">Track growth and performance</p>
                </div>
              </div>
            </div>
          </div>

          {/* Perspective Dashboard Preview Card */}
          <div className="hidden sm:block mt-2 relative">
            <div className="bg-gradient-to-tr from-slate-900 to-slate-800 rounded-2xl p-4 shadow-xl border border-slate-700/60 text-white">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  <span className="text-[11px] font-semibold text-slate-400 ml-2">JobBazar Dashboard Live</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live System
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/40">
                  <div className="text-[11px] text-slate-400">Total Users</div>
                  <div className="text-base font-extrabold text-white mt-0.5">12,450</div>
                  <div className="text-[10px] text-emerald-400 font-medium mt-0.5">↑ 12%</div>
                </div>
                <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/40">
                  <div className="text-[11px] text-slate-400">Active Jobs</div>
                  <div className="text-base font-extrabold text-white mt-0.5">2,845</div>
                  <div className="text-[10px] text-emerald-400 font-medium mt-0.5">↑ 18%</div>
                </div>
                <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/40">
                  <div className="text-[11px] text-slate-400">Companies</div>
                  <div className="text-base font-extrabold text-white mt-0.5">1,128</div>
                  <div className="text-[10px] text-emerald-400 font-medium mt-0.5">↑ 10%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Admin Login Card */}
        <div className="w-full lg:w-1/2">
          <div className="bg-white rounded-3xl shadow-[0_15px_45px_rgba(30,41,59,0.1)] border border-gray-100 p-6 sm:p-10 relative">
            
            {/* Top Security Badge */}
            <div className="flex items-center justify-between mb-8">
              <Link 
                to="/" 
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Map
              </Link>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Secure Admin Login</span>
              </div>
            </div>

            {/* Header in Card */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 mb-3 shadow-inner">
                <Briefcase className="w-7 h-7" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Admin Login</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Enter your credentials to access the admin panel
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium flex items-start gap-2.5 animate-shake">
                <span className="text-red-500 font-bold shrink-0 mt-0.5">!</span>
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your admin email"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-11 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Quick fill hint */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-gray-600 select-none font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('gumansingh.web@gmail.com');
                    setPassword('12345678');
                  }}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Fill credentials
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Admin Access...</span>
                  </>
                ) : (
                  <>
                    <span>Login to Admin Panel</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick MongoDB Credentials Note */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
              <span className="flex items-center gap-1.5 font-medium text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> MongoDB Cloud Connected
              </span>
              <span className="text-gray-400">Protected Administrator Portal</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default SignIn;
