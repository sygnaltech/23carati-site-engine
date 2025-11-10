/**
 * Page | Home
 * Home page module for the root route
 */

import { page, PageBase } from "@sygnal/sse-core";

@page('/')
export class HomePage extends PageBase {

  protected onPrepare(): void {
    console.log('Page ID:', this.pageInfo.pageId);
  }

  protected async onLoad(): Promise<void> {
    console.log('HomePage initialized');
  }

}
