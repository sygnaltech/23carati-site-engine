/**
 * Route Dispatcher & Module Registry
 * Central location for ALL project modules:
 * - Pages & Components (SSE)
 * - Triggers & Actions (FIX)
 *
 * https://engine.sygnal.com/
 *
 * ENGINE MODE
 * ?engine.mode=dev
 * ?engine.mode=prod
 */

import {
  RouteDispatcher,
  getAllPages,
  getRegistryStats,
  initializeComponents
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
// FIX TRIGGERS - Import all triggers to trigger @trigger decorator
// ============================================================
import "./fix/triggers/trigger-click";

// ============================================================
// FIX ACTIONS - Import all actions to trigger @action decorator
// ============================================================
import "./fix/actions/action-click";
import { ActionDeleteListing } from "./fix/actions/delete-listing";
import { ActionSetStatus } from "./fix/actions/set-status";

// ============================================================
// FIX SYSTEM
// ============================================================
import { initializeFIX, FIXDebug, FIXRegistry, registerProgrammaticAction } from "./fix";

// Register programmatic actions (non-DOM actions that don't need elements)
registerProgrammaticAction('delete-listing', 'delete-listing', ActionDeleteListing);
registerProgrammaticAction('set-status', 'set-status', ActionSetStatus);

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
