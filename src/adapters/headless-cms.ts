import type { IContentAdapter, DocPage } from './types';

export class HeadlessCMSAdapter implements IContentAdapter {
  async getAllPages(): Promise<DocPage[]> {
    throw new Error('Not implemented: HeadlessCMSAdapter is a stub for Phase 2');
  }

  async getPageBySlug(_slug: string): Promise<DocPage | null> {
    throw new Error('Not implemented: HeadlessCMSAdapter is a stub for Phase 2');
  }

  async getPagesByCategory(_category: string): Promise<DocPage[]> {
    throw new Error('Not implemented: HeadlessCMSAdapter is a stub for Phase 2');
  }
}
