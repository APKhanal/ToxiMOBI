/**
 * ToxiGuard Helper Utilities
 * Various helper functions used throughout the app
 */

import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { format } from 'date-fns';

/**
 * Get initials from a name
 * @param {string} name - Full name
 * @returns {string} - Initials (up to 2 characters)
 */
export const getChildInitials = (name) => {
  if (!name) return '?';
  
  const nameParts = name.trim().split(' ');
  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  } else {
    return (
      nameParts[0].charAt(0).toUpperCase() + 
      nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    );
  }
};

/**
 * Generate a color based on a string input (for avatars)
 * @param {string} str - Input string
 * @returns {string} - Hex color
 */
export const getColorFromString = (str) => {
  if (!str) return '#FF5722'; // Default color
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate colors that are visually appealing for avatars
  const colors = [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7', 
    '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', 
    '#009688', '#4CAF50', '#8BC34A', '#CDDC39', 
    '#FFC107', '#FF9800', '#FF5722', '#795548'
  ];
  
  // Use the hash to pick a color from our palette
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

/**
 * Format date for display
 * @param {Date|string|number} date - Date object or timestamp
 * @param {string} formatStr - Format string
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, formatStr = 'MMM d, yyyy') => {
  if (!date) return '';
  const dateObj = typeof date === 'object' ? date : new Date(date);
  return format(dateObj, formatStr);
};

/**
 * Format date and time for display
 * @param {Date|string|number} date - Date object or timestamp
 * @returns {string} - Formatted date and time
 */
export const formatDateTime = (date) => {
  return formatDate(date, 'MMM d, yyyy h:mm a');
};

/**
 * Truncate text to a specific length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, length = 100) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

/**
 * Calculate percentage
 * @param {number} part - Part value
 * @param {number} total - Total value
 * @returns {number} - Percentage (0-100)
 */
export const calculatePercentage = (part, total) => {
  if (!total) return 0;
  return Math.round((part / total) * 100);
};

/**
 * Safely get nested object properties
 * @param {Object} obj - Object to check
 * @param {string} path - Dot-notation path
 * @param {*} defaultValue - Default value if path doesn't exist
 * @returns {*} - Value at path or default
 */
export const getNestedValue = (obj, path, defaultValue = null) => {
  if (!obj || !path) return defaultValue;
  
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined || !Object.prototype.hasOwnProperty.call(current, key)) {
      return defaultValue;
    }
    current = current[key];
  }
  
  return current === undefined ? defaultValue : current;
};

/**
 * Create a safe filename (for exports, etc.)
 * @param {string} str - Input string
 * @returns {string} - Safe filename
 */
export const createSafeFilename = (str) => {
  if (!str) return 'file';
  
  // Replace unsafe characters with underscores
  return str
    .replace(/[/\\?%*:|"<>]/g, '_')
    .replace(/\s+/g, '_')
    .toLowerCase();
};

/**
 * Get temporary directory path based on platform
 * @returns {string} - Path to temp directory
 */
export const getTempDirectory = () => {
  return FileSystem.cacheDirectory;
};

/**
 * Get documents directory path based on platform
 * @returns {string} - Path to documents directory
 */
export const getDocumentsDirectory = () => {
  return FileSystem.documentDirectory;
};

/**
 * Check if platform is iOS
 * @returns {boolean} - True if iOS
 */
export const isIOS = () => {
  return Platform.OS === 'ios';
};

/**
 * Check if platform is Android
 * @returns {boolean} - True if Android
 */
export const isAndroid = () => {
  return Platform.OS === 'android';
};

/**
 * Debounce function to prevent excessive calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
};

/**
 * Throttle function to limit call frequency
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {Function} - Throttled function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function(...args) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};
