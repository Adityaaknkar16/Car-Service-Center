import axios from 'axios';

// Base instance — proxy in package.json handles the /api prefix in dev
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Auth ────────────────────────────────────────────────────────────────────
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const validateResetToken = (token) => api.get(`/auth/reset-password/${token}`);
export const resetPassword = (token, newPassword) => api.post(`/auth/reset-password/${token}`, { newPassword });
export const changePassword = (currentPassword, newPassword) => api.post('/auth/change-password', { currentPassword, newPassword });

// ─── Services ─────────────────────────────────────────────────────────────────
export const fetchServices = (params) => api.get('/services', { params });
export const fetchServiceById = (id) => api.get(`/services/${id}`);
export const createService = (data) => api.post('/services', data);
export const updateService = (id, data) => api.put(`/services/${id}`, data);
export const deleteService = (id) => api.delete(`/services/${id}`);

// ─── Bookings ─────────────────────────────────────────────────────────────────
export const fetchBookings = () => api.get('/bookings');
export const fetchBookingById = (id) => api.get(`/bookings/${id}`);
export const createBooking = (data) => {
  const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
  return api.post('/bookings', data, { headers });
};
export const updateBookingStatus = (id, status, repairNotes) => api.put(`/bookings/${id}/status`, { status, repairNotes });
export const cancelBooking = (id) => api.put(`/bookings/${id}/cancel`);
export const uploadRepairProgressImages = (id, formData) => api.post(`/bookings/${id}/repair-progress`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const fetchBookingImages = (id) => api.get(`/bookings/${id}/images`);
export const fetchRepairProgressImages = (id) => api.get(`/bookings/${id}/repair-progress`);

// New Booking History API methods
export const getUserBookingHistory = () => api.get('/bookings/user/current');
export const searchUsersByName = (searchTerm, limit = 10) => api.get(`/bookings/search-by-user?username=${searchTerm}&limit=${limit}`);
export const getUserBookings = (userId) => api.get(`/bookings/admin/user/${userId}/bookings`);
export const uploadCarImage = (bookingId, imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  return api.post(`/bookings/${bookingId}/upload-car-image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const uploadPhaseImages = (bookingId, phaseIndex, imageFiles, caption = '') => {
  const formData = new FormData();
  for (let i = 0; i < imageFiles.length; i++) {
    formData.append('images', imageFiles[i]);
  }
  formData.append('caption', caption);
  return api.post(`/bookings/${bookingId}/phases/${phaseIndex}/upload-images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const addRepairPhases = (bookingId, phases) => api.post(`/bookings/${bookingId}/add-phases`, { phases });
export const updatePhaseStatus = (bookingId, phaseIndex, status) => api.patch(`/bookings/${bookingId}/phases/${phaseIndex}/status`, { status });

export default api;
