import React, { useReducer, useEffect, useState } from 'react';
import axios from 'axios';
import { fetchServices, createBooking } from '../services/api';
import Button from './Button';
import Card from './Card';

// Reducer for managing multi-step booking state
const initialState = {
  step: 1,
  serviceId: '',
  selectedService: null,
  vehicle: {
    make: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
  },
  appointmentDate: '',
  appointmentTime: '10:00 AM - 12:00 PM',
  notes: '',
  error: '',
  loading: false,
  success: false,
  images: [],
  imagePreviews: [],
};

function bookingReducer(state, action) {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload, error: '' };
    case 'SET_SERVICE':
      return { ...state, serviceId: action.payload.id, selectedService: action.payload.service, error: '' };
    case 'SET_VEHICLE':
      return { ...state, vehicle: { ...state.vehicle, ...action.payload } };
    case 'SET_APPOINTMENT':
      return { ...state, ...action.payload };
    case 'ADD_IMAGES':
      return { 
        ...state, 
        images: [...state.images, ...action.payload.files], 
        imagePreviews: [...state.imagePreviews, ...action.payload.previews], 
        error: '' 
      };
    case 'REMOVE_IMAGE':
      const updatedImages = state.images.filter((_, idx) => idx !== action.payload);
      const updatedPreviews = state.imagePreviews.filter((_, idx) => idx !== action.payload);
      return { 
        ...state, 
        images: updatedImages, 
        imagePreviews: updatedPreviews 
      };
    case 'START_SUBMIT':
      return { ...state, loading: true, error: '' };
    case 'SUBMIT_SUCCESS':
      return { ...state, loading: false, success: true };
    case 'SUBMIT_FAILURE':
      return { ...state, loading: false, error: action.payload };
    case 'RESET':
      state.imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      return initialState;
    default:
      return state;
  }
}

const BookingModal = ({ isOpen, onClose, preselectedServiceId }) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState);
  const [services, setServices] = useState([]);
  const [fetchingServices, setFetchingServices] = useState(false);

  // Keyboard dismiss (Escape key)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Load services
  useEffect(() => {
    if (isOpen) {
      setFetchingServices(true);
      fetchServices()
        .then((res) => {
          setServices(res.data.data);
          if (preselectedServiceId) {
            const found = res.data.data.find(s => s._id === preselectedServiceId);
            if (found) {
              dispatch({ type: 'SET_SERVICE', payload: { id: found._id, service: found } });
            }
          }
        })
        .catch(() => {})
        .finally(() => setFetchingServices(false));
    }
  }, [isOpen, preselectedServiceId]);

  if (!isOpen) return null;

  const steps = [
    'Select Service',
    'Vehicle Specs',
    'Schedule',
    'Car Images',
    'Confirm',
  ];

  const handleServiceSelect = (service) => {
    dispatch({ type: 'SET_SERVICE', payload: { id: service._id, service } });
  };

  const handleNext = () => {
    if (state.step === 1 && !state.serviceId) {
      dispatch({ type: 'SUBMIT_FAILURE', payload: 'Please select a service before proceeding' });
      return;
    }
    if (state.step === 2) {
      const { make, model, year, licensePlate } = state.vehicle;
      if (!make || !model || !year || !licensePlate) {
        dispatch({ type: 'SUBMIT_FAILURE', payload: 'Please complete all vehicle fields' });
        return;
      }
    }
    if (state.step === 3) {
      if (!state.appointmentDate || !state.appointmentTime) {
        dispatch({ type: 'SUBMIT_FAILURE', payload: 'Please choose a date and time slot' });
        return;
      }
    }
    if (state.step === 4) {
      if (state.images.length === 0) {
        dispatch({ type: 'SUBMIT_FAILURE', payload: 'At least 1 image must be uploaded to proceed' });
        return;
      }
    }
    dispatch({ type: 'SET_STEP', payload: state.step + 1 });
  };

  const handlePrev = () => {
    dispatch({ type: 'SET_STEP', payload: state.step - 1 });
  };

  const handleSubmit = async () => {
    dispatch({ type: 'START_SUBMIT' });
    try {
      const formData = new FormData();
      formData.append('serviceId', state.serviceId);
      formData.append('vehicle', JSON.stringify(state.vehicle));
      formData.append('appointmentDate', state.appointmentDate);
      formData.append('appointmentTime', state.appointmentTime);
      formData.append('notes', state.notes);
      
      state.images.forEach((img) => {
        formData.append('images', img);
      });

      await createBooking(formData);
      state.imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      dispatch({ type: 'SUBMIT_SUCCESS' });
    } catch (err) {
      dispatch({
        type: 'SUBMIT_FAILURE',
        payload: err.response?.data?.message || 'Failed to complete booking. Please try again.',
      });
    }
  };

  const timeSlots = [
    '08:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 02:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-luxury-bg-deep/90 backdrop-blur-md">
      {/* Container Card */}
      <div className="relative w-full max-w-5xl glass-panel rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-luxury-text-secondary hover:text-luxury-text-primary z-20"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Success Screen */}
        {state.success ? (
          <div className="w-full p-12 text-center flex flex-col items-center justify-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-luxury-gold-dark/20 border border-luxury-gold-light flex items-center justify-center text-luxury-gold-light text-2xl font-bold animate-bounce">
              ✓
            </div>
            <h2 className="text-2xl font-serif text-luxury-gold-light">Booking Confirmed</h2>
            <p className="text-xs text-luxury-text-secondary max-w-md">
              Your appointment has been successfully scheduled. We will send you updates on your vehicle status. You can check progress on your Dashboard.
            </p>
            <Button variant="solid" onClick={() => { dispatch({ type: 'RESET' }); onClose(); }}>
              Done
            </Button>
          </div>
        ) : (
          <>
            {/* Left Panel: Form Steps */}
            <div className="flex-1 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[85vh] md:max-h-none">
              <div>
                {/* Horizontal Step Tracker */}
                <div className="mb-8 relative flex items-center justify-between w-full max-w-md mx-auto">
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-white/5 z-0" />
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-luxury-gold-dark transition-all duration-300 z-0"
                    style={{ width: `${((state.step - 1) / (steps.length - 1)) * 100}%` }}
                  />
                  {steps.map((label, idx) => {
                    const stepNum = idx + 1;
                    const isActive = state.step === stepNum;
                    const isCompleted = state.step > stepNum;
                    return (
                      <div key={label} className="relative z-10 flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                            isCompleted
                              ? 'bg-luxury-gold-dark text-luxury-bg-deep'
                              : isActive
                              ? 'bg-luxury-bg-deep border-2 border-luxury-gold-light text-luxury-gold-light'
                              : 'bg-luxury-bg-panel border border-white/10 text-luxury-text-secondary'
                          }`}
                        >
                          {stepNum}
                        </div>
                        <span className="hidden sm:inline text-[9px] uppercase tracking-widest text-luxury-text-secondary mt-1">
                          {label.split(' ')[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {state.error && (
                  <div className="mb-4 text-xs text-red-400 bg-red-950/20 border border-red-900/50 p-3 rounded-lg">
                    {state.error}
                  </div>
                )}

                {/* Steps Content */}
                <div className="min-h-[220px]">
                  {/* Step 1: Select Service */}
                  {state.step === 1 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-serif text-luxury-gold-light">Select Service Package</h3>
                      {fetchingServices ? (
                        <div className="text-xs text-luxury-text-secondary">Loading services...</div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-2">
                          {services.map((s) => (
                            <div
                              key={s._id}
                              onClick={() => handleServiceSelect(s)}
                              className={`p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                                state.serviceId === s._id
                                  ? 'bg-white/5 border-luxury-gold-light'
                                  : 'bg-transparent border-white/5 hover:border-white/20'
                              }`}
                            >
                              <div>
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-luxury-text-primary">
                                  {s.title}
                                </h4>
                                <span className="text-[10px] text-luxury-text-secondary uppercase">
                                  {s.category}
                                </span>
                              </div>
                              <span className="text-xs font-semibold text-luxury-gold-light">${s.price}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 2: Vehicle Specs */}
                  {state.step === 2 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-serif text-luxury-gold-light">Vehicle Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-luxury-text-secondary mb-1">Make</label>
                          <input
                            type="text"
                            placeholder="e.g. Porsche"
                            value={state.vehicle.make}
                            onChange={(e) => dispatch({ type: 'SET_VEHICLE', payload: { make: e.target.value } })}
                            className="w-full bg-luxury-bg-panel border border-white/5 focus:border-luxury-gold-light text-xs text-luxury-text-primary px-3 py-2 rounded-lg outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-luxury-text-secondary mb-1">Model</label>
                          <input
                            type="text"
                            placeholder="e.g. 911 GT3"
                            value={state.vehicle.model}
                            onChange={(e) => dispatch({ type: 'SET_VEHICLE', payload: { model: e.target.value } })}
                            className="w-full bg-luxury-bg-panel border border-white/5 focus:border-luxury-gold-light text-xs text-luxury-text-primary px-3 py-2 rounded-lg outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-luxury-text-secondary mb-1">Year</label>
                          <input
                            type="number"
                            placeholder="e.g. 2023"
                            value={state.vehicle.year}
                            onChange={(e) => dispatch({ type: 'SET_VEHICLE', payload: { year: parseInt(e.target.value) || '' } })}
                            className="w-full bg-luxury-bg-panel border border-white/5 focus:border-luxury-gold-light text-xs text-luxury-text-primary px-3 py-2 rounded-lg outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-luxury-text-secondary mb-1">License Plate</label>
                          <input
                            type="text"
                            placeholder="e.g. GT3-911"
                            value={state.vehicle.licensePlate}
                            onChange={(e) => dispatch({ type: 'SET_VEHICLE', payload: { licensePlate: e.target.value } })}
                            className="w-full bg-luxury-bg-panel border border-white/5 focus:border-luxury-gold-light text-xs text-luxury-text-primary px-3 py-2 rounded-lg outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Schedule */}
                  {state.step === 3 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-serif text-luxury-gold-light">Schedule Appointment</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-luxury-text-secondary mb-1">Date</label>
                          <input
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            value={state.appointmentDate}
                            onChange={(e) => dispatch({ type: 'SET_APPOINTMENT', payload: { appointmentDate: e.target.value } })}
                            className="w-full bg-luxury-bg-panel border border-white/5 focus:border-luxury-gold-light text-xs text-luxury-text-primary px-3 py-2 rounded-lg outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-luxury-text-secondary mb-1">Time Slot</label>
                          <select
                            value={state.appointmentTime}
                            onChange={(e) => dispatch({ type: 'SET_APPOINTMENT', payload: { appointmentTime: e.target.value } })}
                            className="w-full bg-luxury-bg-panel border border-white/5 focus:border-luxury-gold-light text-xs text-luxury-text-primary px-3 py-2 rounded-lg outline-none"
                          >
                            {timeSlots.map(slot => (
                              <option key={slot} value={slot}>{slot}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-luxury-text-secondary mb-1">Special Instructions</label>
                        <textarea
                          placeholder="e.g. Squeaking noise in front brake calipers when turning left."
                          value={state.notes}
                          onChange={(e) => dispatch({ type: 'SET_APPOINTMENT', payload: { notes: e.target.value } })}
                          rows="2"
                          className="w-full bg-luxury-bg-panel border border-white/5 focus:border-luxury-gold-light text-xs text-luxury-text-primary px-3 py-2 rounded-lg outline-none resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 4: Car Images */}
                  {state.step === 4 && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-serif text-luxury-gold-light">Upload Car Images</h3>
                        <p className="text-[11px] text-luxury-text-secondary mt-1">
                          Upload 2-4 photos showing the car condition/problem area (min 1, max 4, max 5MB each).
                        </p>
                      </div>

                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-luxury-gold-light/50 transition-all rounded-2xl p-6 bg-white/5 relative cursor-pointer group">
                        <input
                          type="file"
                          multiple
                          accept=".jpg,.jpeg,.png,.webp"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (state.images.length + files.length > 4) {
                              dispatch({ type: 'SUBMIT_FAILURE', payload: 'You can upload a maximum of 4 images' });
                              return;
                            }
                            
                            const validFiles = [];
                            const previews = [];
                            let hasError = false;
                            
                            for (let file of files) {
                              const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
                              const isValidSize = file.size <= 5 * 1024 * 1024;
                              
                              if (!isValidType) {
                                dispatch({ type: 'SUBMIT_FAILURE', payload: 'Invalid file type. Only JPG, PNG, and WEBP are allowed.' });
                                hasError = true;
                                break;
                              }
                              
                              if (!isValidSize) {
                                dispatch({ type: 'SUBMIT_FAILURE', payload: 'File size exceeds 5MB limit.' });
                                hasError = true;
                                break;
                              }
                              
                              validFiles.push(file);
                              previews.push(URL.createObjectURL(file));
                            }
                            
                            if (!hasError && validFiles.length > 0) {
                              dispatch({ type: 'ADD_IMAGES', payload: { files: validFiles, previews } });
                            }
                          }}
                        />
                        <span className="text-2xl mb-2 text-luxury-gold-light/70 group-hover:scale-110 transition-transform">📤</span>
                        <span className="text-xs font-semibold text-luxury-text-primary">Click or drag files to upload</span>
                        <span className="text-[10px] text-luxury-text-secondary mt-1">JPG, PNG, WEBP up to 5MB</span>
                      </div>

                      {state.imagePreviews.length > 0 && (
                        <div className="grid grid-cols-4 gap-4 mt-4">
                          {state.imagePreviews.map((preview, idx) => (
                            <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-white/10">
                              <img src={preview} alt="Preview" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                              <button
                                type="button"
                                onClick={() => {
                                  URL.revokeObjectURL(preview);
                                  dispatch({ type: 'REMOVE_IMAGE', payload: idx });
                                }}
                                className="absolute top-1 right-1 bg-red-900/80 hover:bg-red-800 text-white rounded-full p-1 text-[10px] font-bold w-5 h-5 flex items-center justify-center transition-colors"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 5: Confirm */}
                  {state.step === 5 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-serif text-luxury-gold-light">Review Details</h3>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                        <div>
                          <span className="text-[10px] uppercase tracking-widest text-luxury-text-secondary block">Service</span>
                          <span className="text-luxury-text-primary font-semibold uppercase">{state.selectedService?.title}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-widest text-luxury-text-secondary block">Price</span>
                          <span className="text-luxury-gold-light font-bold">${state.selectedService?.price}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-widest text-luxury-text-secondary block">Vehicle</span>
                          <span className="text-luxury-text-primary">
                            {state.vehicle.year} {state.vehicle.make} {state.vehicle.model}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-widest text-luxury-text-secondary block">Plate</span>
                          <span className="text-luxury-text-primary">{state.vehicle.licensePlate}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-widest text-luxury-text-secondary block">Scheduled</span>
                          <span className="text-luxury-text-primary">
                            {state.appointmentDate} at {state.appointmentTime.split(' ')[0]}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[10px] uppercase tracking-widest text-luxury-text-secondary block mb-1">Car Images Uploaded</span>
                          <div className="flex gap-2">
                            {state.imagePreviews.map((preview, idx) => (
                              <img key={idx} src={preview} alt="Uploaded car" className="w-12 h-12 object-cover rounded-lg border border-white/10" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={state.step === 1 ? onClose : handlePrev}
                  size="sm"
                >
                  {state.step === 1 ? 'Cancel' : 'Back'}
                </Button>

                {state.step < 5 ? (
                  <Button variant="solid" onClick={handleNext} size="sm">
                    Next Step
                  </Button>
                ) : (
                  <Button variant="solid" onClick={handleSubmit} disabled={state.loading} size="sm">
                    {state.loading ? 'Booking...' : 'Confirm Book'}
                  </Button>
                )}
              </div>
            </div>

            {/* Right Panel: Live Summary Panel */}
            <div className="w-full md:w-[320px] bg-luxury-bg-panel border-t md:border-t-0 md:border-l border-white/5 p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-xs uppercase tracking-widest text-luxury-text-primary font-semibold mb-6">
                  Live Summary
                </h3>

                {state.selectedService ? (
                  <div className="space-y-4">
                    {/* Decorative Header */}
                    <div className="relative h-28 rounded-xl overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${state.selectedService.image || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=800'})` }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-luxury-bg-panel to-transparent" />
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-luxury-text-primary">
                        {state.selectedService.title}
                      </h4>
                      <p className="text-[10px] text-luxury-text-secondary mt-1">
                        {state.selectedService.description}
                      </p>
                    </div>

                    {/* Check Inclusions */}
                    {state.selectedService.inclusions?.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase tracking-widest text-luxury-text-secondary">Inclusions:</span>
                        <ul className="space-y-1">
                          {state.selectedService.inclusions.slice(0, 3).map((inc, i) => (
                            <li key={i} className="text-[10px] text-luxury-text-secondary flex items-center">
                              <span className="text-luxury-gold-light mr-1.5">•</span> {inc}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Live Vehicle Spec Preview */}
                    {(state.vehicle.make || state.vehicle.model) && (
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-[8px] uppercase tracking-widest text-luxury-text-secondary block mb-1">
                          ACTIVE SPEC:
                        </span>
                        <span className="text-xs font-semibold text-luxury-gold-light uppercase">
                          {state.vehicle.year} {state.vehicle.make} {state.vehicle.model}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-luxury-text-secondary">Select a service to display summary details.</p>
                )}
              </div>

              {/* Price Tag with discount simulation */}
              {state.selectedService && (
                <div className="mt-8 pt-4 border-t border-white/5">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] uppercase tracking-widest text-luxury-text-secondary">Est. Price:</span>
                    <div className="text-right">
                      {/* Simulated Original Price */}
                      <span className="text-xs text-luxury-text-secondary/50 line-through mr-2">
                        ${(state.selectedService.price * 1.25).toFixed(2)}
                      </span>
                      <span className="text-lg font-bold text-luxury-gold-light">
                        ${state.selectedService.price}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
