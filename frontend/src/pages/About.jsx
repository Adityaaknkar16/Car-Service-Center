import React from 'react';
import Card from '../components/Card';

const About = () => {
  const stats = [
    { label: 'Years Experience', value: '15+' },
    { label: 'Vehicles Restored', value: '8,400+' },
    { label: 'Certified Masters', value: '12' },
    { label: 'Client Satisfaction', value: '99.8%' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-20">
      {/* Intro Hero */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="text-[10px] uppercase tracking-[0.2em] text-luxury-gold-light font-semibold block">
            Our Heritage
          </span>
          <h1 className="text-3xl md:text-5xl font-serif text-luxury-text-primary leading-tight">
            Crafting Perfection <br />
            <span className="italic text-luxury-gold-light">Since 2011</span>
          </h1>
          <p className="text-xs text-luxury-text-secondary leading-relaxed">
            Velocity Studio was born out of a simple vision: to create a service facility that treats engineering as an art form. We specialize in precision tuning, expert diagnostic analysis, and standard maintenance for vehicles that demand higher tolerances.
          </p>
          <p className="text-xs text-luxury-text-secondary leading-relaxed">
            Every vehicle that enters our facility undergoes a rigorous check by a dedicated team lead. We respect the engineering that went into your vehicle and make it our mission to restore and maintain its original performance specifications.
          </p>
        </div>

        <div className="relative rounded-3xl overflow-hidden glass-panel h-96">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=800')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-bg-deep to-transparent opacity-60" />
        </div>
      </section>

      {/* Metrics Counter Strip */}
      <section className="border-y border-white/5 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, idx) => (
            <div key={idx} className="space-y-2">
              <span className="text-3xl md:text-4xl font-serif text-luxury-gold-light font-bold">
                {stat.value}
              </span>
              <p className="text-[10px] uppercase tracking-widest text-luxury-text-secondary font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Values Cards */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] uppercase tracking-widest text-luxury-gold-light font-semibold">
            Foundations
          </span>
          <h2 className="text-2xl md:text-3xl font-serif text-luxury-text-primary">
            Our Core Disciplines
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card hoverable={true} className="space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-luxury-gold-light font-bold">
              Uncompromising Quality
            </h3>
            <p className="text-xs text-luxury-text-secondary leading-relaxed">
              We never cut corners. All diagnostic tests are thorough, and all components installed are certified OEM parts directly from the manufacturer.
            </p>
          </Card>

          <Card hoverable={true} className="space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-luxury-gold-light font-bold">
              Transparent Operations
            </h3>
            <p className="text-xs text-luxury-text-secondary leading-relaxed">
              Before we turn a single bolt, you receive a detailed, itemized quote. Our technicians are happy to walk you through error logs and mechanical wear.
            </p>
          </Card>

          <Card hoverable={true} className="space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-luxury-gold-light font-bold">
              Modern Tooling
            </h3>
            <p className="text-xs text-luxury-text-secondary leading-relaxed">
              We invest heavily in diagnostic hardware and training to interface correctly with the complex computing units of modern luxury and electric vehicles.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default About;
