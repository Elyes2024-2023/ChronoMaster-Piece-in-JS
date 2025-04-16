/**
 * ChronoMaster Piece - Environment Configuration
 * Created by ELYES © 2024-2025
 * All rights reserved.
 */

const env = process.env.NODE_ENV || 'development';

/**
 * @typedef {Object} Config
 * @property {string} API_URL - Base URL for API endpoints
 * @property {string} SOCKET_URL - WebSocket server URL
 * @property {string} WEATHER_API_URL - Weather API endpoint
 * @property {boolean} ENABLE_LOGS - Whether to enable logging
 */

/**
 * Validates a URL string
 * @param {string} url - URL to validate
 * @param {boolean} [allowLocal=true] - Whether to allow localhost URLs
 * @returns {boolean} - Whether the URL is valid
 */
const isValidUrl = (url, allowLocal = true) => {
  try {
    const parsed = new URL(url);
    if (!allowLocal && parsed.hostname === 'localhost') {
      return false;
    }
    return ['http:', 'https:', 'ws:', 'wss:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

/**
 * Environment-specific configurations
 * @type {Object.<string, Config>}
 */
const config = {
  development: {
    API_URL: 'http://localhost:3000',
    SOCKET_URL: 'http://localhost:3001',
    WEATHER_API_URL: 'https://api.weatherapi.com/v1',
    ENABLE_LOGS: true,
  },
  production: {
    API_URL: process.env.VITE_API_URL,
    SOCKET_URL: process.env.VITE_SOCKET_URL,
    WEATHER_API_URL: process.env.VITE_WEATHER_API_URL,
    ENABLE_LOGS: false,
  },
  test: {
    API_URL: 'http://localhost:3000',
    SOCKET_URL: 'http://localhost:3001',
    WEATHER_API_URL: 'http://localhost:3002',
    ENABLE_LOGS: true,
  },
};

const currentConfig = config[env];

if (!currentConfig) {
  throw new Error(`Environment ${env} is not configured`);
}

// Validate URL formats
const urlKeys = ['API_URL', 'SOCKET_URL', 'WEATHER_API_URL'];
for (const key of urlKeys) {
  const url = currentConfig[key];
  const allowLocal = env !== 'production';
  if (!isValidUrl(url, allowLocal)) {
    throw new Error(`Invalid ${key} URL: ${url}`);
  }
}

// Type assertion to ensure config matches the typedef
/** @type {Config} */
const typedConfig = currentConfig;

export { typedConfig as config };

/**
 * Validates required environment variables
 * @throws {Error} If required variables are missing
 */
export const validateEnv = () => {
  if (env === 'production') {
    const required = ['VITE_API_URL', 'VITE_SOCKET_URL', 'VITE_WEATHER_API_URL'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // Validate production URLs
    for (const key of required) {
      const url = process.env[key];
      if (!isValidUrl(url, false)) {
        throw new Error(`Invalid production URL for ${key}: ${url}`);
      }
    }
  }
}; 