import React, { useState } from 'react';

const RepairImageGallery = ({ images = [], stageFilter = 'all', canUpload = false, onUpload }) => {
  const [activeLightbox, setActiveLightbox] = useState(null);

  // Filter images based on stage filter
  const filteredImages = images.filter((img) => {
    if (stageFilter === 'all') return true;
    return img.stage?.toLowerCase() === stageFilter.toLowerCase();
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStageColor = (stage) => {
    switch (stage?.toLowerCase()) {
      case 'before': return 'bg-orange-950/50 text-orange-400 border border-orange-850';
      case 'during': return 'bg-blue-950/50 text-blue-400 border border-blue-900';
      case 'after': return 'bg-emerald-950/50 text-emerald-400 border border-emerald-800';
      case 'inspection': return 'bg-amber-950/50 text-amber-400 border border-amber-800';
      default: return 'bg-white/5 text-luxury-text-secondary border border-white/10';
    }
  };

  return (
    <div className="space-y-4">
      {/* Gallery Grid */}
      {filteredImages.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border border-white/5 rounded-2xl bg-white/5 text-center">
          <span className="text-xl mb-1 text-luxury-text-secondary/40">📷</span>
          <p className="text-xs text-luxury-text-secondary">No photos available for this stage.</p>
          {canUpload && (
            <button
              onClick={onUpload}
              className="mt-3 px-3 py-1 bg-luxury-gold-dark/20 border border-luxury-gold-light text-luxury-gold-light hover:bg-luxury-gold-dark/40 text-[10px] uppercase font-bold tracking-wider rounded-lg transition-colors"
            >
              Add Photos
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filteredImages.map((img, idx) => (
            <div
              key={idx}
              className="relative group aspect-square rounded-2xl overflow-hidden bg-luxury-bg-deep border border-white/5 cursor-pointer shadow-lg transition-all hover:border-luxury-gold-light/50"
              onClick={() => setActiveLightbox(img.url)}
            >
              <img
                src={img.url}
                alt={img.filename}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              
              {/* Overlay with timestamp and stage */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 flex flex-col justify-end">
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[8px] uppercase font-semibold tracking-wider ${getStageColor(img.stage || 'Customer')}`}>
                    {img.stage || 'Customer'}
                  </span>
                  <span className="text-[8px] text-white/60">
                    {formatDate(img.uploadedAt)}
                  </span>
                </div>
              </div>

              {/* Default persistent minimal badge */}
              <div className="absolute top-2 left-2">
                <span className={`px-2 py-0.5 rounded-full text-[8px] uppercase font-semibold tracking-wider ${getStageColor(img.stage || 'Customer')}`}>
                  {img.stage || 'Customer'}
                </span>
              </div>
            </div>
          ))}

          {canUpload && (
            <div
              onClick={onUpload}
              className="aspect-square rounded-2xl border-2 border-dashed border-white/10 hover:border-luxury-gold-light/50 bg-white/5 hover:bg-white/10 transition-all flex flex-col items-center justify-center cursor-pointer text-center p-4 group"
            >
              <span className="text-2xl mb-1 text-luxury-gold-light group-hover:scale-110 transition-transform">➕</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-luxury-text-primary">Add Progress</span>
              <span className="text-[8px] text-luxury-text-secondary mt-0.5">Photos</span>
            </div>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      {activeLightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
          onClick={() => setActiveLightbox(null)}
        >
          <button
            onClick={() => setActiveLightbox(null)}
            className="absolute top-4 right-4 text-white hover:text-luxury-gold-light text-2xl font-bold bg-white/10 w-10 h-10 rounded-full flex items-center justify-center transition-all"
          >
            ✕
          </button>
          <img
            src={activeLightbox}
            alt="Full size condition"
            className="max-w-full max-h-[90vh] object-contain rounded-xl border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default RepairImageGallery;
