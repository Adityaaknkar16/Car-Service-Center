import React, { useEffect, useState } from 'react';
import { fetchBookings, updateBookingStatus } from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import StatusTracker from '../components/StatusTracker';

const ManageAppointments = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const loadBookings = () => {
    setLoading(true);
    fetchBookings()
      .then((res) => setBookings(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await updateBookingStatus(id, status);
      loadBookings();
      if (selectedBooking && selectedBooking._id === id) {
        setSelectedBooking(prev => ({ ...prev, status }));
      }
    } catch (err) {
      alert('Failed to update booking status.');
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = filterStatus === 'All' || b.status === filterStatus.toLowerCase();
    const customerName = b.customer?.name || '';
    const vehicleName = `${b.vehicle?.make} ${b.vehicle?.model}`.toLowerCase();
    const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) || vehicleName.includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statuses = ['All', 'Pending', 'Confirmed', 'In-Progress', 'Ready', 'Completed', 'Cancelled'];

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-xl md:text-2xl font-serif text-luxury-text-primary uppercase tracking-wider">
          Manage Appointments
        </h1>
        <p className="text-xs text-luxury-text-secondary">
          Track customer booking details, schedule slots, and update vehicle servicing progress.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search customer or car..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-luxury-bg-panel border border-white/5 text-xs text-luxury-text-primary px-3 py-2 pl-8 rounded-lg outline-none"
          />
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs">🔍</span>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap gap-1.5">
          {statuses.map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold border transition-all ${
                filterStatus === st
                  ? 'bg-luxury-gold-light border-luxury-gold-light text-luxury-bg-deep'
                  : 'border-white/5 text-luxury-text-secondary hover:border-white/20'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      {loading ? (
        <Card className="text-center py-12 text-xs text-luxury-text-secondary animate-pulse">
          Loading appointments...
        </Card>
      ) : filteredBookings.length === 0 ? (
        <Card className="text-center py-12 text-xs text-luxury-text-secondary">
          No appointments matches current filters.
        </Card>
      ) : (
        <div className="overflow-x-auto bg-luxury-bg-panel/40 rounded-2xl border border-white/5">
          <table className="w-full text-left text-xs text-luxury-text-secondary">
            <thead>
              <tr className="border-b border-white/5 uppercase text-[9px] tracking-wider text-luxury-text-primary font-semibold bg-luxury-bg-panel/60">
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Vehicle</th>
                <th className="py-4 px-6">Service</th>
                <th className="py-4 px-6">Scheduled Date</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => (
                <tr key={b._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-semibold text-luxury-text-primary">{b.customer?.name}</div>
                    <div className="text-[10px] text-luxury-text-secondary/70">{b.customer?.email}</div>
                  </td>
                  <td className="py-4 px-6 uppercase">
                    {b.vehicle?.year} {b.vehicle?.make} {b.vehicle?.model}
                  </td>
                  <td className="py-4 px-6 uppercase text-[10px]">{b.service?.title || 'Custom Plan'}</td>
                  <td className="py-4 px-6">
                    <div>{formatDate(b.appointmentDate)}</div>
                    <div className="text-[10px] text-luxury-text-secondary/70">{b.appointmentTime}</div>
                  </td>
                  <td className="py-4 px-6">
                    <select
                      value={b.status}
                      onChange={(e) => handleStatusChange(b._id, e.target.value)}
                      className="bg-luxury-bg-deep border border-white/10 text-[10px] uppercase font-semibold text-luxury-gold-light px-2 py-1 rounded outline-none cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="in-progress">In Progress</option>
                      <option value="ready">Ready</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="!px-3 !py-1 text-[11px]"
                      onClick={() => setSelectedBooking(b)}
                    >
                      Inspect
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Inspection Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-luxury-bg-deep/80 backdrop-blur-sm">
          <Card hoverable={false} className="w-full max-w-lg space-y-6">
            <div className="flex justify-between items-start border-b border-white/5 pb-3">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-luxury-gold-light block">Inspection</span>
                <h3 className="text-sm font-semibold uppercase text-luxury-text-primary">
                  Booking #{selectedBooking._id.slice(-6)}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-luxury-text-secondary hover:text-luxury-text-primary text-sm"
              >
                ✕
              </button>
            </div>

            {/* Stepper Status */}
            <div className="py-2">
              <span className="text-[9px] uppercase tracking-widest text-luxury-text-secondary block mb-4 text-center">
                Current Servicing Status
              </span>
              <StatusTracker currentStatus={selectedBooking.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-luxury-text-secondary block">Owner Details</span>
                <span className="text-luxury-text-primary block font-medium">{selectedBooking.customer?.name}</span>
                <span className="text-luxury-text-secondary/70 block text-[10px]">{selectedBooking.customer?.email}</span>
                <span className="text-luxury-text-secondary/70 block text-[10px]">{selectedBooking.customer?.phone}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-widest text-luxury-text-secondary block">Vehicle Specifications</span>
                <span className="text-luxury-text-primary block uppercase font-medium">
                  {selectedBooking.vehicle?.year} {selectedBooking.vehicle?.make} {selectedBooking.vehicle?.model}
                </span>
                <span className="text-luxury-text-secondary/70 block text-[10px] uppercase">
                  License: {selectedBooking.vehicle?.licensePlate}
                </span>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 text-xs">
              <span className="text-[9px] uppercase tracking-widest text-luxury-text-secondary block">Service Plan</span>
              <span className="text-luxury-text-primary block uppercase font-medium">
                {selectedBooking.service?.title || 'Custom'}
              </span>
              {selectedBooking.notes && (
                <p className="text-[10px] text-luxury-text-secondary/70 mt-1 italic">
                  Notes: "{selectedBooking.notes}"
                </p>
              )}
            </div>

            <div className="flex justify-between items-center border-t border-white/5 pt-4">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-luxury-text-secondary block">Service Invoice</span>
                <span className="text-base font-bold text-luxury-gold-light">${selectedBooking.totalAmount}</span>
              </div>
              <Button variant="solid" size="sm" onClick={() => setSelectedBooking(null)}>
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ManageAppointments;
