import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(formData.email, formData.password);
      console.log('Logged-in User Object:', user);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-6 py-12">
      <Card hoverable={false} className="w-full max-w-md p-8 space-y-6">
        <div className="space-y-2 text-center">
          <span className="text-[9px] uppercase tracking-widest text-luxury-gold-light font-semibold block">
            Access Portal
          </span>
          <h2 className="text-2xl font-serif text-luxury-text-primary uppercase tracking-wider">
            Sign In
          </h2>
        </div>

        {error && (
          <div className="text-xs text-red-400 bg-red-950/20 border border-red-900/50 p-3 rounded-lg" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs" noValidate>
          <div>
            <label htmlFor="email" className="block text-[10px] uppercase tracking-widest text-luxury-text-secondary mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@domain.com"
              className="w-full bg-luxury-bg-panel border border-white/5 focus:border-luxury-gold-light text-xs text-luxury-text-primary px-3 py-2.5 rounded-lg outline-none"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[10px] uppercase tracking-widest text-luxury-text-secondary mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-luxury-bg-panel border border-white/5 focus:border-luxury-gold-light text-xs text-luxury-text-primary px-3 py-2.5 rounded-lg outline-none"
              required
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" variant="solid" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-[11px] text-luxury-text-secondary">
          Don't have an account?{' '}
          <Link to="/register" className="text-luxury-gold-light hover:underline font-semibold">
            Register here
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default LoginPage;
