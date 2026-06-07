import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { useToast } from '../components/Toast';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('consumer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState({});
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Invalid email format';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setValidation(errs);
    if (Object.keys(errs).length) return;

    setError('');
    setLoading(true);
    try {
      const user = await register({ name, email, password, role });
      toast.success('Account created successfully!');
      navigate(user.role === 'provider' ? '/provider/browse' : '/consumer/requests');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16">
      <h2 className="text-2xl font-bold text-center mb-8 font-montserrat text-[#1A1A1A]">Create Account</h2>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-4" style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-inter">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-[#757575] mb-1 font-inter">Name</label>
          <input type="text" required value={name} onChange={(e) => { setName(e.target.value); setValidation((v) => ({...v, name: undefined})); }}
            className={`input-field ${validation.name ? 'border-red-400 focus:ring-red-400' : ''}`} />
          {validation.name && <p className="text-xs text-red-500 mt-1 font-inter">{validation.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-[#757575] mb-1 font-inter">Email</label>
          <input type="email" required value={email} onChange={(e) => { setEmail(e.target.value); setValidation((v) => ({...v, email: undefined})); }}
            className={`input-field ${validation.email ? 'border-red-400 focus:ring-red-400' : ''}`} />
          {validation.email && <p className="text-xs text-red-500 mt-1 font-inter">{validation.email}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-[#757575] mb-1 font-inter">Password</label>
          <input type="password" required minLength={6} value={password} onChange={(e) => { setPassword(e.target.value); setValidation((v) => ({...v, password: undefined})); }}
            className={`input-field ${validation.password ? 'border-red-400 focus:ring-red-400' : ''}`} />
          {validation.password && <p className="text-xs text-red-500 mt-1 font-inter">{validation.password}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-[#757575] mb-2 font-inter">I am a...</label>
          <div className="flex gap-4">
            <label className={`flex-1 border rounded-lg p-3 text-center cursor-pointer transition font-inter ${role === 'consumer' ? 'border-[#003366] bg-navy-50' : 'border-gray-300 hover:border-gray-400'}`}>
              <input type="radio" name="role" value="consumer" checked={role === 'consumer'} onChange={() => setRole('consumer')} className="sr-only" />
              <span className="text-sm font-semibold text-[#1A1A1A]">Client</span>
              <p className="text-xs text-[#757575] mt-1">I need services</p>
            </label>
            <label className={`flex-1 border rounded-lg p-3 text-center cursor-pointer transition font-inter ${role === 'provider' ? 'border-[#003366] bg-navy-50' : 'border-gray-300 hover:border-gray-400'}`}>
              <input type="radio" name="role" value="provider" checked={role === 'provider'} onChange={() => setRole('provider')} className="sr-only" />
              <span className="text-sm font-semibold text-[#1A1A1A]">Provider</span>
              <p className="text-xs text-[#757575] mt-1">I offer services</p>
            </label>
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="btn-primary w-full">
          {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</span> : 'Create Account'}
        </button>
        <p className="text-center text-sm text-[#757575] font-inter">
          Already have an account? <Link to="/login" className="text-[#00BFA5] hover:underline font-semibold">Sign In</Link>
        </p>
      </form>
    </div>
  );
}