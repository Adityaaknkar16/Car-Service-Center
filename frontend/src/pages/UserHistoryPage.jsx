import React, { useState, useEffect } from 'react';
import { getUserBookingHistory, cancelBooking } from '../services/api';
import '../styles/UserHistory-Pages.css';

const UserHistoryPage = () => {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ totalBookings: 0, completedBookings: 0, totalSpent: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await getUserBookingHistory();
        setBookings(response.data.data || []);
        setStats(response.data.stats || { totalBookings: 0, completedBookings: 0, totalSpent: 0 });
      } catch (err) {
        setError('Failed to fetch booking history. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleCancelBooking = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await cancelBooking(id);
      // Refresh local list status
      setBookings(bookings.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
    } catch (err) {
      alert('Failed to cancel appointment. Please contact support.');
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return {
      month: d.toLocaleString('en-US', { month: 'short' }),
      day: d.getDate(),
      full: d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    };
  };

  // Filter Bookings
  const filteredBookings = bookings.filter(b => {
    if (statusFilter === 'all') return true;
    return b.status === statusFilter;
  });

  // Sort Bookings
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (sortBy === 'date_desc') {
      return new Date(b.appointmentDate) - new Date(a.appointmentDate);
    }
    if (sortBy === 'date_asc') {
      return new Date(a.appointmentDate) - new Date(b.appointmentDate);
    }
    if (sortBy === 'cost_desc') {
      return b.totalAmount - a.totalAmount;
    }
    if (sortBy === 'cost_asc') {
      return a.totalAmount - b.totalAmount;
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="history-container" style={{ textAlign: 'center', padding: '100px 0' }}>
        <div className="spinner" style={{ margin: '0 auto 20px auto', width: '40px', height: '40px' }}></div>
        <p>Loading your appointments archive...</p>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <h1>My Booking History</h1>
        <p>Review, monitor progress, and manage your vehicle service logs.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Stats Dashboard */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Bookings</h3>
          <p className="stat-value">{stats.totalBookings}</p>
        </div>
        <div className="stat-card">
          <h3>Completed Services</h3>
          <p className="stat-value">{stats.completedBookings}</p>
        </div>
        <div className="stat-card">
          <h3>Total Spent</h3>
          <p className="stat-value">${stats.totalSpent.toFixed(2)}</p>
        </div>
      </div>

      {/* Filter and Sort controls */}
      <div className="controls-row">
        <div className="filter-group">
          <label htmlFor="statusFilter">Status:</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Bookings</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in-progress">In Progress</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="sort-group">
          <label htmlFor="sortBy">Sort By:</label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="cost_desc">Cost: High to Low</option>
            <option value="cost_asc">Cost: Low to High</option>
          </select>
        </div>
      </div>

      {/* Bookings Display */}
      {sortedBookings.length === 0 ? (
        <div className="empty-state">
          <h3>No Appointments Found</h3>
          <p>You do not have any services matching the selected status criteria.</p>
        </div>
      ) : (
        <div className="bookings-list">
          {sortedBookings.map((b) => {
            const dateObj = formatDate(b.appointmentDate);
            const isExpanded = expandedId === b._id;

            return (
              <div key={b._id} className="booking-card">
                <div className="booking-card-header" onClick={() => toggleExpand(b._id)}>
                  <div className="booking-main-info">
                    <div className="booking-date-badge">
                      <span className="date-month">{dateObj.month}</span>
                      <span className="date-day">{dateObj.day}</span>
                    </div>
                    <div className="booking-service-title">
                      <h3>{b.service ? b.service.name : 'Custom Service'}</h3>
                      <p>
                        {b.vehicle.year} {b.vehicle.make} {b.vehicle.model} &bull; {b.vehicle.licensePlate}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span className="booking-cost">${b.totalAmount}</span>
                    <span className={`status-badge ${b.status}`}>{b.status}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="booking-card-details">
                    <div className="details-grid">
                      {/* Booking Specs */}
                      <div className="details-section">
                        <h4>Appointment Specs</h4>
                        <div className="info-item">
                          <span>Full Date:</span>
                          <span>{dateObj.full}</span>
                        </div>
                        <div className="info-item">
                          <span>Time Slot:</span>
                          <span>{b.appointmentTime}</span>
                        </div>
                        <div className="info-item">
                          <span>Reference ID:</span>
                          <span>{b._id}</span>
                        </div>
                        <div className="info-item">
                          <span>Client Notes:</span>
                          <span>{b.notes || 'None'}</span>
                        </div>
                      </div>

                      {/* Repair Status Timeline */}
                      <div className="details-section">
                        <h4>Service Progress</h4>
                        {b.repairPhases && b.repairPhases.length > 0 ? (
                          <div className="timeline">
                            {b.repairPhases.map((phase, idx) => (
                              <div key={idx} className={`timeline-item ${phase.status}`}>
                                <div className="timeline-content">
                                  <div className="timeline-title">
                                    <span>{phase.phaseName}</span>
                                    <span className={`timeline-status ${phase.status}`}>{phase.status}</span>
                                  </div>
                                  <p className="timeline-desc">{phase.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ color: '#8c857b', fontSize: '0.95rem' }}>
                            No detailed repair progress timeline initialized for this service yet.
                          </p>
                        )}
                      </div>

                      {/* Vehicle Intake Photo */}
                      <div className="details-section">
                        <h4>Condition Photo</h4>
                        <div className="condition-photo-container">
                          {b.carConditionImage && b.carConditionImage.url ? (
                            <img
                              src={b.carConditionImage.url}
                              alt="Car Condition"
                              className="condition-img"
                            />
                          ) : (
                            <p style={{ color: '#8c857b', fontSize: '0.95rem', fontStyle: 'italic' }}>
                              No car condition photo uploaded by the technician at check-in.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {b.status === 'pending' && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #2d2922', paddingTop: '20px' }}>
                        <button
                          className="export-btn"
                          style={{ borderColor: '#e74c3c', color: '#e74c3c' }}
                          onClick={(e) => handleCancelBooking(b._id, e)}
                        >
                          Cancel Appointment
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserHistoryPage;
