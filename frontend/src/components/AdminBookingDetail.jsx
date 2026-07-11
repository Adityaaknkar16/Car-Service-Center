import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import StatusTracker from './StatusTracker';
import RepairImageGallery from './RepairImageGallery';
import RepairProgressUpload from './RepairProgressUpload';
import { updateBookingStatus, fetchBookingById } from '../services/api';

const AdminBookingDetail = ({ booking: initialBooking, onClose, onRefresh }) => {
  const [booking, setBooking] = useState(initialBooking);
  const [activeTab, setActiveTab] = useState('customer');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [status, setStatus] = useState(booking.status);
  const [repairNotes, setRepairNotes] = useState(booking.repairNotes || '');
  const [updating, setUpdating] = useState(false);

  const reloadBooking = async () => {
    try {
      const res = await fetchBookingById(booking._id);
      setBooking(res.data.data);
      setStatus(res.data.data.status);
      setRepairNotes(res.data.data.repairNotes || '');
    } catch (err) {
      console.error('Failed to reload booking details');
    }
  };

  const handleUpdateStatusAndNotes = async () => {
    setUpdating(true);
    try {
      await updateBookingStatus(booking._id, status, repairNotes);
      await reloadBooking();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Failed to update status/notes');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const customerImages = booking.images || [];
  const progressImages = booking.repairProgressImages || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-luxury-bg-deep/80 backdrop-blur-sm">
      <Card hoverable={false} className="w-full max-w-5xl max-h-[90vh] flex flex-col space-y-6 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-white/5 pb-4">
          <div>
            <span className="text-[9px] uppercase tracking-widest text-luxury-gold-light block">Workshop Appointment</span>
            <h2 className="text-lg font-serif text-luxury-text-primary uppercase">
              Booking ID: #{booking._id.slice(-6)}
            </h2>
          </div>
          <button onClick={onClose} className="text-luxury-text-secondary hover:text-luxury-text-primary text-xl">
            ✕
          </button>
        </div>

        {/* Top Status Tracker Widget */}
        <div className="py-2 bg-white/5 rounded-2xl p-4 border border-white/5">
          <span className="text-[9px] uppercase tracking-widest text-luxury-text-secondary block mb-3 text-center">
            Service Progression Track
          </span>
          <StatusTracker currentStatus={booking.status} />
        </div>

        {/* Content Split: Details & Image Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Details Section (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-luxury-text-secondary">Customer Specifications</h4>
                <div className="mt-1.5 space-y-1">
                  <p className="text-sm font-semibold text-luxury-text-primary">{booking.customer?.name}</p>
                  <p className="text-xs text-luxury-text-secondary">{booking.customer?.email}</p>
                  <p className="text-xs text-luxury-text-secondary">{booking.customer?.phone}</p>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-luxury-text-secondary">Vehicle Details</h4>
                <div className="mt-1.5 space-y-1">
                  <p className="text-xs text-luxury-text-primary uppercase font-semibold">
                    {booking.vehicle?.year} {booking.vehicle?.make} {booking.vehicle?.model}
                  </p>
                  <p className="text-xs text-luxury-text-secondary uppercase">
                    License Plate: {booking.vehicle?.licensePlate}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-luxury-text-secondary">Appointment details</h4>
                <div className="mt-1.5 space-y-1">
                  <p className="text-xs text-luxury-text-primary">{formatDate(booking.appointmentDate)}</p>
                  <p className="text-xs text-luxury-text-secondary">{booking.appointmentTime}</p>
                  <p className="text-xs text-luxury-gold-light font-bold">Estimated Cost: ${booking.totalAmount}</p>
                </div>
              </div>

              {booking.notes && (
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-luxury-text-secondary">Customer Notes</h4>
                  <p className="text-xs text-luxury-text-secondary/80 mt-1 italic">
                    "{booking.notes}"
                  </p>
                </div>
              )}
            </div>

            {/* Admin Status Update & Notes form */}
            <div className="pt-4 border-t border-white/5 space-y-4">
              <h4 className="text-[10px] uppercase tracking-widest text-luxury-gold-light font-bold">Update Job Status</h4>
              
              <div>
                <label className="block text-[9px] uppercase tracking-widest text-luxury-text-secondary mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-luxury-bg-deep border border-white/10 text-xs text-luxury-text-primary px-3 py-2 rounded-lg outline-none cursor-pointer"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in-progress">In Progress</option>
                  <option value="ready">Ready</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-widest text-luxury-text-secondary mb-1">
                  Repair Progress Notes
                </label>
                <textarea
                  value={repairNotes}
                  onChange={(e) => setRepairNotes(e.target.value)}
                  placeholder="Describe repair actions, parts ordered, or estimated completion times..."
                  rows="3"
                  className="w-full bg-luxury-bg-deep border border-white/10 text-xs text-luxury-text-primary px-3 py-2 rounded-lg outline-none resize-none"
                />
              </div>

              <Button
                variant="solid"
                size="sm"
                onClick={handleUpdateStatusAndNotes}
                disabled={updating}
                className="w-full"
              >
                {updating ? 'Saving...' : 'Update Status & Notes'}
              </Button>
            </div>
          </div>

          {/* Images Section (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h4 className="text-[10px] uppercase tracking-widest text-luxury-text-secondary font-bold">Image Records</h4>
              <Button
                variant="solid"
                size="sm"
                className="!px-3 !py-1 text-[10px]"
                onClick={() => setIsUploadOpen(true)}
              >
                Add Photos
              </Button>
            </div>

            {/* Tabs for Stage Filters */}
            <div className="flex border-b border-white/5">
              <button
                onClick={() => setActiveTab('customer')}
                className={`flex-1 py-2 text-[10px] uppercase tracking-wider font-semibold border-b-2 transition-all ${
                  activeTab === 'customer'
                    ? 'border-luxury-gold-light text-luxury-gold-light'
                    : 'border-transparent text-luxury-text-secondary hover:text-luxury-text-primary'
                }`}
              >
                Customer ({customerImages.length})
              </button>
              <button
                onClick={() => setActiveTab('before')}
                className={`flex-1 py-2 text-[10px] uppercase tracking-wider font-semibold border-b-2 transition-all ${
                  activeTab === 'before'
                    ? 'border-luxury-gold-light text-luxury-gold-light'
                    : 'border-transparent text-luxury-text-secondary hover:text-luxury-text-primary'
                }`}
              >
                Before ({progressImages.filter(img => img.stage === 'before').length})
              </button>
              <button
                onClick={() => setActiveTab('during')}
                className={`flex-1 py-2 text-[10px] uppercase tracking-wider font-semibold border-b-2 transition-all ${
                  activeTab === 'during'
                    ? 'border-luxury-gold-light text-luxury-gold-light'
                    : 'border-transparent text-luxury-text-secondary hover:text-luxury-text-primary'
                }`}
              >
                During ({progressImages.filter(img => img.stage === 'during').length})
              </button>
              <button
                onClick={() => setActiveTab('after')}
                className={`flex-1 py-2 text-[10px] uppercase tracking-wider font-semibold border-b-2 transition-all ${
                  activeTab === 'after'
                    ? 'border-luxury-gold-light text-luxury-gold-light'
                    : 'border-transparent text-luxury-text-secondary hover:text-luxury-text-primary'
                }`}
              >
                After ({progressImages.filter(img => img.stage === 'after').length})
              </button>
            </div>

            {/* Gallery View */}
            <div className="mt-4">
              {activeTab === 'customer' ? (
                <RepairImageGallery
                  images={customerImages}
                  stageFilter="all"
                  canUpload={false}
                />
              ) : (
                <RepairImageGallery
                  images={progressImages}
                  stageFilter={activeTab}
                  canUpload={true}
                  onUpload={() => setIsUploadOpen(true)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Repair Progress Upload Modal */}
        <RepairProgressUpload
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          bookingId={booking._id}
          onUploadSuccess={reloadBooking}
        />
      </Card>
    </div>
  );
};

export default AdminBookingDetail;
