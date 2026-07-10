import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password) {
      return setError('Please fill in all required fields.');
    }
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password, formData.phone);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-6 py-12">
      <Card hoverable={false} className="w-full max-w-md p-8 space-y-6">
        <div className="space-y-2 text-center">
          <span className="text-[9px] uppercase tracking-widest text-luxury-gold-light font-semibold block">
            Owner Registration
          </span>
          <h2 className="text-2xl font-serif text-luxury-text-primary uppercase tracking-wider">
            Create Account
          </h2>
        </div>

        {error && (
          <div className="text-xs text-red-400 bg-red-950/20 border border-red-900/50 p-3 rounded-lg" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs" noValidate>
          <div>
            <label htmlFor="name" className="block text-[10px] uppercase tracking-widest text-luxury-text-secondary mb-1">
              Full Name *
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. James Bond"
              className="w-full bg-luxury-bg-panel border border-white/5 focus:border-luxury-gold-light text-xs text-luxury-text-primary px-3 py-2.5 rounded-lg outline-none"
              required
              autoComplete="name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-[10px] uppercase tracking-widest text-luxury-text-secondary mb-1">
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="jbond@mi6.gov"
              className="w-full bg-luxury-bg-panel border border-white/5 focus:border-luxury-gold-light text-xs text-luxury-text-primary px-3 py-2.5 rounded-lg outline-none"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-[10px] uppercase tracking-widest text-luxury-text-secondary mb-1">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 007-0007"
              className="w-full bg-luxury-bg-panel border border-white/5 focus:border-luxury-gold-light text-xs text-luxury-text-primary px-3 py-2.5 rounded-lg outline-none"
              autoComplete="tel"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className="block text-[10px] uppercase tracking-widest text-luxury-text-secondary mb-1">
                Password *
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••"
                className="w-full bg-luxury-bg-panel border border-white/5 focus:border-luxury-gold-light text-xs text-luxury-text-primary px-3 py-2.5 rounded-lg outline-none"
                required
                autoComplete="new-password"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-[10px] uppercase tracking-widest text-luxury-text-secondary mb-1">
                Confirm *
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••"
                className="w-full bg-luxury-bg-panel border border-white/5 focus:border-luxury-gold-light text-xs text-luxury-text-primary px-3 py-2.5 rounded-lg outline-none"
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          <Button type="submit" variant="solid" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </Button>
        </form>

        <p className="text-center text-[11px] text-luxury-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="text-luxury-gold-light hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default RegisterPage;
