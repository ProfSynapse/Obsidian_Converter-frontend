import React from 'react';
import './input.css';

const Input = ({ 
  type = 'text', 
  id, 
  value, 
  onChange, 
  placeholder = '', 
  required = false, 
  className = '' 
}) => {
  return (
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className={`custom-input ${className}`}
    />
  );
};

export default Input;