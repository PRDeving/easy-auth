/**
 * Sanitization utility for Easy-Auth
 * Provides functions to sanitize user input to prevent security vulnerabilities
 */

/**
 * Sanitizes a string to prevent XSS attacks
 * @param {string} input - The string to sanitize
 * @returns {string} - The sanitized string
 */
export const sanitizeString = (input) => {
  if (input === null || input === undefined) return input;
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

/**
 * Sanitizes an object by recursively sanitizing all string properties
 * @param {Object} obj - The object to sanitize
 * @returns {Object} - The sanitized object
 */
export const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return sanitizeString(obj);
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  const sanitized = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
  }
  
  return sanitized;
};

/**
 * Sanitizes a JWT token by validating its format
 * @param {string} token - The JWT token to sanitize
 * @returns {string|null} - The sanitized token or null if invalid
 */
export const sanitizeToken = (token) => {
  if (!token) return null;
  if (typeof token !== 'string') return null;
  
  const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
  return jwtRegex.test(token) ? token : null;
};
