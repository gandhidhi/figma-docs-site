import { createClient } from '@sanity/client';
import type { IContentAdapter, DocPage } from './types';

const client = createClient({
  projectId: import.meta.env.SANITY_PROJECT_ID,
  dataset: import.meta.env.SANITY_DATASET ?? 'production',
  useCdn: true,
  apiVersion: '2024-01-01',
  token: import.meta.env.SANITY_API_TOKEN,
});

export class SanityAdapter implements IContentAdapter {
  async getAllPages(): Promise<DocPage[]> {
    const query = `*[_type == "docPage"] | order(order asc) {
      "slug": slug.current,
      title,
      description,
      category,
      order,
      "body": pt::text(body)
    }`;
    return client.fetch(query);
  }

  async getPageBySlug(slug: string): Promise<DocPage | null> {
    const query = `*[_type == "docPage" && slug.current == $slug][0] {
      "slug": slug.current,
      title,
      description,
      category,
      order,
      "body": pt::text(body)
    }`;
    const result = await client.fetch(query, { slug });
    return result ?? null;
  }

  async getPagesByCategory(category: string): Promise<DocPage[]> {
    const query = `*[_type == "docPage" && category == $category] | order(order asc) {
      "slug": slug.current,
      title,
      description,
      category,
      order,
      "body": pt::text(body)
    }`;
    return client.fetch(query, { category });
  }
}
