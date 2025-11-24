# Add Listing - Architecture Documentation

## Overview

The Add Listing feature uses the **FIX (Functional Interactions)** system to handle form submission through a trigger → action pattern. This document explains how the components work together.

## File Structure

```
src/
├── pages/
│   └── add-listing.ts          # Page controller (minimal logic)
├── triggers/
│   └── trigger-submit.ts       # Form submission trigger
├── actions/
│   └── add-listing.ts          # API submission action
└── utils/
    ├── api-client.ts           # Centralized API request helper
    └── memberstack.ts          # Memberstack SDK helpers
```

## Architecture Flow

### 1. Page Load ([pages/add-listing.ts](../src/pages/add-listing.ts))

**Responsibility**: Minimal - just page initialization

```typescript
@page("/wholesale/dashboard/add-product")
export class AddListingPage extends PageBase {
  protected async onLoad(): Promise<void> {
    console.log("Add Listing page exec");
    // Page has no form handling logic
    // Form submission is handled by FIX system
  }
}
```

**Future Enhancement**: Will add authentication header injection here (see "Proposed Changes" below)

---

### 2. Form Submission Trigger ([triggers/trigger-submit.ts](../src/triggers/trigger-submit.ts))

**Responsibility**: Detect form submission and serialize form data

**HTML Attribute**: `trigger:submit="add-listing"`

**What it does**:
1. Listens for form `submit` event
2. Prevents default form submission
3. Serializes form fields into `triggerData.fields`
4. Dispatches event named `"add-listing"`
5. **Does NOT make API call**

**Code Flow**:
```typescript
@trigger('submit')
export class TriggerSubmit extends TriggerBase {
  init(): void {
    this.element.addEventListener('submit', (e) => {
      e.preventDefault();
      this.invoke();  // Dispatches event with triggerData
    });
  }

  protected composeTriggerData(): SubmitTriggerData {
    const fields: Record<string, FormValue> = {};

    // Serialize form fields (excluding File inputs)
    const formData = new FormData(this.element);
    for (const [key, value] of formData.entries()) {
      if (!(value instanceof File)) {
        fields[key] = value;
      }
    }

    return { ...base, fields };
  }
}
```

**Output**: `SubmitTriggerData` with serialized fields

---

### 3. Add Listing Action ([actions/add-listing.ts](../src/actions/add-listing.ts))

**Responsibility**: Receive trigger data and submit to API

**Decorator**: `@action('add-listing')` - listens for event named `"add-listing"`

**What it does**:
1. Receives `triggerData` from trigger (contains serialized fields)
2. Gets current member ID from Memberstack SDK
3. Rebuilds FormData from `triggerData.fields`
4. **Makes the fetch call** to `/forms/create-listing`
5. Handles response and redirects to edit page

**Code Flow**:
```typescript
@action('add-listing')
export class ActionAddListing extends ActionBase {
  async trigger(triggerElement: HTMLElement, triggerData: TriggerData): Promise<void> {
    const data = triggerData as SubmitTriggerData;
    const fields = data.fields ?? {};

    // Get runtime member ID
    const memberstackId = await getCurrentMemberId();

    // Rebuild FormData from serialized fields
    const formData = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      formData.append(key, value);
    }
    formData.set('memberstackId', memberstackId);

    // Make API call (THIS IS WHERE THE FETCH HAPPENS)
    const response = await apiRequest(endpoint, {
      method: 'POST',
      body: formData,
      useAuth: true  // Adds Bearer token
    });

    // Handle response and redirect
    if (response.ok) {
      const json = await response.json();
      window.location.href = `/wholesale/pietre/${json.slug}?mode=edit`;
    }
  }
}
```

---

## Current Implementation (as of 2025-11-24)

### Authentication Flow

**Current approach** (temporary):
- Action uses `apiRequest()` with `useAuth: true`
- API client fetches JWT token via `getCurrentMemberToken()`
- Token added to request headers automatically

**Problem**: This approach works but mixes concerns - auth logic is in the action instead of being declarative.

---

## Proposed Changes (Not Yet Implemented)

### Goal: Make authentication declarative via attributes

Instead of auth logic in the action code, we want to:

1. **Declare auth requirements via HTML attributes**
2. **Trigger collects headers** (similar to how it collects fields)
3. **Action uses headers** (without knowing they're for auth)

### Implementation Plan

#### Step 1: Page Load - Inject Auth Header Attribute

In [pages/add-listing.ts](../src/pages/add-listing.ts), add logic to find forms and inject auth header:

```typescript
protected async onLoad(): Promise<void> {
  // Find all forms with trigger:submit
  const forms = document.querySelectorAll('[trigger\\:submit]');

  // Get JWT token
  const token = await getCurrentMemberToken();

  if (token) {
    forms.forEach(form => {
      // Add header attribute: trigger:submit:header:authorization
      form.setAttribute('trigger:submit:header:authorization', `Bearer ${token}`);
    });
  }
}
```

**Result**: Form now has declarative auth header via attribute

#### Step 2: Trigger - Collect Headers

Update [triggers/trigger-submit.ts](../src/triggers/trigger-submit.ts) to read `trigger:submit:header:*` attributes:

```typescript
export type SubmitTriggerData = TriggerData & {
  fields: Record<string, FormValue>;
  headers?: Record<string, string>;  // NEW
};

protected composeTriggerData(): SubmitTriggerData {
  const fields = this.collectFields();
  const headers = this.collectHeaders();  // NEW

  return { ...base, fields, headers };
}

private collectHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};

  // Read all attributes starting with "trigger:submit:header:"
  const attrs = this.element.attributes;
  for (let i = 0; i < attrs.length; i++) {
    const attr = attrs[i];
    if (attr.name.startsWith('trigger:submit:header:')) {
      const headerName = attr.name.replace('trigger:submit:header:', '');
      headers[headerName] = attr.value;
    }
  }

  return headers;
}
```

**Result**: Trigger data now includes both `fields` and `headers`

#### Step 3: Action - Use Headers

Update [actions/add-listing.ts](../src/actions/add-listing.ts) to use headers from trigger data:

```typescript
async trigger(triggerElement: HTMLElement, triggerData: TriggerData): Promise<void> {
  const data = triggerData as SubmitTriggerData;
  const fields = data.fields ?? {};
  const headers = data.headers ?? {};  // NEW

  // Build FormData (same as before)
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }

  // Use headers from trigger data
  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
    headers: headers  // Headers from trigger, not hardcoded auth
  });
}
```

**Result**: Action uses headers declaratively, doesn't know about auth

---

## Benefits of Proposed Approach

1. **Separation of Concerns**: Auth logic is in the page, not scattered across actions
2. **Declarative**: Headers are visible as HTML attributes (easier to debug)
3. **Reusable**: Any form can declare headers via attributes
4. **Flexible**: Can add any header type, not just auth
5. **Consistent**: Mirrors existing pattern of `trigger:submit:data:*` for form data

---

## Data Flow Diagram

### Current Flow (Temporary)
```
User submits form
  ↓
TriggerSubmit
  - Serializes fields
  - Dispatches "add-listing" event
  ↓
ActionAddListing
  - Receives triggerData.fields
  - Gets JWT token (auth logic HERE)
  - Rebuilds FormData
  - Makes fetch() call with auth
  ↓
API
```

### Proposed Flow (Declarative)
```
Page Load
  - AddListingPage.onLoad()
  - Injects trigger:submit:header:authorization attribute
  ↓
User submits form
  ↓
TriggerSubmit
  - Serializes fields
  - Collects headers from attributes
  - Dispatches "add-listing" event
  ↓
ActionAddListing
  - Receives triggerData.fields + triggerData.headers
  - Rebuilds FormData
  - Makes fetch() call with headers
  ↓
API
```

---

## Related Files

- [src/pages/add-listing.ts](../src/pages/add-listing.ts) - Page controller
- [src/triggers/trigger-submit.ts](../src/triggers/trigger-submit.ts) - Submit trigger
- [src/actions/add-listing.ts](../src/actions/add-listing.ts) - Add listing action
- [src/utils/api-client.ts](../src/utils/api-client.ts) - API request helper
- [src/utils/memberstack.ts](../src/utils/memberstack.ts) - Memberstack SDK helpers
- [AUTH-REFACTOR-TODO.md](../AUTH-REFACTOR-TODO.md) - Future auth refactoring tasks

---

## Status

**Current**: Using `apiRequest()` with `useAuth: true` (temporary solution)

**Next Steps**:
1. Implement header injection in pages/add-listing.ts
2. Update trigger-submit.ts to collect headers
3. Update add-listing action to use trigger headers
4. Remove `useAuth` logic from action (move to page level)
5. Test with both authenticated and unauthenticated scenarios
