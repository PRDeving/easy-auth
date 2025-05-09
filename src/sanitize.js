/**
 * Sanitization utility for Easy-Auth
 * Provides functions to sanitize user input to prevent security vulnerabilities
 */

/**
 * Sanitizes a string to prevent XSS attacks using configurable regex patterns
 * @param {string} input - The string to sanitize
 * @param {Array} patterns - Array of regex patterns and replacements
 * @returns {string} - The sanitized string
 */
export const sanitizeString = (input, patterns = null) => {
  if (input === null || input === undefined) return input;
  if (typeof input !== 'string') return input;
  
  if (!patterns || !Array.isArray(patterns) || patterns.length === 0) {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }
  
  let sanitized = input;
  for (const { pattern, replacement } of patterns) {
    if (pattern instanceof RegExp) {
      sanitized = sanitized.replace(pattern, replacement);
    } else if (typeof pattern === 'string') {
      const regexPattern = new RegExp(pattern, 'g');
      sanitized = sanitized.replace(regexPattern, replacement);
    }
  }
  
  return sanitized;
};

/**
 * Sanitizes an object by recursively sanitizing all string properties
 * @param {Object} obj - The object to sanitize
 * @param {Array} patterns - Array of regex patterns and replacements
 * @returns {Object} - The sanitized object
 */
export const sanitizeObject = (obj, patterns = null) => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return sanitizeString(obj, patterns);
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, patterns));
  }
  
  const sanitized = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      sanitized[key] = sanitizeObject(obj[key], patterns);
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
