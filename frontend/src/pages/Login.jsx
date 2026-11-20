import { useState } from 'react';
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';

const Login = () => {
  const { user, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const registered = location.state?.registered;
  const [email, setEmail] = useState(location.state?.email || '');
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
    setLoading(true);
    try {
      await login(email, password);
      navigate('/daily');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      badge="WELCOME BACK"
      headline="Your universes await."
      subtext="Log in to vote, keep your streak alive and compare your what-if questions with real users."
    >
      <h1 className="font-heading text-3xl font-bold text-[#F5F5F5] mb-2 text-center">
        Welcome back
      </h1>
      <p className="font-body text-sm text-[#A1A1AA] mb-6 text-center">
        Enter your credentials to continue.
      </p>

      {registered && (
        <p className="font-mono text-xs text-[#f2a93b] mb-4 uppercase tracking-widest">
          Account created. Please log in.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
          <label className="block font-mono text-[11px] uppercase tracking-widest text-[#A1A1AA] mb-2">
            Password
          </label>
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
          {loading ? 'Please wait…' : 'Sign In'}
        </button>
      </form>

      <p className="mt-6 font-body text-xs text-[#A1A1AA] text-center">
        New here?{' '}
        <Link
          to="/register"
          className="text-[#f2a93b] transition-colors duration-200 hover:text-[#FFB52E] no-underline font-mono uppercase tracking-widest ml-1"
        >
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
