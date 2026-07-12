import React, { useState, useEffect, useRef } from 'react';
import {
  searchUsersByName,
  getUserBookings,
  addRepairPhases,
  updatePhaseStatus,
  uploadPhaseImages,
  uploadCarImage,
} from '../services/api';
import '../styles/UserHistory-Pages.css';

const AdminUserHistoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserBookings, setSelectedUserBookings] = useState([]);
  const [userStats, setUserStats] = useState(null);

  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [expandedBookingId, setExpandedBookingId] = useState(null);
  const [newPhaseName, setNewPhaseName] = useState('');
  const [newPhaseDesc, setNewPhaseDesc] = useState('');

  // Image Upload Refs and states
  const carImageInputRef = useRef(null);
  const [uploadingCarId, setUploadingCarId] = useState(null);

  const phaseImageInputRef = useRef(null);
  const [uploadingPhaseIdx, setUploadingPhaseIdx] = useState(null);
  const [uploadingPhaseBookingId, setUploadingPhaseBookingId] = useState(null);

  // Debouncing search
  useEffect(() => {
    if (!searchTerm) {
      setUsers([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoadingSearch(true);
      try {
        const response = await searchUsersByName(searchTerm);
        setUsers(response.data.data || []);
      } catch (err) {
        console.error('Failed to search users', err);
      } finally {
        setLoadingSearch(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const selectUser = async (user) => {
    setSelectedUser(user);
    setLoadingDetails(true);
    setExpandedBookingId(null);
    try {
      const response = await getUserBookings(user.id);
      setSelectedUserBookings(response.data.data || []);
      setUserStats(response.data.stats || null);
    } catch (err) {
      console.error('Failed to get user bookings', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleInitializePhases = async (bookingId) => {
    const defaultPhases = [
      { phaseName: 'Inspection', description: 'Technicians inspect vehicle and document components.', status: 'in-progress' },
      { phaseName: 'Parts Sourcing', description: 'Ordering and delivering high performance OEM components.', status: 'pending' },
      { phaseName: 'Technical Service', description: 'Installing replacement equipment and conducting servicing.', status: 'pending' },
      { phaseName: 'Road Test & Wash', description: 'Detailed diagnostic drive and final detail wash.', status: 'pending' }
    ];

    try {
      const response = await addRepairPhases(bookingId, defaultPhases);
      // Update local state
      setSelectedUserBookings(selectedUserBookings.map(b => b._id === bookingId ? response.data.data : b));
      alert('Repair progress phases initialized successfully!');
    } catch (err) {
      alert('Failed to add phases.');
    }
  };

  const handleAddCustomPhase = async (bookingId) => {
    if (!newPhaseName) {
      alert('Phase name is required');
      return;
    }

    const booking = selectedUserBookings.find(b => b._id === bookingId);
    const existingPhases = booking.repairPhases || [];
    const newPhases = [
      ...existingPhases.map(p => ({
        phaseName: p.phaseName,
        description: p.description,
        status: p.status
      })),
      { phaseName: newPhaseName, description: newPhaseDesc, status: 'pending' }
    ];

    try {
      const response = await addRepairPhases(bookingId, newPhases);
      setSelectedUserBookings(selectedUserBookings.map(b => b._id === bookingId ? response.data.data : b));
      setNewPhaseName('');
      setNewPhaseDesc('');
    } catch (err) {
      alert('Failed to add custom phase');
    }
  };

  const handleUpdatePhaseStatus = async (bookingId, phaseIndex, newStatus) => {
    try {
      const response = await updatePhaseStatus(bookingId, phaseIndex, newStatus);
      setSelectedUserBookings(selectedUserBookings.map(b => b._id === bookingId ? response.data.data : b));
    } catch (err) {
      alert('Failed to update phase status');
    }
  };

  const triggerCarImageUpload = (bookingId) => {
    setUploadingCarId(bookingId);
    setTimeout(() => {
      carImageInputRef.current.click();
    }, 100);
  };

  const handleCarImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !uploadingCarId) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await uploadCarImage(uploadingCarId, file);
      setSelectedUserBookings(selectedUserBookings.map(b => b._id === uploadingCarId ? response.data.data : b));
      alert('Intake vehicle image uploaded successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload image.');
    } finally {
      setUploadingCarId(null);
      e.target.value = null;
    }
  };

  const triggerPhaseImageUpload = (bookingId, phaseIndex) => {
    setUploadingPhaseBookingId(bookingId);
    setUploadingPhaseIdx(phaseIndex);
    setTimeout(() => {
      phaseImageInputRef.current.click();
    }, 100);
  };

  const handlePhaseImageFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0 || uploadingPhaseIdx === null || !uploadingPhaseBookingId) return;

    try {
      const response = await uploadPhaseImages(uploadingPhaseBookingId, uploadingPhaseIdx, files, 'Phase documentation');
      setSelectedUserBookings(selectedUserBookings.map(b => b._id === uploadingPhaseBookingId ? response.data.data : b));
      alert('Phase documentation images added!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload phase images.');
    } finally {
      setUploadingPhaseBookingId(null);
      setUploadingPhaseIdx(null);
      e.target.value = null;
    }
  };

  const triggerExport = (userId) => {
    window.open(`/api/bookings/admin/user/${userId}/export`, '_blank');
  };

  return (
    <div className="history-container">
      <div className="history-header">
        <h1>User Booking Archives</h1>
        <p>Search clients, analyze stats, update progress phases, and upload vehicle condition photos.</p>
      </div>

      <div className="admin-split-layout">
        {/* Search Panel (Left) */}
        <div className="search-panel">
          <h3>Customer Search</h3>
          <div className="search-box-container">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loadingSearch ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div className="spinner" style={{ margin: '0 auto', width: '25px', height: '25px' }}></div>
            </div>
          ) : (
            <div className="user-results-list">
              {users.map(u => (
                <div
                  key={u.id}
                  className={`user-result-item ${selectedUser?.id === u.id ? 'selected' : ''}`}
                  onClick={() => selectUser(u)}
                >
                  <h4>{u.name}</h4>
                  <p>{u.email}</p>
                  <p style={{ marginTop: '5px', color: '#d4af37' }}>
                    Appointments count: {u.bookingCount}
                  </p>
                </div>
              ))}
              {searchTerm && users.length === 0 && (
                <p style={{ color: '#8c857b', textAlign: 'center' }}>No users match search criteria.</p>
              )}
            </div>
          )}
        </div>

        {/* Details Panel (Right) */}
        <div className="detail-panel">
          {selectedUser ? (
            <div>
              {/* Profile card */}
              <div className="profile-card">
                <div className="profile-info">
                  <h3>{selectedUser.name}</h3>
                  <p>Email: {selectedUser.email} | Phone: {selectedUser.phone || 'N/A'}</p>
                </div>
                <button
                  className="export-btn"
                  onClick={() => triggerExport(selectedUser.id)}
                >
                  Export CSV Archive
                </button>
              </div>

              {/* Stats overview */}
              {userStats && (
                <div className="stats-grid" style={{ marginBottom: '30px' }}>
                  <div className="stat-card" style={{ padding: '16px' }}>
                    <h3>Appointments</h3>
                    <p className="stat-value" style={{ fontSize: '1.8rem' }}>{userStats.totalBookings}</p>
                  </div>
                  <div className="stat-card" style={{ padding: '16px' }}>
                    <h3>Completed</h3>
                    <p className="stat-value" style={{ fontSize: '1.8rem' }}>{userStats.completed}</p>
                  </div>
                  <div className="stat-card" style={{ padding: '16px' }}>
                    <h3>Pending</h3>
                    <p className="stat-value" style={{ fontSize: '1.8rem' }}>{userStats.pending}</p>
                  </div>
                  <div className="stat-card" style={{ padding: '16px' }}>
                    <h3>Revenue</h3>
                    <p className="stat-value" style={{ fontSize: '1.8rem' }}>${userStats.totalSpent.toFixed(2)}</p>
                  </div>
                </div>
              )}

              {/* Bookings log */}
              <h3>Booking Logs</h3>
              {loadingDetails ? (
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                  <div className="spinner" style={{ margin: '0 auto', width: '35px', height: '35px' }}></div>
                </div>
              ) : selectedUserBookings.length === 0 ? (
                <p style={{ color: '#8c857b' }}>This user has no appointments scheduled yet.</p>
              ) : (
                <div className="bookings-list">
                  {selectedUserBookings.map(b => {
                    const isExpanded = expandedBookingId === b._id;
                    return (
                      <div key={b._id} className="booking-card">
                        <div
                          className="booking-card-header"
                          onClick={() => setExpandedBookingId(isExpanded ? null : b._id)}
                        >
                          <div>
                            <h4 style={{ margin: '0 0 5px 0', color: '#ffffff' }}>
                              {b.service?.name || 'Custom Detailing'}
                            </h4>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#8c857b' }}>
                              {new Date(b.appointmentDate).toLocaleDateString()} at {b.appointmentTime} &bull; {b.vehicle.make} {b.vehicle.model}
                            </p>
                          </div>
                          <span className={`status-badge ${b.status}`}>{b.status}</span>
                        </div>

                        {isExpanded && (
                          <div className="booking-card-details">
                            <div className="details-grid">
                              {/* Left specs */}
                              <div className="details-section">
                                <h4>Vehicle Condition Intake</h4>
                                {b.carConditionImage?.url ? (
                                  <div>
                                    <img src={b.carConditionImage.url} alt="Condition intake" className="condition-img" />
                                    <button
                                      className="export-btn"
                                      style={{ marginTop: '10px', fontSize: '0.8rem', padding: '6px 12px', width: '100%' }}
                                      onClick={() => triggerCarImageUpload(b._id)}
                                    >
                                      Update Intake Photo
                                    </button>
                                  </div>
                                ) : (
                                  <div>
                                    <p style={{ fontStyle: 'italic', color: '#8c857b', fontSize: '0.9rem' }}>
                                      No vehicle condition intake photo uploaded.
                                    </p>
                                    <button
                                      className="export-btn"
                                      style={{ fontSize: '0.8rem', padding: '6px 12px', width: '100%' }}
                                      onClick={() => triggerCarImageUpload(b._id)}
                                    >
                                      Upload Intake Photo
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Right details */}
                              <div className="details-section">
                                <h4>Repair Phases</h4>
                                {b.repairPhases && b.repairPhases.length > 0 ? (
                                  <div className="timeline">
                                    {b.repairPhases.map((phase, idx) => (
                                      <div key={idx} className={`timeline-item ${phase.status}`}>
                                        <div className="timeline-content">
                                          <div className="timeline-title">
                                            <span>{phase.phaseName}</span>
                                            <select
                                              value={phase.status}
                                              onChange={(e) => handleUpdatePhaseStatus(b._id, idx, e.target.value)}
                                              style={{ background: '#201e1b', color: '#fff', border: '1px solid #36322b', fontSize: '0.75rem', padding: '2px' }}
                                            >
                                              <option value="pending">Pending</option>
                                              <option value="in-progress">In Progress</option>
                                              <option value="completed">Completed</option>
                                            </select>
                                          </div>
                                          <p className="timeline-desc">{phase.description}</p>
                                          
                                          {/* Gallery in phase */}
                                          {phase.images && phase.images.length > 0 && (
                                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '10px' }}>
                                              {phase.images.map((img, imgIdx) => (
                                                <img key={imgIdx} src={img.url} alt="Phase detail" style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '4px' }} />
                                              ))}
                                            </div>
                                          )}

                                          <button
                                            className="export-btn"
                                            style={{ fontSize: '0.7rem', padding: '2px 6px', marginTop: '8px', display: 'block' }}
                                            onClick={() => triggerPhaseImageUpload(b._id, idx)}
                                          >
                                            + Upload Phase Image
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div>
                                    <p style={{ fontStyle: 'italic', color: '#8c857b', fontSize: '0.9rem' }}>
                                      Service progress timeline is uninitialized.
                                    </p>
                                    <button
                                      className="export-btn"
                                      style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                                      onClick={() => handleInitializePhases(b._id)}
                                    >
                                      Initialize Default Progress Phases
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Add custom phase */}
                            {b.repairPhases && b.repairPhases.length > 0 && (
                              <div style={{ borderTop: '1px solid #2d2922', paddingTop: '15px', marginTop: '10px' }}>
                                <h5 style={{ margin: '0 0 10px 0', color: '#d4af37' }}>Add Custom Progress Phase</h5>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                  <input
                                    type="text"
                                    placeholder="Phase title..."
                                    value={newPhaseName}
                                    onChange={(e) => setNewPhaseName(e.target.value)}
                                    style={{ background: '#201e1b', color: '#fff', border: '1px solid #36322b', borderRadius: '4px', padding: '6px 12px', flex: 1 }}
                                  />
                                  <input
                                    type="text"
                                    placeholder="Phase description..."
                                    value={newPhaseDesc}
                                    onChange={(e) => setNewPhaseDesc(e.target.value)}
                                    style={{ background: '#201e1b', color: '#fff', border: '1px solid #36322b', borderRadius: '4px', padding: '6px 12px', flex: 2 }}
                                  />
                                  <button className="export-btn" onClick={() => handleAddCustomPhase(b._id)}>
                                    Add Phase
                                  </button>
                                </div>
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
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <p style={{ color: '#8c857b', fontSize: '1.1rem' }}>
                Select a user from search results to view customer archives and modify repair stages.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Hidden File Inputs for uploads */}
      <input
        type="file"
        ref={carImageInputRef}
        onChange={handleCarImageFileChange}
        style={{ display: 'none' }}
        accept="image/*"
      />
      <input
        type="file"
        ref={phaseImageInputRef}
        onChange={handlePhaseImageFileChange}
        style={{ display: 'none' }}
        multiple
        accept="image/*"
      />
    </div>
  );
};

export default AdminUserHistoryPage;
