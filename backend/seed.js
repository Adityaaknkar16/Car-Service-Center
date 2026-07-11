const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Service = require('./models/Service');
const Booking = require('./models/Booking');
const Enquiry = require('./models/Enquiry');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/car-service-center';

const servicesData = [
  {
    title: 'Full Synthetic Oil Change',
    description: 'Includes premium synthetic oil, new filter, fluid level checks, and 25-point visual inspection.',
    price: 89.99,
    category: 'Maintenance',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=800',
    inclusions: [
      'Up to 5 quarts of synthetic oil',
      'Premium oil filter replacement',
      'Fluid top-off (windshield, coolant)',
      'Tire rotation & pressure check',
      'Cabin and engine air filter check'
    ]
  },
  {
    title: 'Brake Pad & Rotor Service',
    description: 'Complete replacement of front or rear brake pads and high-performance rotor surfacing.',
    price: 199.99,
    category: 'Brakes',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=800',
    inclusions: [
      'Premium ceramic brake pads',
      'Rotors inspected & resurfaced',
      'Caliper pin lubrication',
      'Brake fluid flush & replacement',
      'Road test for verification'
    ]
  },
  {
    title: 'Elite Ceramic Detailing',
    description: 'Luxury multi-stage exterior polish, clay bar paint correction, and 1-year ceramic seal coatings.',
    price: 349.99,
    category: 'Detailing',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&q=80&w=800',
    inclusions: [
      'Decontamination & clay bar wash',
      'Single-stage machine polish',
      '1-year ceramic paint sealant',
      'Deep interior steam clean & shampoo',
      'Leather leather trim restoration'
    ]
  },
  {
    title: 'Engine Diagnostic & Tune-up',
    description: 'Comprehensive OBD-II system analysis, spark plug inspection, and air/fuel system cleaning.',
    price: 129.99,
    category: 'Diagnostics',
    isAvailable: true,
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=800',
    inclusions: [
      'OBD-II trouble code diagnosis',
      'Spark plug replacement check',
      'Throttle body & fuel injector cleaning',
      'Battery, alternator & starter test',
      'Full sensor reading logs'
    ]
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('CONNECTED TO MONGO FOR SEEDING');

    // Clean current db
    await User.deleteMany({});
    await Service.deleteMany({});
    await Booking.deleteMany({});
    await Enquiry.deleteMany({});
    console.log('🗑️ Database cleared');

    // Create Admin
    const admin = await User.create({
      name: 'Aston Martin Admin',
      email: 'admin@carcenter.com',
      password: 'admin123',
      phone: '+1 (555) 987-6543',
      role: 'admin'
    });
    console.log('👑 Admin user created (admin@carcenter.com / admin123)');

    // Create Customer
    const customer = await User.create({
      name: 'James Bond',
      email: 'customer@carcenter.com',
      password: 'customer123',
      phone: '+1 (555) 007-0007',
      role: 'customer'
    });
    console.log('👤 Customer user created (customer@carcenter.com / customer123)');

    // Seed Services
    const seededServices = await Service.insertMany(servicesData);
    console.log(`🚗 Seeded ${seededServices.length} service packages`);

    // Create a Sample Booking for customer
    const sampleBooking = await Booking.create({
      customer: customer._id,
      service: seededServices[0]._id,
      vehicle: {
        make: 'Aston Martin',
        model: 'DB11',
        year: 2022,
        licensePlate: '007-JB'
      },
      status: 'in-progress',
      appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      appointmentTime: '10:00 AM - 12:00 PM',
      notes: 'Please check the rear oil slick dispenser too.',
      totalAmount: seededServices[0].price
    });
    console.log('📅 Sample booking created for customer');

    // Create a Sample Enquiry
    await Enquiry.create({
      name: 'Q Branch',
      email: 'q@mi6.gov.uk',
      message: 'Do you offer custom modifications for ejection seats?'
    });
    console.log('✉️ Sample customer enquiry created');

    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULY');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedDB();
