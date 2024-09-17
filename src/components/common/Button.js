import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  type = 'button', 
  onClick, 
  disabled = false, 
  className = '' 
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`custom-button ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;