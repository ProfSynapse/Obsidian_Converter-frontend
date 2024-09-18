/**
 * Formats a date string into a more readable format
 * @param {string} dateString - The date string to format
 * @returns {string} The formatted date string
 */
export const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  /**
   * Truncates a string to a specified length and adds an ellipsis if truncated
   * @param {string} str - The string to truncate
   * @param {number} length - The maximum length of the string
   * @returns {string} The truncated string
   */
  export const truncateString = (str, length) => {
    if (str.length <= length) return str;
    return str.slice(0, length) + '...';
  };
  
  /**
   * Converts bytes to a human-readable file size string
   * @param {number} bytes - The file size in bytes
   * @param {number} decimals - The number of decimal places to show (default: 2)
   * @returns {string} The human-readable file size
   */
  export const formatFileSize = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
  
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
    const i = Math.floor(Math.log(bytes) / Math.log(k));
  
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  
  /**
   * Validates an email address
   * @param {string} email - The email address to validate
   * @returns {boolean} Whether the email is valid
   */
  export const isValidEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };
  
  /**
   * Generates a random string of specified length
   * @param {number} length - The length of the string to generate
   * @returns {string} The generated random string
   */
  export const generateRandomString = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };
  
  /**
   * Debounces a function
   * @param {Function} func - The function to debounce
   * @param {number} wait - The number of milliseconds to delay
   * @returns {Function} The debounced function
   */
  export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };
  
  /**
   * Checks if a file type is allowed
   * @param {string} fileType - The MIME type of the file
   * @param {Array} allowedTypes - An array of allowed MIME types
   * @returns {boolean} Whether the file type is allowed
   */
  export const isAllowedFileType = (fileType, allowedTypes) => {
    return allowedTypes.includes(fileType);
  };
  
  /**
   * Capitalizes the first letter of each word in a string
   * @param {string} str - The string to capitalize
   * @returns {string} The capitalized string
   */
  export const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, l => l.toUpperCase());
  };