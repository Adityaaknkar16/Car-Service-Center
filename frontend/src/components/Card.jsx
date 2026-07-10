import React from 'react';

const Card = ({
  children,
  className = '',
  hoverable = true,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`glass-panel rounded-2xl p-6 ${hoverable ? 'glass-panel-hover' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
