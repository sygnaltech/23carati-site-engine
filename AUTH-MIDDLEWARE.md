# Auth Middleware Pattern (Future Implementation)

## Status: Not Yet Implemented

This document is a placeholder for a future implementation of the **Auth Middleware Pattern** for API requests.

## What is the Auth Middleware Pattern?

The Auth Middleware Pattern involves wrapping or decorating the native `fetch` function to automatically inject authentication headers. This creates a flexible, composable approach to authenticated API calls.

## Hypothetical Example

```typescript
// src/utils/api-middleware.ts

/**
 * Wraps a fetch function with automatic authentication
 * @param fetchFn The fetch function to wrap (usually native fetch)
 * @returns A new fetch function that includes authentication headers
 */
export function withAuth(fetchFn: typeof fetch) {
  return async (url: string | URL | Request, options: RequestInit = {}): Promise<Response> => {
    // Get the token from Memberstack SDK
    const token = await getCurrentMemberToken();

    // Create headers, merging with any existing headers
    const headers = new Headers(options.headers);

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    // Call the original fetch with augmented headers
    return fetchFn(url, { ...options, headers });
  };
}

/**
 * Optional: Wraps fetch with logging middleware
 */
export function withLogging(fetchFn: typeof fetch) {
  return async (url: string | URL | Request, options: RequestInit = {}): Promise<Response> => {
    console.log(`[API] ${options.method || 'GET'} ${url}`);
    const response = await fetchFn(url, options);
    console.log(`[API] ${response.status} ${url}`);
    return response;
  };
}

/**
 * Optional: Wraps fetch with retry logic
 */
export function withRetry(fetchFn: typeof fetch, maxRetries: number = 3) {
  return async (url: string | URL | Request, options: RequestInit = {}): Promise<Response> => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fetchFn(url, options);
      } catch (error) {
        lastError = error as Error;
        console.warn(`[API] Retry ${attempt + 1}/${maxRetries} for ${url}`);
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      }
    }

    throw lastError;
  };
}
```

## Usage Examples

### Basic Usage: Single Middleware

```typescript
import { withAuth } from './utils/api-middleware';

// Create an authenticated fetch function
const authFetch = withAuth(fetch);

// Use it like normal fetch, but with automatic auth headers
const response = await authFetch('/api/listings', {
  method: 'POST',
  body: JSON.stringify({ name: 'Test' }),
  headers: { 'Content-Type': 'application/json' }
});
```

### Advanced Usage: Composing Multiple Middleware

```typescript
import { withAuth, withLogging, withRetry } from './utils/api-middleware';

// Compose multiple middleware layers
const apiFetch = withLogging(
  withRetry(
    withAuth(fetch),
    3  // max retries
  )
);

// This fetch now has: auth + retry + logging
const response = await apiFetch('/api/listings');
```

### In WebflowForm

```typescript
// src/elements/webflow-form.ts
import { withAuth } from '../utils/api-middleware';

export class WebflowForm extends WebflowElementBase {
  private fetchFn: typeof fetch = fetch;

  /**
   * Use authenticated fetch for this form
   */
  useAuth(): this {
    this.fetchFn = withAuth(fetch);
    return this;
  }

  onSubmit(endpoint: string, options?: {...}): this {
    this.formElement.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(this.formElement);

      // Use the configured fetch function (authenticated or not)
      const response = await this.fetchFn(endpoint, {
        method: options?.method || "POST",
        body: formData,
      });

      // ... handle response
    });

    return this;
  }
}

// Usage in listings.ts
setImageForm
  .useAuth()  // Enable authentication middleware
  .addHiddenFields({ listingId: this.pageInfo.itemSlug || "" })
  .onSubmit(setImageEndpoint, {
    preSubmit: () => this.displayMessage("uploading-file"),
    onSuccess: () => setTimeout(() => window.location.reload(), 1500)
  });
```

## Benefits

1. **Composability**: Stack multiple middleware functions (auth, logging, retry, etc.)
2. **Separation of Concerns**: Authentication logic is completely separate from business logic
3. **Type Safety**: Maintains `fetch` signature, so TypeScript types work perfectly
4. **Flexibility**: Can create different fetch variants for different purposes
5. **Testability**: Easy to mock or replace middleware in tests
6. **Standard API**: Uses standard `fetch` interface, no learning curve

## Drawbacks

1. **Complexity**: More abstract than direct options
2. **Harder to Debug**: Middleware wrapping can make stack traces more complex
3. **Memory**: Each wrapper creates a new function closure
4. **Over-engineering**: Might be overkill for simple use cases

## Comparison with Other Patterns

| Feature | Direct Options | Middleware Pattern |
|---------|---------------|-------------------|
| Simplicity | ✅ Very simple | ❌ More abstract |
| Composability | ❌ Limited | ✅ Highly composable |
| Type Safety | ✅ Good | ✅ Excellent |
| Performance | ✅ Minimal overhead | ⚠️ Small overhead |
| Flexibility | ⚠️ Moderate | ✅ Very flexible |
| Learning Curve | ✅ Easy | ⚠️ Moderate |

## When to Use This Pattern

Consider this pattern if:
- You need to compose multiple cross-cutting concerns (auth, logging, retry, caching)
- You want a highly flexible, pluggable architecture
- You're building a larger application with many API interaction points
- You value separation of concerns over simplicity

Don't use this pattern if:
- You have simple authentication needs
- You only have a few API calls
- Team is unfamiliar with functional composition patterns
- Performance is critical (though overhead is minimal)

## Implementation Notes

If we decide to implement this:

1. **Token Caching**: Middleware should cache the token to avoid repeated SDK calls
2. **Error Handling**: Decide what happens if token is unavailable
3. **Conditional Auth**: May want a way to bypass auth for specific requests
4. **Request Cloning**: Need to handle `Request` objects properly (not just URL strings)

## Current Implementation

We currently use **direct options pattern** (see `src/utils/api-client.ts`):

```typescript
// What we have now
const response = await apiRequest(endpoint, {
  body: formData,
  useAuth: true,  // Option flag
});
```

This document is for future exploration of the middleware alternative.
