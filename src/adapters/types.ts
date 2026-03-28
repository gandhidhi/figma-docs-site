export interface DocPage {
  slug: string;
  title: string;
  description: string;
  category: string;
  order: number;
  body: string;
}

export interface IContentAdapter {
  getAllPages(): Promise<DocPage[]>;
  getPageBySlug(slug: string): Promise<DocPage | null>;
  getPagesByCategory(category: string): Promise<DocPage[]>;
}
