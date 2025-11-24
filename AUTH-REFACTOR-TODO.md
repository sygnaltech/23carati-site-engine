# Auth Refactoring TODO

This document tracks future refactoring tasks related to authentication and API calls.

## Current State

- ✅ Memberstack SDK integration implemented
- ✅ Runtime member ID retrieval working
- ✅ API client with optional `useAuth` flag implemented
- ✅ Environment variable `API_REQUIRES_AUTH` controls auth requirement

## Pending Refactors

### 1. Remove `memberstackId` from Request Bodies

**Status**: Not started

**Background**: Currently we're sending `memberstackId` as a hidden form field or in JSON request bodies. Once we're sending JWT bearer tokens, the backend can extract the member ID from the token itself.

**Tasks**:
- [ ] Update backend to extract member ID from JWT token
- [ ] Remove `memberstackId` from form hidden fields in listings.ts
- [ ] Remove `memberstackId` from JSON payloads in actions
- [ ] Update backend API endpoints to read from token instead of request body
- [ ] Test all forms and actions work correctly with auth header only

**Files to modify**:
- `src/pages/listings.ts` - Remove `.addHiddenFields({ memberstackId: ... })`
- `src/actions/set-status.ts` - Remove memberstackId from JSON body
- Backend API endpoints

**Breaking change**: Yes - requires backend changes first

---

### 2. Standardize Error Handling

**Status**: Not started

**Background**: Currently each API call has its own error handling (alerts, console.error, etc.). We might want to standardize this.

**Considerations**:
- Should we have a global error handler?
- Should errors be logged to a service?
- Should we show toast notifications instead of alerts?
- How to handle different error types (network, auth, validation)?

**Decision needed**: Discuss pattern before implementing

---

### 3. Add Request/Response Interceptors

**Status**: Not started

**Background**: As the application grows, we might want centralized logging, error transformation, or other cross-cutting concerns.

**Potential features**:
- Request logging (in development mode)
- Response logging (in development mode)
- Automatic retry on network failure
- Global error transformation
- Performance monitoring

**Decision needed**: Wait until we have a specific need

---

### 4. Token Caching and Refresh

**Status**: Not started

**Background**: Currently we call `getCurrentMemberToken()` on every request. JWTs can expire and may need refresh.

**Questions**:
- Does Memberstack SDK handle token refresh automatically?
- Should we cache the token in memory to reduce SDK calls?
- What happens when a token expires mid-session?
- Do we need to implement refresh token logic?

**Research needed**: Memberstack SDK documentation on token lifecycle

---

### 5. TypeScript Types for API Responses

**Status**: Not started

**Background**: Currently API responses are untyped `Response` objects. We might want typed response bodies.

**Example**:
```typescript
interface ListingResponse {
  id: string;
  status: string;
  // ... other fields
}

const response = await apiRequest<ListingResponse>(endpoint, {...});
const data = await response.json(); // typed as ListingResponse
```

**Decision needed**: Wait until we have multiple API calls with consistent response shapes

---

## Completed Refactors

### ✅ Replace Build-time Member ID with Runtime Retrieval

**Completed**: 2025-11-24

- Removed dependency on `config.memberstackId` (build-time constant)
- Added `getCurrentMemberId()` helper in `src/utils/memberstack.ts`
- Updated all forms in `listings.ts` to use runtime member ID
- Updated `handleDeleteButtonClick()` to retrieve member ID at click time

### ✅ Centralized API Request Helper

**Completed**: 2025-11-24

- Created `src/utils/api-client.ts` with `apiRequest()` function
- Supports both FormData and JSON bodies
- Optional `useAuth` flag with smart environment-based behavior
- Optional `bearerToken` for manual token override

---

## Notes

- Keep this document updated as we complete refactors
- Add new items as we discover technical debt
- Mark items as completed with date when done
