/**
 * Page | Test Loader
 * For testing the loader overlay component
 */

import { page, PageBase } from "@sygnal/sse-core";
import { LoaderOverlayComponent } from "../../components/loader-overlay";

@page('/test/loader')
export class TestLoaderPage extends PageBase {

  protected onPrepare(): void {
    console.log('Page ID:', this.pageInfo.pageId);
  }

  protected async onLoad(): Promise<void> {
    console.log('TestLoaderPage initialized');

    // Find all <a href="#"> links
    const links = document.querySelectorAll('a[test]');
    console.log(`[TestLoaderPage] Found ${links.length} test links`);

    // Get the loader-overlay component from the registry
    const [loaderOverlay] = window.componentManager?.getComponentsByType<LoaderOverlayComponent>('loader-overlay') ?? [];

    if (!loaderOverlay) {
      console.warn('[TestLoaderPage] loader-overlay component not found in registry');
      return;
    }

    console.log('[TestLoaderPage] loader-overlay component found');

    // Add click handlers to all links
    links.forEach(link => {
      console.log('[TestLoaderPage] Adding click handler to link:', link);
      link.addEventListener('click', (e) => {
//        e.preventDefault();
console.log('[TestLoaderPage] Link clicked:', link);
        // Get the link's inner text as the mode
        const mode = (link.textContent?.trim() || 'default').toLowerCase();
        console.log(`[TestLoaderPage] Link clicked with mode: ${mode}`);

        // Call the loader overlay's show method
        loaderOverlay.show(mode);
      });
    });
  }

}
