// src/lib/api/endpoints.js

import { CONFIG } from './config.js';

/**
 * Generates endpoint URLs based on base URL
 * @param {string} baseUrl - The base URL for the API
 * @returns {Object} Object containing all endpoint URLs
 */
function generateEndpoints(baseUrl) {
    const endpoints = {
        CONVERT: `${baseUrl}/convert/file`,
        CONVERT_URL: `${baseUrl}/convert/url`,
        CONVERT_PARENT_URL: `${baseUrl}/convert/parent-url`,
        CONVERT_YOUTUBE: `${baseUrl}/convert/youtube`,
        CONVERT_BATCH: `${baseUrl}/convert/batch`,
        HEALTH: `${baseUrl}/health`
    };

    // Freeze endpoints to prevent modifications
    return Object.freeze(endpoints);
}

/**
 * Validates endpoint configuration
 * @param {Object} endpoints - The endpoints object to validate
 * @throws {Error} If any endpoint is invalid
 */
function validateEndpoints(endpoints) {
    Object.entries(endpoints).forEach(([key, url]) => {
        try {
            new URL(url);
        } catch (error) {
            console.error(`Invalid endpoint URL for ${key}: ${url}`);
            throw new Error(`Invalid endpoint URL for ${key}: ${url}`);
        }
    });
}

// Generate endpoints using base URL from config
export const ENDPOINTS = generateEndpoints(CONFIG.API.BASE_URL);

// Validate endpoints in development
if (import.meta.env.DEV) {
    validateEndpoints(ENDPOINTS);
    console.log('API Base URL:', CONFIG.API.BASE_URL);
    console.log('API Endpoints:', ENDPOINTS);
}

/**
 * Gets the URL for a specific endpoint type and ID
 * @param {string} type - The type of endpoint (e.g., 'url', 'file')
 * @param {string} [id] - Optional ID for specific resource
 * @returns {string} The complete endpoint URL
 */
export function getEndpointUrl(type, id = null) {
    const endpoint = ENDPOINTS[`CONVERT_${type.toUpperCase()}`] || ENDPOINTS.CONVERT;
    return id ? `${endpoint}/${id}` : endpoint;
}

/**
 * Checks if an endpoint exists
 * @param {string} type - The type of endpoint to check
 * @returns {boolean} Whether the endpoint exists
 */
export function hasEndpoint(type) {
    return !!ENDPOINTS[`CONVERT_${type.toUpperCase()}`];
}

// Export utility functions and types
export const EndpointUtils = {
    generateEndpoints,
    validateEndpoints,
    getEndpointUrl,
    hasEndpoint
};