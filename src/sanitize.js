/**
 * Utility functions for input sanitization
 */

/**
 * Validates if a string matches the provided pattern
 * @param {string} input - The string to validate
 * @param {RegExp} pattern - The regex pattern to match against
 * @returns {boolean} - True if the input matches the pattern, false otherwise
 */
export const validateInput = (input, pattern) => {
  if (input === undefined || input === null) return false;
  return pattern.test(input);
};

/**
 * Sanitizes user input by validating it against a pattern
 * @param {string} input - The string to sanitize
 * @param {RegExp} pattern - The regex pattern to match against
 * @throws {Error} - If the input doesn't match the pattern
 * @returns {string} - The sanitized input (same as input if valid)
 */
export const sanitizeInput = (input, pattern) => {
  if (!validateInput(input, pattern)) {
    throw new Error('Invalid input format');
  }
  return input;
};
