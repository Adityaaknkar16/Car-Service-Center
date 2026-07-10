import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { fetchBookings } from '../services/api';
import Card from '../components/Card';
import StatusTracker from '../components/StatusTracker';

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const bookingsRes = await fetchBookings();
        setBookings(bookingsRes.data.data);

        const enquiriesRes = await axios.get('/api/enquiries');
        setEnquiries(enquiriesRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const activeBookings = bookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const currentOngoingBooking = activeBookings[0] || null;

  // Calculate monthly stats
  const totalRevenue = bookings.reduce((sum, b) => b.status === 'completed' ? sum + b.totalAmount : sum, 0);

  const stats = [
    { label: 'Active Servicings', value: activeBookings.length, icon: '⚡' },
    { label: 'Completed Deliveries', value: completedBookings.length, icon: '✅' },
    { label: 'Unread Enquiries', value: enquiries.filter(e => !e.isRead).length, icon: '✉️' },
    { label: 'Estimated Revenue', value: `$${totalRevenue.toFixed(0)}`, icon: '💰' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-xl md:text-2xl font-serif text-luxury-text-primary uppercase tracking-wider">
          System Overview
        </h1>
        <p className="text-xs text-luxury-text-secondary">
          Live statistics, customer service workflows, and performance metrics.
        </p>
      </div>

      {/* Stats Cards Row */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-28 rounded-2xl bg-luxury-bg-panel animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <Card key={idx} hoverable={true} className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-widest text-luxury-text-secondary block font-semibold">
                  {stat.label}
                </span>
                <span className="text-xl font-serif text-luxury-gold-light font-bold">
                  {stat.value}
                </span>
              </div>
              <span className="text-2xl p-2 bg-white/5 rounded-xl border border-white/5">
                {stat.icon}
              </span>
            </Card>
          ))}
        </div>
      )}

      {/* Main Stepper Track Widget & Revenue Mini Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tracker Widget */}
        <Card hoverable={false} className="lg:col-span-2 space-y-6 flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div>
              <span className="text-[8px] uppercase tracking-widest text-luxury-gold-light font-semibold">
                Live Stepper
              </span>
              <h2 className="text-sm font-serif text-luxury-text-primary uppercase">
                Primary Ongoing Service
              </h2>
            </div>
            {currentOngoingBooking && (
              <span className="text-[10px] text-luxury-text-secondary uppercase">
                Plate: {currentOngoingBooking.vehicle?.licensePlate}
              </span>
            )}
          </div>

          {currentOngoingBooking ? (
            <div className="space-y-6 py-4">
              <div className="text-center">
                <h3 className="text-xs uppercase tracking-wider text-luxury-text-primary font-bold">
                  {currentOngoingBooking.customer?.name} – {currentOngoingBooking.vehicle?.year} {currentOngoingBooking.vehicle?.make} {currentOngoingBooking.vehicle?.model}
                </h3>
                <span className="text-[10px] text-luxury-text-secondary">
                  Servicing: {currentOngoingBooking.service?.title}
                </span>
              </div>
              <StatusTracker currentStatus={currentOngoingBooking.status} />
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-luxury-text-secondary">
              No vehicles currently active in the workshop.
            </div>
          )}
        </Card>

        {/* Revenue Mini Chart */}
        <Card hoverable={false} className="space-y-4">
          <div className="border-b border-white/5 pb-2">
            <span className="text-[8px] uppercase tracking-widest text-luxury-gold-light font-semibold">
              Performance
            </span>
            <h2 className="text-sm font-serif text-luxury-text-primary uppercase">
              Revenue Study
            </h2>
          </div>

          {/* Elegant SVG Line Chart */}
          <div className="h-28 w-full relative pt-4">
            <svg viewBox="0 0 300 100" className="w-full h-full">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d4c4a0" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#d4c4a0" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="20" x2="300" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="0" y1="50" x2="300" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="0" y1="80" x2="300" y2="80" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              
              {/* Path area */}
              <path
                d="M 10 90 Q 50 80, 80 50 T 150 40 T 220 20 T 290 10 L 290 90 Z"
                fill="url(#chartGrad)"
              />
              {/* Glowing Line */}
              <path
                d="M 10 90 Q 50 80, 80 50 T 150 40 T 220 20 T 290 10"
                fill="none"
                stroke="#d4c4a0"
                strokeWidth="2"
                className="drop-shadow-[0_2px_4px_rgba(212,196,160,0.3)]"
              />
            </svg>
          </div>

          <div className="flex justify-between items-center text-[10px] text-luxury-text-secondary uppercase">
            <span>Jan – Jun</span>
            <span className="text-luxury-gold-light font-semibold">+35% Growth</span>
          </div>
        </Card>
      </div>

      {/* Recent Bookings Table */}
      <Card hoverable={false} className="space-y-6">
        <h2 className="text-sm font-serif text-luxury-text-primary uppercase border-b border-white/5 pb-4">
          Recent Appointments
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-luxury-text-secondary">
            <thead>
              <tr className="border-b border-white/5 uppercase text-[9px] tracking-wider text-luxury-text-primary font-semibold">
                <th className="py-3">Owner</th>
                <th className="py-3">Vehicle</th>
                <th className="py-3">Service Package</th>
                <th className="py-3">Cost</th>
                <th className="py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice(0, 5).map((booking) => (
                <tr key={booking._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 font-medium text-luxury-text-primary">{booking.customer?.name || 'N/A'}</td>
                  <td className="py-3 uppercase">
                    {booking.vehicle?.year} {booking.vehicle?.make} {booking.vehicle?.model}
                  </td>
                  <td className="py-3 uppercase text-[10px]">{booking.service?.title || 'Custom Plan'}</td>
                  <td className="py-3 font-semibold text-luxury-gold-light">${booking.totalAmount}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-semibold ${
                      booking.status === 'completed'
                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800'
                        : booking.status === 'cancelled'
                        ? 'bg-red-950/40 text-red-400 border border-red-900'
                        : 'bg-amber-950/40 text-amber-400 border border-amber-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
