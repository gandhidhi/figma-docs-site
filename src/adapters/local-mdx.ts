import { getCollection } from 'astro:content';
import type { IContentAdapter, DocPage } from './types';

export class LocalMDXAdapter implements IContentAdapter {
  async getAllPages(): Promise<DocPage[]> {
    const entries = await getCollection('docs');
    return entries.map(entry => ({
      slug: entry.slug,
      title: entry.data.title,
      description: entry.data.description ?? '',
      category: entry.slug.split('/')[0],
      order: entry.data.sidebar?.order ?? 999,
      body: entry.body,
    }));
  }

  async getPageBySlug(slug: string): Promise<DocPage | null> {
    const pages = await this.getAllPages();
    return pages.find(p => p.slug === slug) ?? null;
  }

  async getPagesByCategory(category: string): Promise<DocPage[]> {
    const pages = await this.getAllPages();
    return pages.filter(p => p.category === category);
  }
}
