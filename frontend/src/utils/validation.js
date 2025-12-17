// Validation utility functions

/**
 * Validate email format.
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  // RFC 5322 simplified regex
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

/**
 * Validate password complexity.
 * Password must be at least 8 characters, contain uppercase, lowercase, number, and special char.
 * @param {string} password
 * @returns {boolean}
 */
export function isValidPassword(password) {
  if (typeof password !== 'string') return false;
  // Minimum eight characters, at least one uppercase letter, one lowercase letter,
  // one number and one special character
  // eslint-disable-next-line max-len
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&(){}[\]:;<>,.+\\/~^|_-])[A-Za-z\d@$!%*?&(){}[\]:;<>,.+\\/~^|_-]{8,}$/;
  return re.test(password);
}

/**
 * Validate non-empty string
 * @param {string} value
 * @returns {boolean}
 */
export function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}
