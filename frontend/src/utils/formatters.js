/**
 * Safely format number to Vietnamese currency
 * @param {number|string|null|undefined} value - The value to format
 * @param {string} defaultValue - Default value if input is invalid (default: '0')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, defaultValue = '0') => {
  // Handle null, undefined, empty string
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }

  // Convert to number
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  // Check if valid number
  if (isNaN(numValue)) {
    return defaultValue;
  }

  // Format with Vietnamese locale
  return numValue.toLocaleString('vi-VN');
};

/**
 * Format number with VND suffix
 * @param {number|string|null|undefined} value - The value to format
 * @returns {string} Formatted string with VND
 */
export const formatVND = (value) => {
  return `${formatCurrency(value)} VND`;
};

/**
 * Parse formatted currency string to number
 * @param {string} formattedValue - The formatted currency string
 * @returns {number} Parsed number
 */
export const parseCurrency = (formattedValue) => {
  if (!formattedValue) return 0;
  
  // Remove all non-digit characters except dot and comma
  const cleaned = formattedValue.replace(/[^\d,.-]/g, '');
  
  // Replace Vietnamese decimal separator
  const normalized = cleaned.replace(/\./g, '').replace(',', '.');
  
  return parseFloat(normalized) || 0;
};

/**
 * Format date to Vietnamese format
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '-';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  
  return d.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format date to short format
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDateShort = (date) => {
  if (!date) return '-';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  
  return d.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Safely get nested object property
 * @param {object} obj - The object to get property from
 * @param {string} path - Property path (e.g., 'user.profile.name')
 * @param {any} defaultValue - Default value if property not found
 * @returns {any} Property value or default
 */
export const safeGet = (obj, path, defaultValue = undefined) => {
  if (!obj || !path) return defaultValue;
  
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === null || result === undefined || typeof result !== 'object') {
      return defaultValue;
    }
    result = result[key];
  }
  
  return result !== undefined ? result : defaultValue;
};
