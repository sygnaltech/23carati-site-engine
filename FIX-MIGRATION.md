# FIX System Migration to sse-core

## Summary

Successfully migrated the FIX (Functional Interactions) system from project-specific code to the sse-core library, making it reusable across all projects.

## What Was Moved to sse-core

### Core Infrastructure
✅ **Base Classes:**
- `fix/base/trigger-base.ts` - Base trigger class + TriggerData interface
- `fix/base/action-base.ts` - Base action class
- `fix/base/event-base.ts` - Base event class

✅ **Registry System:**
- `fix/registry.ts` - FIXRegistry + @trigger and @action decorators
- `fix/event-registry.ts` - EventRegistry for managing events

✅ **Initialization:**
- `fix/initializer.ts` - initializeFIX(), registerProgrammaticAction(), FIXDebug

✅ **Standard Events:**
- `fix/events/event-default.ts` - Parallel execution (fire-and-forget)
- `fix/events/event-sequential.ts` - Sequential execution (async/await)

✅ **Standard Triggers:**
- `fix/triggers/trigger-click.ts` - Click trigger

✅ **Standard Actions:**
- `fix/actions/action-click.ts` - Click action

### Auto-Loading
Standard triggers and actions are automatically registered when `@sygnal/sse-core` is imported. No manual imports needed!

## What Stayed in Project

### Custom Actions (Project-Specific Business Logic)
❌ `fix/actions/delete-listing.ts` - API call to delete listings
❌ `fix/actions/set-status.ts` - API call to update status

These remain project-specific because they contain business logic unique to this project.

## File Structure

### sse-core (D:\Projects\Engines\sse-core\src\fix\)
```
fix/
├── index.ts                    # Main FIX exports
├── registry.ts                 # @trigger, @action decorators
├── event-registry.ts          # Event management
├── initializer.ts             # Core initialization logic
│
├── base/
│   ├── trigger-base.ts
│   ├── action-base.ts
│   └── event-base.ts
│
├── triggers/                  # Standard triggers
│   ├── index.ts               # Auto-imports
│   └── trigger-click.ts
│
├── actions/                   # Standard actions
│   ├── index.ts               # Auto-imports
│   └── action-click.ts
│
└── events/                    # Standard events
    ├── index.ts
    ├── event-default.ts
    └── event-sequential.ts
```

### Project (src/fix/)
```
fix/
└── actions/                   # Only custom actions
    ├── delete-listing.ts
    └── set-status.ts
```

## Changes Made to Project

### 1. routes.ts - Updated Imports
**Before:**
```typescript
import { RouteDispatcher, ... } from "@sygnal/sse-core";

// Manual imports for FIX
import "./fix/triggers/trigger-click";
import "./fix/actions/action-click";
import { initializeFIX, ... } from "./fix";
```

**After:**
```typescript
import {
  RouteDispatcher,
  initializeComponents,
  // FIX imports from sse-core
  initializeFIX,
  FIXDebug,
  FIXRegistry,
  registerProgrammaticAction
} from "@sygnal/sse-core";

// Standard triggers/actions auto-loaded!
// Only import custom actions
import { ActionDeleteListing } from "./fix/actions/delete-listing";
import { ActionSetStatus } from "./fix/actions/set-status";
```

### 2. Custom Actions - Updated Imports
**Before:**
```typescript
import { ActionBase } from '../action-base';
import { action } from '../registry';
import type { TriggerData } from '../trigger-base';
```

**After:**
```typescript
import { ActionBase, action, type TriggerData } from '@sygnal/sse-core';
```

### 3. index.ts - Simplified Imports
**Before:**
```typescript
import { initializeFIX, FIXDebug } from "./fix";
```

**After:**
```typescript
import { ..., initializeFIX, FIXDebug } from "./routes";
```

### 4. package.json - Updated Dependency
```json
{
  "dependencies": {
    "@sygnal/sse-core": "file:../../../Engines/sse-core"
  }
}
```

## Benefits

### 1. Reusability
```typescript
// Project A
import { initializeFIX, trigger, action } from '@sygnal/sse-core';

// Project B
import { initializeFIX, trigger, action } from '@sygnal/sse-core';

// Both get the same standard FIX system!
```

### 2. Clean Separation
```
sse-core     → Standard, reusable FIX components
project      → Only custom business logic
```

### 3. Reduced Boilerplate
```typescript
// Before (repetitive in every project):
import './fix/triggers/trigger-click';
import './fix/actions/action-click';
import './fix/events/event-default';

// After (auto-loaded):
import '@sygnal/sse-core';  // Everything included!
```

### 4. Version Management
```
sse-core v2.1  → Adds trigger-hover, action-toggle-class
project        → Just npm update, get new features
```

## Usage in New Projects

### Basic Setup
```typescript
// routes.ts
import {
  initializeFIX,
  FIXDebug,
  registerProgrammaticAction
} from "@sygnal/sse-core";

// Standard triggers/actions automatically available:
// - trigger:click
// - action:click

// Just add custom actions if needed
import { ActionApiCall } from "./fix/actions/api-call";
registerProgrammaticAction('api-call', 'api-event', ActionApiCall);
```

### Custom Action Template
```typescript
// src/fix/actions/my-action.ts
import { ActionBase, action, type TriggerData } from '@sygnal/sse-core';

@action('my-action')
export class ActionMyAction extends ActionBase {
  init(): void {
    console.log('MyAction initialized');
  }

  async trigger(triggerElement: HTMLElement, triggerData: TriggerData): Promise<void> {
    // Your custom logic here
  }
}
```

## Available Standard Components

### Triggers (from sse-core)
- `trigger:click` - Click events

### Actions (from sse-core)
- `action:click` - Click element

### Events (from sse-core)
- `EventDefault` - Parallel execution (default)
- `EventSequential` - Sequential execution (opt-in)

## Migration Checklist

✅ Move core FIX files to sse-core
✅ Update sse-core tsconfig.json (add experimentalDecorators, moduleResolution)
✅ Export FIX from sse-core/src/index.ts
✅ Build sse-core (`npm run build`)
✅ Update project package.json to use local sse-core
✅ Update project imports (routes.ts, index.ts, custom actions)
✅ Remove project's local FIX infrastructure files
✅ Keep only custom actions in project
✅ Test compilation (`npx tsc --noEmit`)

## Files to Delete from Project

Once confirmed working, these can be deleted:

```
src/fix/
├── index.ts                    # DELETE - now in sse-core
├── registry.ts                 # DELETE - now in sse-core
├── event-registry.ts           # DELETE - now in sse-core
├── trigger-base.ts             # DELETE - now in sse-core
├── action-base.ts              # DELETE - now in sse-core
├── event-base.ts               # DELETE - now in sse-core
├── triggers/
│   └── trigger-click.ts        # DELETE - now in sse-core
├── actions/
│   └── action-click.ts         # DELETE - now in sse-core
└── events/
    ├── event-default.ts        # DELETE - now in sse-core
    └── event-sequential.ts     # DELETE - now in sse-core
```

**KEEP:**
```
src/fix/actions/
├── delete-listing.ts           # KEEP - custom action
└── set-status.ts               # KEEP - custom action
```

## Next Steps

1. **Test the application** - Ensure all FIX interactions still work
2. **Delete old files** - Remove redundant FIX infrastructure from project
3. **Publish sse-core** - Make it available via npm for other projects
4. **Document new actions** - Add to FIX.md when creating new standard actions

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - Overall project structure
- [FIX.md](FIX.md) - FIX system usage guide
- [FIX-DEBUG.md](FIX-DEBUG.md) - Debugging guide
- [FIX-SEQUENTIAL.md](FIX-SEQUENTIAL.md) - Sequential events guide
