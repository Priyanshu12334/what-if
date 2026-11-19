import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';

const Register = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/daily" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setError('Please provide a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password
      });
      navigate('/login', {
        state: { registered: true, email: email.trim() }
      });
    } catch (err) {
      setError(
        err.response?.data?.error || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      badge="JOIN FOR FREE"
      headline="Think. Pick. Compare."
      subtext="Create an account to vote on a daily what-if, explore categories and ask AI any what-if."
    >
      <h1 className="font-heading text-3xl font-bold text-[#F5F5F5] mb-2 text-center">
        Create your account
      </h1>
      <p className="font-body text-sm text-[#A1A1AA] mb-6 text-center">
        Join to vote on daily dilemmas and explore what-if scenarios.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-mono text-[11px] uppercase tracking-widest text-[#A1A1AA] mb-2">
            Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-11 rounded-none bg-[#0A0A0A] border border-white/20 text-[#F5F5F5] px-4 text-base lg:text-sm focus:outline-none focus:border-[#f2a93b] transition font-body"
          />
        </div>

        <div>
          <label className="block font-mono text-[11px] uppercase tracking-widest text-[#A1A1AA] mb-2">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 rounded-none bg-[#0A0A0A] border border-white/20 text-[#F5F5F5] px-4 text-base lg:text-sm focus:outline-none focus:border-[#f2a93b] transition font-body"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block font-mono text-[11px] uppercase tracking-widest text-[#A1A1AA]">
              Password
            </label>
            <span className="font-mono text-[11px] text-[#A1A1AA]">
              At least 6 characters
            </span>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 rounded-none bg-[#0A0A0A] border border-white/20 text-[#F5F5F5] px-4 pr-16 text-base lg:text-sm focus:outline-none focus:border-[#f2a93b] transition font-body"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs uppercase tracking-widest text-[#A1A1AA] hover:text-[#f2a93b] transition h-11 flex items-center cursor-pointer"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {error && (
          <p className="font-mono text-xs text-red-400 tracking-wide">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-none bg-[#f2a93b] hover:bg-[#d9922b] text-[#000000] font-body text-xs uppercase tracking-widest font-semibold px-6 transition disabled:opacity-50 cursor-pointer flex items-center justify-center"
        >
          {loading ? 'Please wait…' : 'Create Account'}
        </button>
      </form>

      <p className="mt-6 font-body text-xs text-[#A1A1AA] text-center">
        Already have an account?{' '}
        <Link
          to="/login"
          className="text-[#f2a93b] hover:underline font-mono uppercase tracking-widest ml-1"
        >
          Login
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
