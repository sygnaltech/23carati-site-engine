/**
 * API Client Utility
 *
 * Provides centralized API request handling with optional authentication.
 * Supports both FormData (for file uploads) and JSON request bodies.
 */

import { getCurrentMemberToken } from './memberstack';
import { config } from '../config';

/**
 * Options for API requests
 */
export interface ApiRequestOptions {
  /** HTTP method (default: POST) */
  method?: string;

  /** Request body - can be FormData or object (will be JSON.stringify'd) */
  body?: FormData | Record<string, any>;

  /** Additional headers to include */
  headers?: HeadersInit;

  /**
   * Automatically include Memberstack bearer token
   * - If true: Fetches token from Memberstack SDK and includes if config.apiRequiresAuth is true
   * - If false/undefined: No authentication header
   */
  useAuth?: boolean;

  /**
   * Manual bearer token override
   * If provided, this token will be used instead of fetching from Memberstack
   */
  bearerToken?: string;
}

/**
 * Make an API request with optional authentication
 *
 * @param url The URL to request
 * @param options Request options
 * @returns Promise<Response>
 *
 * @example
 * // Simple POST with JSON body
 * const response = await apiRequest('/api/status', {
 *   body: { status: 'active' }
 * });
 *
 * @example
 * // Form submission with automatic auth
 * const formData = new FormData(formElement);
 * const response = await apiRequest('/api/upload', {
 *   body: formData,
 *   useAuth: true
 * });
 *
 * @example
 * // Manual token override
 * const response = await apiRequest('/api/data', {
 *   body: { foo: 'bar' },
 *   bearerToken: customToken
 * });
 */
export async function apiRequest(
  url: string,
  options: ApiRequestOptions = {}
): Promise<Response> {
  const headers: Record<string, string> = {};

  // Copy existing headers if provided
  if (options.headers) {
    const existingHeaders = new Headers(options.headers);
    existingHeaders.forEach((value, key) => {
      headers[key] = value;
    });
  }

  // Handle authentication
  if (options.bearerToken) {
    // Manual token takes precedence
    headers['Authorization'] = `Bearer ${options.bearerToken}`;
    console.log('[API] Using manual bearer token');
  } else if (options.useAuth && config.apiRequiresAuth) {
    // Auto-fetch from Memberstack if auth is required
    console.log('[API] Fetching auth token from Memberstack...');
    const token = await getCurrentMemberToken();

    if (!token) {
      throw new Error('[API] Authentication required but no token available');
    }

    headers['Authorization'] = `Bearer ${token}`;
    console.log('[API] Added bearer token to request');
  } else if (options.useAuth && !config.apiRequiresAuth) {
    console.log('[API] Auth requested but API_REQUIRES_AUTH=false, skipping auth');
  }

  // Handle body formatting
  let body: BodyInit | undefined;
  if (options.body) {
    if (options.body instanceof FormData) {
      body = options.body;
      // Don't set Content-Type for FormData - browser sets it with boundary
    } else {
      body = JSON.stringify(options.body);
      headers['Content-Type'] = 'application/json';
    }
  }

  console.log(`[API] ${options.method || 'POST'} ${url}`);

  const response = await fetch(url, {
    method: options.method || 'POST',
    headers,
    body,
  });

  console.log(`[API] ${response.status} ${url}`);
  return response;
}
