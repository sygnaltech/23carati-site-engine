/**
 * Route Dispatcher & Module Registry
 * Central location for all pages and components auto-discovery
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

// ============================================================
// COMPONENTS - Import all components to trigger @component decorator
// ============================================================
// Add more component imports here as you create them

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
 * Re-export functions from sse-core for convenience
 */
export { initializeComponents, getRegistryStats };
