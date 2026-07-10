import React, { useState } from 'react';
import axios from 'axios';
import Card from '../components/Card';
import Button from '../components/Button';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setError('Please provide all details.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/enquiries', formData);
      setSuccess(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
      {/* Title Header */}
      <div className="space-y-4 text-center">
        <span className="text-[10px] uppercase tracking-[0.2em] text-luxury-gold-light font-semibold block">
          Connect
        </span>
        <h1 className="text-3xl md:text-5xl font-serif text-luxury-text-primary">
          Contact Our Workshop
        </h1>
        <p className="text-xs text-luxury-text-secondary max-w-xl mx-auto">
          Send a request or general question to our mechanical consulting team. We typically respond within 24 business hours.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left Column: Form */}
        <Card hoverable={false} className="space-y-6">
          <h2 className="text-xl font-serif text-luxury-gold-light mb-4">Send a Message</h2>
          
          {success ? (
            <div className="bg-luxury-gold-dark/10 border border-luxury-gold-light/20 p-6 rounded-xl space-y-4 text-center">
              <span className="text-2xl">✉️</span>
              <h3 className="text-sm font-semibold uppercase text-luxury-gold-light">Message Received</h3>
              <p className="text-xs text-luxury-text-secondary">
                Thank you for reaching out. A consultant from our service center will contact you shortly.
              </p>
              <Button variant="outline" size="sm" onClick={() => setSuccess(false)}>
                Send Another
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="text-xs text-red-400 bg-red-950/20 border border-red-900/50 p-3 rounded-lg">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-luxury-text-secondary mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Bruce Wayne"
                  className="w-full bg-luxury-bg-panel border border-white/5 focus:border-luxury-gold-light text-xs text-luxury-text-primary px-3 py-2.5 rounded-lg outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-luxury-text-secondary mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. bwayne@wayne.corp"
                  className="w-full bg-luxury-bg-panel border border-white/5 focus:border-luxury-gold-light text-xs text-luxury-text-primary px-3 py-2.5 rounded-lg outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-luxury-text-secondary mb-1">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Describe your service request or restoration question..."
                  rows="4"
                  className="w-full bg-luxury-bg-panel border border-white/5 focus:border-luxury-gold-light text-xs text-luxury-text-primary px-3 py-2.5 rounded-lg outline-none resize-none"
                  required
                />
              </div>

              <Button type="submit" variant="solid" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Submit Message'}
              </Button>
            </form>
          )}
        </Card>

        {/* Right Column: Direct Info & Map */}
        <div className="space-y-8 flex flex-col justify-between">
          <div className="space-y-6">
            <h2 className="text-xl font-serif text-luxury-gold-light">Studio Details</h2>
            
            <div className="space-y-4 text-xs">
              <div className="flex items-start space-x-3">
                <span className="text-lg">📍</span>
                <div>
                  <h4 className="font-semibold text-luxury-text-primary uppercase tracking-wider">Address</h4>
                  <p className="text-luxury-text-secondary mt-1">100 Precision Way, Suite A, Automotive District</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <span className="text-lg">📞</span>
                <div>
                  <h4 className="font-semibold text-luxury-text-primary uppercase tracking-wider">Phone</h4>
                  <p className="text-luxury-text-secondary mt-1">+1 (555) 007-0007</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <span className="text-lg">✉️</span>
                <div>
                  <h4 className="font-semibold text-luxury-text-primary uppercase tracking-wider">General Enquiries</h4>
                  <p className="text-luxury-text-secondary mt-1">service@velocitystudio.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Block Placeholder */}
          <div className="h-64 rounded-3xl overflow-hidden relative border border-white/5 shadow-inner">
            <div
              className="absolute inset-0 bg-cover bg-center grayscale filter opacity-45"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&q=80&w=800')" }}
            />
            <div className="absolute inset-0 bg-dark-overlay opacity-80" />
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-6 space-y-2">
              <span className="text-2xl">🗺️</span>
              <span className="text-[10px] uppercase tracking-widest text-luxury-gold-light font-bold">
                Automotive District Location
              </span>
              <span className="text-[9px] text-luxury-text-secondary">
                GPS: 34.0522° N, 118.2437° W
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
