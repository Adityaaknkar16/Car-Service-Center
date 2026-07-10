import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from '../components/Card';
import Button from '../components/Button';

const AdminEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  const loadEnquiries = () => {
    setLoading(true);
    axios.get('/api/enquiries')
      .then((res) => setEnquiries(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  const handleToggleRead = async (id, currentReadState) => {
    try {
      await axios.patch(`/api/enquiries/${id}/read`, { isRead: !currentReadState });
      loadEnquiries();
      if (selectedEnquiry && selectedEnquiry._id === id) {
        setSelectedEnquiry(prev => ({ ...prev, isRead: !currentReadState }));
      }
    } catch (err) {
      alert('Failed to update enquiry status.');
    }
  };

  const handleInspect = async (enquiry) => {
    setSelectedEnquiry(enquiry);
    // Auto-mark as read on inspect if not already read
    if (!enquiry.isRead) {
      try {
        await axios.patch(`/api/enquiries/${enquiry._id}/read`, { isRead: true });
        loadEnquiries();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-xl md:text-2xl font-serif text-luxury-text-primary uppercase tracking-wider">
          Customer Enquiries
        </h1>
        <p className="text-xs text-luxury-text-secondary">
          Review messages, feedback, and custom request details sent via the Contact page.
        </p>
      </div>

      {/* Enquiries list */}
      {loading ? (
        <Card className="text-center py-12 text-xs text-luxury-text-secondary animate-pulse">
          Loading enquiries...
        </Card>
      ) : enquiries.length === 0 ? (
        <Card className="text-center py-12 text-xs text-luxury-text-secondary">
          No enquiries received.
        </Card>
      ) : (
        <div className="overflow-x-auto bg-luxury-bg-panel/40 rounded-2xl border border-white/5">
          <table className="w-full text-left text-xs text-luxury-text-secondary">
            <thead>
              <tr className="border-b border-white/5 uppercase text-[9px] tracking-wider text-luxury-text-primary font-semibold bg-luxury-bg-panel/60">
                <th className="py-4 px-6">Sender</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Message Preview</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((e) => (
                <tr key={e._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6">
                    <span className={`font-semibold ${!e.isRead ? 'text-luxury-text-primary' : 'text-luxury-text-secondary'}`}>
                      {e.name}
                    </span>
                  </td>
                  <td className="py-4 px-6">{e.email}</td>
                  <td className="py-4 px-6 max-w-xs truncate">{e.message}</td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => handleToggleRead(e._id, e.isRead)}
                      className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-semibold border ${
                        e.isRead
                          ? 'border-white/5 text-luxury-text-secondary/50'
                          : 'bg-luxury-gold-light/10 border-luxury-gold-light/30 text-luxury-gold-light'
                      }`}
                    >
                      {e.isRead ? 'Read' : 'Unread'}
                    </button>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="!px-3 !py-1 text-[11px]"
                      onClick={() => handleInspect(e)}
                    >
                      Read Message
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Inspect message Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-luxury-bg-deep/80 backdrop-blur-sm">
          <Card hoverable={false} className="w-full max-w-md space-y-6">
            <div className="flex justify-between items-start border-b border-white/5 pb-3">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-luxury-gold-light block">Message Detail</span>
                <h3 className="text-sm font-semibold uppercase text-luxury-text-primary">
                  From: {selectedEnquiry.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="text-luxury-text-secondary hover:text-luxury-text-primary text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-luxury-text-secondary block">Email</span>
                <a href={`mailto:${selectedEnquiry.email}`} className="text-luxury-gold-light font-semibold hover:underline">
                  {selectedEnquiry.email}
                </a>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-widest text-luxury-text-secondary block">Date Received</span>
                <span className="text-luxury-text-primary">
                  {new Date(selectedEnquiry.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-xs text-luxury-text-primary leading-relaxed max-h-48 overflow-y-auto">
              {selectedEnquiry.message}
            </div>

            <div className="flex justify-end pt-2 border-t border-white/5">
              <Button variant="solid" size="sm" onClick={() => setSelectedEnquiry(null)}>
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminEnquiries;
