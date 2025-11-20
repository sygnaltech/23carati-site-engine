/**
 * Module Registry
 * Central location for ALL project modules:
 * - Pages & Components (SSE)
 * - Actions & Events (FIX)
 *
 * This file imports all modules to trigger their decorators (@page, @component, @action)
 * and provides a single source of truth for the application's module structure.
 *
 * https://engine.sygnal.com/
 */

import {
  RouteDispatcher,
  getAllPages,
  getRegistryStats,
  initializeComponents,
  // FIX imports from sse-core
  initializeFIX,
  FIXDebug,
  FIXRegistry,
  registerActionType,
  registerTriggerType,
  registerProgrammaticAction
} from "@sygnal/sse-core";
import { Site } from "./site";

// ============================================================
// PAGES - Import all pages to trigger @page decorator
// ============================================================
import "./pages/home";
import "./pages/listings";
import "./pages/overview";
import "./pages/add-listing";
import "./pages/test/test-loader";

// ============================================================
// COMPONENTS - Import all components to trigger @component decorator
// ============================================================
import "./components/loader-overlay";

// ============================================================
// FIX - STANDARD TRIGGERS & ACTIONS (auto-loaded from sse-core)
// ============================================================
// Standard triggers and actions are automatically registered when
// @sygnal/sse-core is imported. No manual imports needed!
// - trigger:click (TriggerClick)
// - action:click (ActionClick)
// Project-specific triggers/actions imported below

// ============================================================
// ACTIONS - Custom project actions (FIX)
// ============================================================
import { ActionDeleteListing } from "./actions/delete-listing";
import { ActionSetStatus } from "./actions/set-status";
import { ActionAddListing } from "./actions/add-listing";
import { TriggerSubmit } from "./triggers/trigger-submit";

// Register programmatic actions (non-DOM actions that don't need elements)
registerProgrammaticAction('delete-listing', 'delete-listing', ActionDeleteListing);
registerProgrammaticAction('set-status', 'set-status', ActionSetStatus);
registerProgrammaticAction('add-listing', 'add-listing', ActionAddListing);

registerTriggerType('submit', TriggerSubmit); 

/**
 * Create and configure route dispatcher
 */
export const routeDispatcher = (): RouteDispatcher => {
    const dispatcher = new RouteDispatcher(Site);

    // Auto-discovered routes from @page decorators
    dispatcher.routes = getAllPages();

    return dispatcher;
}

/**
 * Re-export SSE functions from sse-core for convenience
 */
export { initializeComponents, getRegistryStats };

/**
 * Re-export FIX functions and utilities
 */
export { initializeFIX, FIXDebug, FIXRegistry };

/**
 * Get FIX registry stats (mirrors getRegistryStats for SSE)
 */
export const getFIXRegistryStats = () => ({
    triggers: FIXRegistry.getTriggerNames().length,
    actions: FIXRegistry.getActionNames().length,
});
