import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  Phone, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import { loginUser, registerUser } from '../services/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Auth({ onAuthSuccess, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetErrors = () => {
    setError(null);
  };

  const handleToggleMode = (newMode) => {
    setMode(newMode);
    resetErrors();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetErrors();

    // Client-side Validation
    const cleanEmail = email.trim();
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password || password.trim().length === 0) {
      setError('Password is required.');
      return;
    }

    if (mode === 'register') {
      const cleanName = fullName.trim();
      if (!cleanName || cleanName.length < 2) {
        setError('Please enter your full name (minimum 2 characters).');
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const data = await loginUser({
          email: cleanEmail,
          password,
        });

        if (onAuthSuccess) {
          onAuthSuccess(data);
        }
      } else {
        const data = await registerUser({
          fullName: fullName.trim(),
          email: cleanEmail,
          password,
          phone: phone.trim() ? phone.trim() : undefined,
        });

        if (onAuthSuccess) {
          onAuthSuccess(data);
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF8F4] py-12 sm:py-20 min-h-[75vh] flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-6 sm:px-8">
        
        {/* Mode Toggle Tabs */}
        <div className="flex rounded-full bg-stone-200/60 p-1 mb-8 max-w-[280px] mx-auto border border-black/5">
          <button
            type="button"
            onClick={() => handleToggleMode('login')}
            className={`flex-1 py-1.5 px-4 rounded-full text-xs sm:text-sm font-medium transition duration-150 ${
              mode === 'login'
                ? 'bg-white text-[#222222] shadow-xs'
                : 'text-[#6B6B6B] hover:text-[#222222]'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => handleToggleMode('register')}
            className={`flex-1 py-1.5 px-4 rounded-full text-xs sm:text-sm font-medium transition duration-150 ${
              mode === 'register'
                ? 'bg-white text-[#222222] shadow-xs'
                : 'text-[#6B6B6B] hover:text-[#222222]'
            }`}
          >
            Create account
          </button>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-3xl border border-black/5 p-7 sm:p-10 shadow-xs text-left">
          
          {/* Header Section */}
          <div className="mb-6">
            <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-[#D86F5C] mb-1.5">
              {mode === 'login' ? 'WELCOME BACK' : 'JOIN SHOPKART'}
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#222222] tracking-tight">
              {mode === 'login' ? 'Good to see you.' : 'Shop smarter from the start.'}
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6B6B] mt-2 leading-relaxed">
              {mode === 'login'
                ? 'Sign in to keep your shopping activity connected across ShopKart.'
                : 'Create an account to save products, track prices, and manage your orders.'}
            </p>
          </div>

          {/* Inline Error Alert */}
          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200/70 text-rose-700 flex items-start gap-2.5 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name (Register only) */}
            {mode === 'register' && (
              <div>
                <label
                  htmlFor="auth-fullName"
                  className="block text-[11px] font-medium uppercase tracking-wider text-[#6B6B6B] mb-1.5"
                >
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B] pointer-events-none">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="auth-fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (error) resetErrors();
                    }}
                    placeholder="e.g. Shubham Saini"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-black/10 text-sm text-[#222222] placeholder:text-[#6B6B6B]/60 focus:outline-none focus:border-[#D86F5C] bg-[#FAF8F4]/50 transition"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label
                htmlFor="auth-email"
                className="block text-[11px] font-medium uppercase tracking-wider text-[#6B6B6B] mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B] pointer-events-none">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) resetErrors();
                  }}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-black/10 text-sm text-[#222222] placeholder:text-[#6B6B6B]/60 focus:outline-none focus:border-[#D86F5C] bg-[#FAF8F4]/50 transition"
                />
              </div>
            </div>

            {/* Phone Number (Register only - optional) */}
            {mode === 'register' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="auth-phone"
                    className="block text-[11px] font-medium uppercase tracking-wider text-[#6B6B6B]"
                  >
                    Phone Number
                  </label>
                  <span className="text-[10px] text-[#6B6B6B] uppercase">Optional</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B] pointer-events-none">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    id="auth-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (error) resetErrors();
                    }}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-black/10 text-sm text-[#222222] placeholder:text-[#6B6B6B]/60 focus:outline-none focus:border-[#D86F5C] bg-[#FAF8F4]/50 transition"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="auth-password"
                  className="block text-[11px] font-medium uppercase tracking-wider text-[#6B6B6B]"
                >
                  Password
                </label>
                {mode === 'register' && (
                  <span className="text-[10px] text-[#6B6B6B]">Min. 6 chars</span>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6B6B] pointer-events-none">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="auth-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) resetErrors();
                  }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-black/10 text-sm text-[#222222] placeholder:text-[#6B6B6B]/60 focus:outline-none focus:border-[#D86F5C] bg-[#FAF8F4]/50 transition"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 rounded-full bg-[#222222] hover:bg-[#333333] text-white text-sm font-medium transition duration-150 active:scale-[0.98] shadow-xs flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span>
                  {loading
                    ? mode === 'login'
                      ? 'Signing in...'
                      : 'Creating account...'
                    : mode === 'login'
                    ? 'Sign in'
                    : 'Create account'}
                </span>
                {!loading && <ArrowRight className="w-4 h-4 text-[#D86F5C]" />}
              </button>
            </div>
          </form>

          {/* Switch Mode Footer Link */}
          <div className="mt-7 pt-5 border-t border-black/[0.05] text-center">
            {mode === 'login' ? (
              <p className="text-xs text-[#6B6B6B]">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleToggleMode('register')}
                  className="font-medium text-[#222222] hover:text-[#D86F5C] underline transition"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p className="text-xs text-[#6B6B6B]">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleToggleMode('login')}
                  className="font-medium text-[#222222] hover:text-[#D86F5C] underline transition"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
