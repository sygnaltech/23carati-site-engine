# Project Architecture

## Overview

This project uses the SSE (Sygnal Site Engine) framework along with a custom FIX (Functional Interactions) system for declarative event-driven interactions.

## Module Registry (routes.ts)

**Single Source of Truth** for all project modules.

### Purpose

The `src/routes.ts` file serves as the central registry where ALL project modules are imported. This triggers their decorators (`@page`, `@component`, `@trigger`, `@action`) to register themselves with their respective systems.

### Structure

```typescript
// SSE Modules
├── PAGES          - Page controllers (@page decorator)
├── COMPONENTS     - Reusable components (@component decorator)

// FIX Modules
├── TRIGGERS       - Event triggers (@trigger decorator)
├── ACTIONS        - Event actions (@action decorator)
└── PROGRAMMATIC   - Non-DOM actions (API calls, etc.)
```

### Adding New Modules

**To add a new page:**
```typescript
// In routes.ts under PAGES section
import "./pages/my-new-page";
```

**To add a new component:**
```typescript
// In routes.ts under COMPONENTS section
import "./components/my-component";
```

**To add a new FIX trigger:**
```typescript
// In routes.ts under FIX TRIGGERS section
import "./fix/triggers/trigger-hover";
```

**To add a new FIX action:**
```typescript
// In routes.ts under FIX ACTIONS section
import "./fix/actions/action-toggle-class";
```

**To add a programmatic action:**
```typescript
// 1. Import the class
import { ActionMyApi } from "./fix/actions/my-api";

// 2. Register it (under FIX SYSTEM section)
registerProgrammaticAction('my-api', 'my-event', ActionMyApi);
```

## Initialization Flow

### Order of Operations

```
1. setup() - Synchronous initialization
   ├── Routes imported (triggers all decorators)
   └── Dispatcher created

2. exec() - Asynchronous execution (after DOM ready)
   ├── initializeComponents() - SSE components registered
   ├── initializeFIX()        - FIX system scans DOM
   └── dispatcher.execRoute() - Page onLoad() runs
```

### Why This Order Matters

1. **Components before FIX**: Components must exist in `componentManager` before FIX actions try to use them
2. **FIX before Routes**: FIX system must scan DOM before page-specific code runs
3. **Routes last**: Page `onLoad()` methods can safely access components and FIX systems

**See:** `src/index.ts` lines 70-77

## SSE System

### Pages

Page controllers that respond to Webflow's `[data-page]` attribute.

**Example:**
```typescript
import { PageBase, page } from '@sygnal/sse';

@page('home')
export class HomePage extends PageBase {
  protected onLoad(): void {
    console.log('Home page loaded');
  }
}
```

**Registry:** Auto-discovered via `@page` decorator when imported in `routes.ts`

### Components

Reusable components that respond to `[data-component]` attribute.

**Example:**
```typescript
import { ComponentBase, component } from '@sygnal/sse';

@component('loader-overlay')
export class LoaderOverlayComponent extends ComponentBase {
  protected onPrepare(): void {
    console.log('Loader prepared');
  }
}
```

**Registry:** Auto-discovered via `@component` decorator when imported in `routes.ts`

**Access:** `window.componentManager.getComponentsByType('loader-overlay')`

## FIX System

Declarative event-driven interaction system using HTML attributes.

### Flow

```
User Action → Trigger → Event → Action(s)
```

### Triggers

Capture user actions and fire events.

**Example:**
```typescript
import { TriggerBase, trigger } from '../fix';

@trigger('click')
export class TriggerClick extends TriggerBase {
  init(): void {
    this.element.addEventListener('click', () => {
      this.invoke(); // Fires the event
    });
  }
}
```

**HTML:**
```html
<button trigger:click="delete-item"
        trigger:click:data:item-id="123">
  Delete
</button>
```

**Registry:** Auto-discovered via `@trigger` decorator when imported in `routes.ts`

### Actions

Respond to events when they fire.

**Example:**
```typescript
import { ActionBase, action } from '../fix';

@action('click')
export class ActionClick extends ActionBase {
  trigger(triggerElement: HTMLElement, triggerData: TriggerData): void {
    this.element?.click();
  }
}
```

**HTML:**
```html
<button action:click="delete-item" id="confirm-delete">
  Confirm
</button>
```

**Registry:** Auto-discovered via `@action` decorator when imported in `routes.ts`

### Programmatic Actions

Actions that don't need HTML elements (API calls, etc.).

**Example:**
```typescript
import { ActionBase, action } from '../fix';

@action('delete-listing')
export class ActionDeleteListing extends ActionBase {
  async trigger(triggerElement: HTMLElement, triggerData: TriggerData): Promise<void> {
    const slug = triggerData['slug'];
    await fetch(`/api/listings/${slug}`, { method: 'DELETE' });
  }
}
```

**Registration:**
```typescript
// In routes.ts
import { ActionDeleteListing } from "./fix/actions/delete-listing";
registerProgrammaticAction('delete-listing', 'delete-listing', ActionDeleteListing);
```

### Events

Event types control how actions are executed.

**EventDefault (Parallel):**
- All actions fire simultaneously
- Fire-and-forget
- Default behavior

**EventSequential (Sequential):**
- Actions execute one at a time
- Waits for async operations
- Must be registered programmatically

```typescript
// In page onLoad()
import { EventRegistry, EventSequential } from '../fix';
EventRegistry.registerEvent('playlist', new EventSequential('playlist'));
```

## File Organization

```
src/
├── index.ts                 # Main entry point
├── routes.ts               # MODULE REGISTRY (single source of truth)
├── site.ts                 # Site-level configuration
│
├── pages/                  # Page controllers
│   ├── home.ts
│   ├── listings.ts
│   └── overview.ts
│
├── components/             # Reusable components
│   └── loader-overlay.ts
│
├── fix/                    # FIX system
│   ├── index.ts           # Initialization logic
│   ├── registry.ts        # Decorator definitions
│   ├── event-registry.ts  # Event management
│   │
│   ├── triggers/          # Trigger handlers
│   │   └── trigger-click.ts
│   │
│   ├── actions/           # Action handlers
│   │   ├── action-click.ts
│   │   ├── delete-listing.ts
│   │   └── set-status.ts
│   │
│   └── events/            # Event handlers
│       ├── event-default.ts
│       └── event-sequential.ts
│
└── utils/                 # Utility functions
    ├── loader.ts
    └── switch.ts
```

## Debugging

### SSE Registry

```javascript
// In browser console
console.log('Pages:', window.componentManager);
```

### FIX Registry

```javascript
// In browser console
FIXDebug.stats()           // Overview of entire system
FIXDebug.triggerTypes()    // Available trigger types
FIXDebug.actionTypes()     // Available action types
FIXDebug.triggers()        // Active trigger instances
FIXDebug.actions()         // Active action instances
FIXDebug.events()          // Registered events
```

**See:** [FIX-DEBUG.md](FIX-DEBUG.md) for complete debugging guide

## Benefits of Unified Registry

### Before (Separated)

```
routes.ts        → Pages, Components
fix/index.ts     → Triggers, Actions
```

- Two places to maintain
- Confusion about where to add modules
- Inconsistent patterns

### After (Unified)

```
routes.ts        → EVERYTHING (Pages, Components, Triggers, Actions)
fix/index.ts     → Pure initialization logic (no imports)
```

- ✅ Single source of truth
- ✅ Consistent pattern for all modules
- ✅ Easy to see entire project structure
- ✅ Clear sections for different module types
- ✅ Decorator-based auto-discovery throughout

## Key Principles

1. **Decorators trigger registration** - Importing a file with a decorator registers the class
2. **routes.ts imports everything** - Single place for all module imports
3. **Initialization order matters** - Components before FIX before Pages
4. **Programmatic actions are special** - Registered via function call, not HTML

## Documentation

- [SSE.md](SSE.md) - SSE system reference
- [FIX.md](FIX.md) - FIX system reference
- [FIX-DEBUG.md](FIX-DEBUG.md) - FIX debugging guide
- [FIX-SEQUENTIAL.md](FIX-SEQUENTIAL.md) - Sequential events guide
- [SSE-FIXES.md](SSE-FIXES.md) - Known issues and fixes
