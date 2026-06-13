import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { useToast } from '../components/Toast';
import SocialLogin from '../components/SocialLogin';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState({});
  const { login, hasRole } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Invalid email format';
    if (!password) errs.password = 'Password is required';
    return errs;
  };

  const getRedirectPath = (user) => {
    const roles = user.roles || [user.role].filter(Boolean);
    const isProvider = roles.includes('provider');
    const isConsumer = roles.includes('consumer');
    if (isProvider && !isConsumer) return '/provider/browse';
    if (isConsumer && !isProvider) return '/consumer/requests';
    // Both roles — show consumer dashboard by default (navbar shows both)
    return '/';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setValidation(errs);
    if (Object.keys(errs).length) return;

    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success('Signed in successfully!');
      navigate(getRedirectPath(user));
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16">
      <h2 className="text-2xl font-bold text-center mb-8 font-montserrat text-[#1A1A1A]">Welcome Back</h2>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-4" style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-inter">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-[#757575] mb-1 font-inter">Email</label>
          <input type="email" required value={email} onChange={(e) => { setEmail(e.target.value); setValidation((v) => ({...v, email: undefined})); }}
            className={`input-field ${validation.email ? 'border-red-400 focus:ring-red-400' : ''}`} />
          {validation.email && <p className="text-xs text-red-500 mt-1 font-inter">{validation.email}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-[#757575] mb-1 font-inter">Password</label>
          <input type="password" required value={password} onChange={(e) => { setPassword(e.target.value); setValidation((v) => ({...v, password: undefined})); }}
            className={`input-field ${validation.password ? 'border-red-400 focus:ring-red-400' : ''}`} />
          {validation.password && <p className="text-xs text-red-500 mt-1 font-inter">{validation.password}</p>}
        </div>
        <button type="submit" disabled={loading}
          className="btn-primary w-full">
          {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</span> : 'Sign In'}
        </button>
        <p className="text-center text-sm text-[#757575] font-inter">
          Don't have an account? <Link to="/register" className="text-[#00BFA5] hover:underline font-semibold">Register</Link>
        </p>
      </form>
      <SocialLogin />
    </div>
  );
}