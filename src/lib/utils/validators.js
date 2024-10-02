// src/lib/utils/validators.js
// Utility functions for input validation

export function isValidApiKey(apiKey) {
    // This is a basic check. Adjust based on the actual format of your API keys
    return /^sk-[A-Za-z0-9]{48}$/.test(apiKey);
  }
  
  export function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }