import React from 'react';

const StatusTracker = ({ currentStatus }) => {
  // Status levels: index 0 to 3
  const statusSteps = [
    { key: 'pending', label: 'Order Placed' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'ready', label: 'Ready for Pick-up' },
    { key: 'completed', label: 'Delivered' }
  ];

  // Helper to get active step index
  const getStepIndex = (status) => {
    if (status === 'pending') return 0;
    if (status === 'confirmed' || status === 'in-progress') return 1;
    if (status === 'ready') return 2;
    if (status === 'completed') return 3;
    if (status === 'cancelled') return -1;
    return 0;
  };

  const activeIndex = getStepIndex(currentStatus);

  if (currentStatus === 'cancelled') {
    return (
      <div className="w-full flex items-center justify-center p-4 bg-red-950/20 border border-red-900/50 rounded-xl">
        <span className="text-red-400 font-medium tracking-wide uppercase text-sm">
          ⛔ Appointment Cancelled
        </span>
      </div>
    );
  }

  return (
    <div className="w-full py-6 px-4">
      {/* Tracker Bar */}
      <div className="relative flex items-center justify-between w-full">
        {/* Background Connector Line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-luxury-bg-panel z-0 rounded-full" />

        {/* Progress Fills Connector Line */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-luxury-gold-light to-luxury-gold-dark shadow-md shadow-[rgba(212,196,160,0.3)] transition-all duration-700 ease-in-out z-0 rounded-full"
          style={{ width: `${(activeIndex / (statusSteps.length - 1)) * 100}%` }}
        />

        {/* Circular Nodes */}
        {statusSteps.map((step, idx) => {
          const isCompleted = idx < activeIndex;
          const isActive = idx === activeIndex;
          const isUpcoming = idx > activeIndex;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-xs transition-all duration-500 ${
                  isCompleted
                    ? 'bg-luxury-gold-dark text-luxury-bg-deep ring-4 ring-luxury-bg-deep'
                    : isActive
                    ? 'bg-luxury-bg-deep border-2 border-luxury-gold-light text-luxury-gold-light ring-4 ring-luxury-gold-light/20 scale-110 shadow-lg shadow-[rgba(232,220,200,0.1)]'
                    : 'bg-luxury-bg-panel border-2 border-luxury-text-secondary/20 text-luxury-text-secondary'
                }`}
              >
                {isCompleted ? '✓' : idx + 1}
              </div>
              <span
                className={`absolute top-10 text-[10px] sm:text-xs font-medium uppercase tracking-wider text-center whitespace-nowrap transition-colors duration-300 ${
                  isActive
                    ? 'text-luxury-gold-light'
                    : isCompleted
                    ? 'text-luxury-text-primary'
                    : 'text-luxury-text-secondary/70'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-6" /> {/* spacer for labels */}
    </div>
  );
};

export default StatusTracker;
