import React, { useEffect, useState } from 'react';
import { fetchServices, createService, updateService, deleteService } from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';

const ManageServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Maintenance',
    image: '',
    inclusionsInput: '',
  });

  const loadServices = () => {
    setLoading(true);
    fetchServices()
      .then((res) => setServices(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleEditClick = (service) => {
    setEditingId(service._id);
    setForm({
      title: service.title,
      description: service.description,
      price: service.price,
      category: service.category || 'Maintenance',
      image: service.image || '',
      inclusionsInput: service.inclusions?.join(', ') || '',
    });
    setModalOpen(true);
  };

  const handleCreateClick = () => {
    setEditingId(null);
    setForm({
      title: '',
      description: '',
      price: '',
      category: 'Maintenance',
      image: '',
      inclusionsInput: '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service package?')) return;
    try {
      await deleteService(id);
      loadServices();
    } catch (err) {
      alert('Failed to delete service.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      category: form.category,
      image: form.image,
      inclusions: form.inclusionsInput.split(',').map(item => item.trim()).filter(Boolean),
    };

    try {
      if (editingId) {
        await updateService(editingId, payload);
      } else {
        await createService(payload);
      }
      setModalOpen(false);
      loadServices();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save service.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-serif text-luxury-text-primary uppercase tracking-wider">
            Manage Service Menu
          </h1>
          <p className="text-xs text-luxury-text-secondary">
            Configure workshop service packages, details, checklist inclusions, and pricing.
          </p>
        </div>
        <Button variant="solid" size="sm" onClick={handleCreateClick}>
          + Add Service
        </Button>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(n => (
            <div key={n} className="h-44 rounded-2xl bg-luxury-bg-panel animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((s) => (
            <Card key={s._id} hoverable={false} className="flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[9px] uppercase tracking-widest text-luxury-gold-light bg-luxury-gold-light/10 border border-luxury-gold-light/20 px-2 py-0.5 rounded">
                    {s.category}
                  </span>
                  <span className="text-sm font-bold text-luxury-gold-light">${s.price}</span>
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-luxury-text-primary mt-2">
                  {s.title}
                </h3>
                <p className="text-[11px] text-luxury-text-secondary leading-relaxed mt-1">
                  {s.description}
                </p>
                {s.inclusions?.length > 0 && (
                  <div className="mt-2 text-[10px] text-luxury-text-secondary/70">
                    Inclusions: {s.inclusions.join(' • ')}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-white/5 pt-3">
                <Button variant="ghost" size="sm" className="!px-3 !py-1 text-[11px]" onClick={() => handleEditClick(s)}>
                  Edit
                </Button>
                <Button variant="danger" size="sm" className="!px-3 !py-1 text-[11px]" onClick={() => handleDelete(s._id)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-luxury-bg-deep/80 backdrop-blur-sm">
          <Card hoverable={false} className="w-full max-w-lg space-y-6">
            <h2 className="text-lg font-serif text-luxury-gold-light">
              {editingId ? 'Edit Service Package' : 'Create New Service Package'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-luxury-text-secondary mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-luxury-bg-panel border border-white/5 text-luxury-text-primary px-3 py-2 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-luxury-text-secondary mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full bg-luxury-bg-panel border border-white/5 text-luxury-text-primary px-3 py-2 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-luxury-text-secondary mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-luxury-bg-panel border border-white/5 text-luxury-text-primary px-3 py-2 rounded-lg outline-none"
                  >
                    <option value="Maintenance">Maintenance</option>
                    <option value="Brakes">Brakes</option>
                    <option value="Detailing">Detailing</option>
                    <option value="Diagnostics">Diagnostics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-luxury-text-secondary mb-1">Image URL</label>
                  <input
                    type="text"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="w-full bg-luxury-bg-panel border border-white/5 text-luxury-text-primary px-3 py-2 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-luxury-text-secondary mb-1">Description</label>
                <textarea
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows="3"
                  className="w-full bg-luxury-bg-panel border border-white/5 text-luxury-text-primary px-3 py-2 rounded-lg outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-luxury-text-secondary mb-1">Inclusions (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Synthetic oil replacement, Filter cleaning, Fluids topped-off"
                  value={form.inclusionsInput}
                  onChange={(e) => setForm({ ...form, inclusionsInput: e.target.value })}
                  className="w-full bg-luxury-bg-panel border border-white/5 text-luxury-text-primary px-3 py-2 rounded-lg outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="solid" size="sm">
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ManageServices;
