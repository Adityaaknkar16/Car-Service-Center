import React, { useState } from 'react';
import Button from './Button';
import { uploadRepairProgressImages } from '../services/api';

const RepairProgressUpload = ({ isOpen, onClose, bookingId, onUploadSuccess }) => {
  const [stage, setStage] = useState('before');
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      setError('You can upload a maximum of 5 images per stage');
      return;
    }

    const validFiles = [];
    const newPreviews = [];
    let validationError = '';

    for (let file of files) {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024;

      if (!isValidType) {
        validationError = 'Invalid file type. Only JPG, PNG, and WEBP are allowed.';
        break;
      }
      if (!isValidSize) {
        validationError = 'File size exceeds 5MB limit.';
        break;
      }

      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    if (validationError) {
      setError(validationError);
    } else {
      setError('');
      setImages([...images, ...validFiles]);
      setPreviews([...previews, ...newPreviews]);
    }
  };

  const handleRemoveImage = (idx) => {
    URL.revokeObjectURL(previews[idx]);
    setImages(images.filter((_, i) => i !== idx));
    setPreviews(previews.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) {
      setError('Please select at least 1 image to upload');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('stage', stage);
      images.forEach((img) => {
        formData.append('images', img);
      });

      await uploadRepairProgressImages(bookingId, formData);
      
      // Cleanup previews
      previews.forEach(url => URL.revokeObjectURL(url));
      setImages([]);
      setPreviews([]);
      setSuccess(true);
      
      if (onUploadSuccess) {
        onUploadSuccess();
      }
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload progress photos.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    previews.forEach(url => URL.revokeObjectURL(url));
    setImages([]);
    setPreviews([]);
    setError('');
    setSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-luxury-bg-deep/90 backdrop-blur-md">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl overflow-hidden shadow-2xl p-6 space-y-6">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-luxury-text-secondary hover:text-luxury-text-primary transition-colors"
        >
          ✕
        </button>

        <div>
          <span className="text-[9px] uppercase tracking-widest text-luxury-gold-light font-bold">Admin Panel</span>
          <h3 className="text-lg font-serif text-luxury-text-primary uppercase">Upload Progress Photos</h3>
        </div>

        {error && (
          <div className="text-xs text-red-400 bg-red-950/20 border border-red-900/50 p-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-900/50 p-3 rounded-lg">
            ✓ Photos uploaded successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-luxury-text-secondary mb-1">
              Select Repair Stage
            </label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full bg-luxury-bg-deep border border-white/5 focus:border-luxury-gold-light text-xs text-luxury-text-primary px-3 py-2 rounded-lg outline-none cursor-pointer"
            >
              <option value="before">Before Repair</option>
              <option value="during">During Repair</option>
              <option value="after">After Repair</option>
              <option value="inspection">Inspection</option>
            </select>
          </div>

          <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-luxury-gold-light/50 transition-all rounded-2xl p-6 bg-white/5 relative cursor-pointer group">
            <input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileChange}
            />
            <span className="text-2xl mb-1 text-luxury-gold-light/70 group-hover:scale-110 transition-transform">📤</span>
            <span className="text-xs font-semibold text-luxury-text-primary">Click or drag photos here</span>
            <span className="text-[10px] text-luxury-text-secondary mt-0.5">JPG, PNG, WEBP up to 5MB</span>
          </div>

          {previews.length > 0 && (
            <div className="grid grid-cols-5 gap-2 mt-2">
              {previews.map((preview, idx) => (
                <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-white/10">
                  <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-0.5 right-0.5 bg-red-900/80 hover:bg-red-800 text-white rounded-full text-[9px] w-4 h-4 flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button variant="outline" size="sm" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="solid" size="sm" type="submit" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload Photos'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RepairProgressUpload;
