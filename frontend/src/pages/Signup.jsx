import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Bike, Mail, Lock, User, ShieldAlert, CheckCircle2, Apple, Phone } from 'lucide-react';
import BikeLoader from '../components/BikeLoader';

const GoogleIcon = () => (
  <svg className="w-4 h-4 text-orange-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-6.887 4.114-4.68 0-8.472-3.84-8.472-8.514S7.56 1.486 12.24 1.486c2.146 0 4.1.79 5.612 2.083l3.228-3.228C18.665.86 15.65 0 12.24 0 5.58 0 0 5.58 0 12.24s5.58 12.24 12.24 12.24c7.666 0 12.308-5.385 12.308-12.514 0-.742-.083-1.442-.236-2.185H12.24z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-4 h-4 text-indigo-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const Signup = () => {
  const { signup } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signup(email, name, password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.email?.[0] || 
        err.response?.data?.password?.[0] || 
        'Registration failed. Please review input values.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSocialClick = (platform) => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto my-12 px-4">
        <div className="bg-dark-surface border border-dark-border rounded-2xl p-8 shadow-xl text-center flex flex-col items-center justify-center min-h-[300px]">
          <BikeLoader message={success ? "Creating Profile..." : "Registering Account..."} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <div className="bg-dark-surface border border-dark-border rounded-2xl p-8 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex bg-primary/10 border border-primary/20 p-3 rounded-xl text-primary mb-2">
            <Bike className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">Join Motronix</h2>
          <p className="text-sm text-gray-400">Unlock marketplace and AI riding intelligence tools.</p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm flex items-start space-x-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Registration Successful!</p>
              <p className="text-xs text-emerald-400/80">Redirecting to login dashboard...</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-sm flex items-start space-x-2.5">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rider"
                className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rider@motronix.com"
                className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••• (Min 6 characters)"
                className="w-full bg-dark-bg border border-dark-border rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-orange-500/15"
          >
            Create Account
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="absolute inset-x-0 h-[1px] bg-dark-border"></div>
          <span className="relative bg-dark-surface px-3.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            OR REGISTER WITH
          </span>
        </div>

        {/* Social Authentication Options */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleSocialClick('Google')}
            className="flex items-center justify-center space-x-2 bg-slate-900 border border-dark-border hover:border-orange-500 text-gray-300 hover:text-white py-2.5 px-3 rounded-xl text-xs font-bold transition-all"
          >
            <GoogleIcon />
            <span>Google</span>
          </button>
          
          <button
            onClick={() => handleSocialClick('Facebook')}
            className="flex items-center justify-center space-x-2 bg-slate-900 border border-dark-border hover:border-indigo-500 text-gray-300 hover:text-white py-2.5 px-3 rounded-xl text-xs font-bold transition-all"
          >
            <FacebookIcon />
            <span>Facebook</span>
          </button>

          <button
            onClick={() => handleSocialClick('Apple')}
            className="flex items-center justify-center space-x-2 bg-slate-950 border border-dark-border hover:border-white text-gray-300 hover:text-white py-2.5 px-3 rounded-xl text-xs font-bold col-span-2 transition-all"
          >
            <Apple className="w-4 h-4 text-white" />
            <span>Register with Apple</span>
          </button>

          <button
            onClick={() => handleSocialClick('Mobile OTP')}
            className="flex items-center justify-center space-x-2 bg-slate-900 border border-dark-border/60 hover:border-primary text-gray-400 hover:text-white py-2.5 px-3 rounded-xl text-xs font-bold col-span-2 transition-all"
          >
            <Phone className="w-4 h-4 text-primary" />
            <span>Register with Mobile OTP</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="text-center pt-4 border-t border-dark-border/40">
          <p className="text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
