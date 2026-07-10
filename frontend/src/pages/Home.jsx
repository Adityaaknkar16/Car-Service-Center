import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchServices } from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';

const Home = ({ onBookClick }) => {
  const [featuredServices, setFeaturedServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices({ available: true })
      .then((res) => {
        // Take the first 3 services as featured
        setFeaturedServices(res.data.data.slice(0, 3));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const features = [
    { title: 'Master Mechanics', desc: 'Factory-trained technicians handling luxury models.', icon: '🔧' },
    { title: 'OEM Components', desc: 'Only genuine original components are ever installed.', icon: '💎' },
    { title: 'Precision Tuning', desc: 'State-of-the-art diagnostic and engine calibrations.', icon: '📈' },
    { title: 'Exquisite Detailing', desc: 'Hand wash and multi-stage ceramic coatings.', icon: '✨' },
  ];

  const testimonials = [
    { name: 'Bruce Wayne', role: 'Supercar Enthusiast', comment: 'The only facility I trust with the Batmobile. Absolute discretion and master-class work.' },
    { name: 'Selina Kyle', role: 'Roadster Driver', comment: 'Speedy diagnostic scans, honest quotes, and a gorgeous dark-lounge waiting area. Highly recommend.' }
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Full-bleed Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center text-center overflow-hidden">
        {/* Hero Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1600')",
            filter: 'brightness(0.4)'
          }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-dark-overlay z-0" />

        {/* Ambient Corner Sparkle (SVG decoration) */}
        <div className="absolute top-12 left-12 text-luxury-gold-dark/40 animate-pulse pointer-events-none hidden md:block">
          ✦
        </div>
        <div className="absolute bottom-12 right-12 text-luxury-gold-dark/40 animate-pulse pointer-events-none hidden md:block">
          ✦
        </div>

        {/* Hero Text */}
        <div className="relative z-10 max-w-4xl px-6 space-y-6">
          <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-luxury-gold-light bg-luxury-gold-light/10 border border-luxury-gold-light/20 px-3 py-1 rounded-full">
            Elite Automotive Studio
          </span>
          <h1 className="text-4xl md:text-6xl font-serif leading-tight text-luxury-text-primary">
            Timeless Service. <br />
            <span className="italic text-luxury-gold-light">Modern Precision.</span>
          </h1>
          <p className="text-xs md:text-sm text-luxury-text-secondary max-w-lg mx-auto tracking-wide">
            Experience bespoke maintenance and restoration engineering designed exclusively for luxury, sport, and classic touring automobiles.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button variant="solid" onClick={onBookClick}>
              Book Now
            </Button>
            <a href="tel:+15550070007">
              <Button variant="outline">
                Call Studio
              </Button>
            </a>
          </div>

          {/* Carousel Dots */}
          <div className="flex justify-center space-x-2 pt-8">
            <span className="w-1.5 h-1.5 rounded-full bg-luxury-gold-light" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
          </div>
        </div>
      </section>

      {/* Feature Strip of Small Icon-Cards */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat) => (
            <Card key={feat.title} className="flex flex-col space-y-3" hoverable={true}>
              <span className="text-2xl">{feat.icon}</span>
              <h3 className="text-xs uppercase tracking-widest text-luxury-text-primary font-bold">
                {feat.title}
              </h3>
              <p className="text-xs text-luxury-text-secondary">
                {feat.desc}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Services & Packages Preview */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-4">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-luxury-gold-light block font-semibold">
              Selected Care
            </span>
            <h2 className="text-2xl md:text-3xl font-serif text-luxury-text-primary">
              Bespoke Service Packages
            </h2>
          </div>
          <Link to="/services">
            <span className="text-xs uppercase tracking-widest text-luxury-gold-light hover:underline font-medium">
              View All Services →
            </span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 rounded-2xl bg-luxury-bg-panel animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredServices.map((serv) => (
              <Card key={serv._id} className="flex flex-col justify-between h-96 overflow-hidden relative group">
                {/* Background image overlay */}
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-25 group-hover:opacity-40 transition-opacity duration-500 z-0"
                  style={{ backgroundImage: `url(${serv.image || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=800'})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-luxury-bg-panel via-luxury-bg-panel/85 to-transparent z-0" />

                <div className="relative z-10 space-y-4">
                  <span className="text-[9px] uppercase tracking-widest text-luxury-gold-light bg-luxury-gold-light/10 px-2 py-0.5 rounded border border-luxury-gold-light/20">
                    {serv.category}
                  </span>
                  <h3 className="text-lg font-serif text-luxury-text-primary uppercase">
                    {serv.title}
                  </h3>
                  <p className="text-xs text-luxury-text-secondary line-clamp-3">
                    {serv.description}
                  </p>
                </div>

                <div className="relative z-10 pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-widest text-luxury-text-secondary">Investment</span>
                    <span className="text-lg font-bold text-luxury-gold-light">${serv.price}</span>
                  </div>
                  <Button variant="solid" size="sm" onClick={onBookClick}>
                    Book Package
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Testimonials / Trust Strip */}
      <section className="bg-luxury-bg-panel border-y border-white/5 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-widest text-luxury-gold-light block font-semibold">
              Distinguished Reviews
            </span>
            <h2 className="text-2xl md:text-3xl font-serif text-luxury-text-primary">
              What Owners Say About Velocity
            </h2>
            <p className="text-xs text-luxury-text-secondary leading-relaxed">
              We care for each automobile as if it were a member of our personal collection. Here is how our clients rate our level of service.
            </p>
          </div>

          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {testimonials.map((t, idx) => (
              <Card key={idx} hoverable={false} className="flex flex-col justify-between">
                <p className="text-xs italic text-luxury-text-secondary leading-relaxed">
                  "{t.comment}"
                </p>
                <div className="mt-4 pt-4 border-t border-white/5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-luxury-text-primary">
                    {t.name}
                  </h4>
                  <span className="text-[9px] uppercase tracking-widest text-luxury-gold-dark font-medium">
                    {t.role}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
