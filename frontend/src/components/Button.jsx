import React from 'react';

const Button = ({
  children,
  variant = 'solid', // 'solid', 'outline', 'ghost', 'danger'
  size = 'md', // 'sm', 'md', 'lg'
  className = '',
  onClick,
  type = 'button',
  disabled = false,
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium tracking-wider uppercase rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-luxury-gold-dark disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    solid: 'gold-gradient-bg shadow-lg shadow-[rgba(212,196,160,0.15)] hover:shadow-[rgba(212,196,160,0.25)] hover:scale-105 hover:brightness-110 active:scale-95',
    outline: 'border border-luxury-text-primary text-luxury-text-primary hover:bg-luxury-text-primary hover:text-luxury-bg-deep hover:scale-105 active:scale-95',
    ghost: 'text-luxury-text-secondary hover:text-luxury-text-primary hover:bg-[rgba(255,255,255,0.05)]',
    danger: 'bg-red-950/40 border border-red-800 text-red-400 hover:bg-red-800 hover:text-white hover:scale-105 active:scale-95',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  return (
    <button
      type={type}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
