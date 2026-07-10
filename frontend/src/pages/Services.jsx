import React, { useEffect, useState } from 'react';
import { fetchServices } from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';

const Services = ({ onBookClick }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchServices()
      .then((res) => {
        setServices(res.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', 'Maintenance', 'Brakes', 'Detailing', 'Diagnostics'];

  const filteredServices = selectedCategory === 'All'
    ? services
    : services.filter(s => s.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      {/* Title Header */}
      <div className="space-y-4 text-center">
        <span className="text-[10px] uppercase tracking-[0.2em] text-luxury-gold-light font-semibold block">
          Care Menu
        </span>
        <h1 className="text-3xl md:text-5xl font-serif text-luxury-text-primary">
          Services & Custom Packages
        </h1>
        <p className="text-xs text-luxury-text-secondary max-w-xl mx-auto">
          Explore our master-level maintenance plans. Choose from pre-configured diagnostic, tuning, and detailing packages or customize your service visit.
        </p>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap justify-center gap-2 border-b border-white/5 pb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-semibold border transition-all ${
              selectedCategory === cat
                ? 'bg-luxury-gold-light border-luxury-gold-light text-luxury-bg-deep'
                : 'border-white/5 text-luxury-text-secondary hover:border-white/20 hover:text-luxury-text-primary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Service Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-80 rounded-2xl bg-luxury-bg-panel animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredServices.map((serv) => (
            <Card key={serv._id} className="flex flex-col justify-between h-[450px] relative overflow-hidden group">
              {/* Image Overlay */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-20 transition-opacity duration-500 z-0"
                style={{ backgroundImage: `url(${serv.image || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=800'})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-bg-panel via-luxury-bg-panel/90 to-transparent z-0" />

              <div className="relative z-10 space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] uppercase tracking-widest text-luxury-gold-light bg-luxury-gold-light/10 border border-luxury-gold-light/20 px-2 py-0.5 rounded">
                    {serv.category}
                  </span>
                  <span className="text-xl font-bold font-serif text-luxury-gold-light">
                    ${serv.price}
                  </span>
                </div>

                <h3 className="text-xl font-serif text-luxury-text-primary uppercase tracking-wide">
                  {serv.title}
                </h3>

                <p className="text-xs text-luxury-text-secondary leading-relaxed">
                  {serv.description}
                </p>

                {/* Inclusions Checklist */}
                {serv.inclusions?.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-[10px] uppercase tracking-widest text-luxury-text-primary font-semibold">
                      What's Included:
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {serv.inclusions.map((inc, i) => (
                        <li key={i} className="text-xs text-luxury-text-secondary flex items-start">
                          <span className="text-luxury-gold-light mr-2">✓</span>
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="relative z-10 pt-4 border-t border-white/5 flex justify-end mt-auto">
                <Button variant="solid" size="sm" onClick={() => onBookClick(serv._id)}>
                  Book This Service
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Services;
