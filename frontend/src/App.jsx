import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Shared Layout Elements
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminLayout from './components/AdminLayout';
import BookingModal from './components/BookingModal';

// Customer Pages
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import CustomerDashboard from './pages/CustomerDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import UserHistoryPage from './pages/UserHistoryPage';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import ManageServices from './pages/ManageServices';
import ManageAppointments from './pages/ManageAppointments';
import AdminEnquiries from './pages/AdminEnquiries';
import AdminUserHistoryPage from './pages/AdminUserHistoryPage';

// Helper component to conditionally render Navbar & Footer only on customer-facing routes
const CustomerContainer = ({ onBookClick }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onBookClick={onBookClick} />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home onBookClick={onBookClick} />} />
          <Route path="/services" element={<Services onBookClick={onBookClick} />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Auth & Recovery */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Protected Customer Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<CustomerDashboard />} />
            <Route path="/my-bookings" element={<UserHistoryPage />} />
          </Route>
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

function App() {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [preselectedServiceId, setPreselectedServiceId] = useState(null);

  const handleOpenBooking = (serviceId = null) => {
    setPreselectedServiceId(serviceId);
    setBookingModalOpen(true);
  };

  const handleCloseBooking = () => {
    setBookingModalOpen(false);
    setPreselectedServiceId(null);
  };

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute role="admin" />}>
            <Route
              path="/admin/*"
              element={
                <AdminLayout>
                  <Routes>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="/services" element={<ManageServices />} />
                    <Route path="/bookings" element={<ManageAppointments />} />
                    <Route path="/enquiries" element={<AdminEnquiries />} />
                    <Route path="/user-history" element={<AdminUserHistoryPage />} />
                    <Route path="*" element={<Navigate to="/admin" replace />} />
                  </Routes>
                </AdminLayout>
              }
            />
          </Route>

          {/* Customer Facing Container Route */}
          <Route path="/*" element={<CustomerContainer onBookClick={handleOpenBooking} />} />
        </Routes>

        {/* Global Multi-step Booking Modal */}
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={handleCloseBooking}
          preselectedServiceId={preselectedServiceId}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
