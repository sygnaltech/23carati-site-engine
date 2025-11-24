/**
 * Application Configuration
 *
 * Provides type-safe access to environment variables.
 * Variables are injected at build time via esbuild's define option.
 */

// Declare environment variables for TypeScript
declare const process: {
  env: {
    NODE_ENV: string;
    API_BASE_URL: string;
    MEMBERSTACK_ID: string;
    API_REQUIRES_AUTH: string;
  };
};

/**
 * Application configuration object
 */
export const config = {
  /**
   * Current environment (development or production)
   */
  env: process.env.NODE_ENV || 'development',

  /**
   * Whether running in production mode
   */
  isProduction: process.env.NODE_ENV === 'production',

  /**
   * Whether running in development mode
   */
  isDevelopment: process.env.NODE_ENV !== 'production',

  /**
   * API base URL
   */
  apiBaseUrl: process.env.API_BASE_URL,

  /**
   * Memberstack ID for the current environment
   */
  memberstackId: process.env.MEMBERSTACK_ID,

  /**
   * Whether API endpoints require authentication
   * Set to "false" in testing environments to bypass auth
   */
  apiRequiresAuth: process.env.API_REQUIRES_AUTH !== 'false',
};

/**
 * API endpoint builder
 */
export const api = {
  /**
   * Get full API endpoint URL
   * @param path - API path (e.g., '/forms/upload-multi-image')
   * @returns Full URL
   */
  url: (path: string): string => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${config.apiBaseUrl}${cleanPath}`;
  },

  /**
   * API endpoints
   */
  endpoints: {
    uploadMultiImage: `${config.apiBaseUrl}/forms/upload-multi-image`,
    deleteMultiImage: `${config.apiBaseUrl}/forms/delete-multi-image`,
  },
};
