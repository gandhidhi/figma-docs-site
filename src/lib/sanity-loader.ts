/**
 * Astro Content Loader for Sanity
 * SANITY_PROJECT_ID が設定されている場合にSanityからコンテンツを取得する
 */
import { createClient } from '@sanity/client';

export function sanityDocsLoader() {
  return {
    name: 'sanity-docs-loader',
    async load({ store, logger }: { store: any; logger: any }) {
      const projectId = process.env.SANITY_PROJECT_ID;
      if (!projectId) {
        logger.info('SANITY_PROJECT_ID未設定のためSanityローダーをスキップします');
        return;
      }

      logger.info('Sanityからコンテンツを取得中...');

      const client = createClient({
        projectId,
        dataset: process.env.SANITY_DATASET ?? 'production',
        useCdn: false,
        apiVersion: '2024-01-01',
        token: process.env.SANITY_API_TOKEN,
      });

      const query = `*[_type == "docPage"] | order(category asc, order asc) {
        "id": slug.current,
        title,
        description,
        "slug": slug.current,
        category,
        order,
        "body": pt::text(body)
      }`;

      const pages = await client.fetch(query);
      logger.info(`${pages.length}件のページを取得しました`);

      store.clear();
      for (const page of pages) {
        // StarlightはContent Loaderのエントリーをidで参照する
        // slug.currentをそのままidとして使用（例: getting-started/what-is-figma）
        store.set({
          id: page.id,
          data: {
            title: page.title,
            description: page.description,
            sidebar: {
              order: page.order ?? 999,
            },
          },
          body: page.body ?? '',
          rendered: {
            html: `<p>${(page.body ?? '').replace(/\n/g, '</p><p>')}</p>`,
          },
          filePath: `src/content/docs/${page.id}.mdx`,
        });
      }
    },
  };
}
