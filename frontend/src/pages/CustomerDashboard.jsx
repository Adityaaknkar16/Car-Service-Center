import React, { useEffect, useState } from 'react';
import { fetchBookings, cancelBooking } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import StatusTracker from '../components/StatusTracker';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBookings = () => {
    setLoading(true);
    fetchBookings()
      .then((res) => {
        setBookings(res.data.data);
      })
      .catch((err) => {
        setError('Failed to retrieve bookings.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await cancelBooking(id);
      loadBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel appointment.');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-2xl md:text-3xl font-serif text-luxury-text-primary uppercase tracking-wide">
          Owner Dashboard
        </h1>
        <p className="text-xs text-luxury-text-secondary mt-1">
          Welcome back, <span className="text-luxury-gold-light font-semibold">{user?.name}</span>. Check the real-time status of your active servicing appointments.
        </p>
      </div>

      {error && (
        <div className="text-xs text-red-400 bg-red-950/20 border border-red-900/50 p-3 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(n => (
            <div key={n} className="h-44 rounded-2xl bg-luxury-bg-panel animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <Card hoverable={false} className="text-center py-12 space-y-4">
          <span className="text-3xl">📅</span>
          <h3 className="text-sm font-semibold uppercase text-luxury-text-primary">No Appointments</h3>
          <p className="text-xs text-luxury-text-secondary max-w-sm mx-auto">
            You do not have any service appointments scheduled. Click "Book Service" in the navigation bar to schedule one.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <Card key={booking._id} hoverable={false} className="flex flex-col space-y-6">
              {/* Header Details */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-4 gap-4">
                <div>
                  <span className="text-[8px] uppercase tracking-widest text-luxury-text-secondary">Vehicle Status for</span>
                  <h3 className="text-sm font-semibold text-luxury-text-primary uppercase tracking-wider">
                    {booking.vehicle?.year} {booking.vehicle?.make} {booking.vehicle?.model}
                  </h3>
                  <span className="text-[10px] text-luxury-text-secondary uppercase">
                    Plate: {booking.vehicle?.licensePlate}
                  </span>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[8px] uppercase tracking-widest text-luxury-text-secondary block">Scheduled visit</span>
                  <span className="text-xs font-semibold text-luxury-gold-light block">
                    {formatDate(booking.appointmentDate)}
                  </span>
                  <span className="text-[10px] text-luxury-text-secondary">
                    {booking.appointmentTime}
                  </span>
                </div>
              </div>

              {/* Status Tracker */}
              <StatusTracker currentStatus={booking.status} />

              {/* Service description info */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 text-xs">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-luxury-text-secondary block">
                    Service Plan
                  </span>
                  <span className="font-semibold text-luxury-text-primary uppercase">
                    {booking.service?.title || 'Custom Service'}
                  </span>
                  {booking.notes && (
                    <p className="text-[10px] text-luxury-text-secondary/70 mt-1 italic">
                      Notes: "{booking.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-luxury-text-secondary block">Total Amount</span>
                    <span className="font-bold text-luxury-gold-light">${booking.totalAmount}</span>
                  </div>

                  {booking.status === 'pending' && (
                    <Button variant="danger" size="sm" onClick={() => handleCancel(booking._id)}>
                      Cancel Visit
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
