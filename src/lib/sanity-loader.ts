/**
 * Astro Content Loader for Sanity
 * SANITY_PROJECT_ID が設定されている場合はSanityから取得する
 * 未設定の場合はローカルMDXファイルを直接読み込む
 */
import { createClient } from '@sanity/client';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

function parseFrontmatter(content: string) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { data: {} as Record<string, any>, body: content };
  const frontmatter = match[1];
  const body = content.slice(match[0].length).trim();
  const data: Record<string, any> = {};
  for (const line of frontmatter.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    if (key && value) data[key] = value;
  }
  const orderMatch = frontmatter.match(/sidebar:\s*\n\s+order:\s*(\d+)/);
  if (orderMatch) data.order = parseInt(orderMatch[1], 10);
  return { data, body };
}

function getMdxFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      files.push(...getMdxFiles(fullPath));
    } else if (extname(entry) === '.mdx') {
      files.push(fullPath);
    }
  }
  return files;
}

export function sanityDocsLoader() {
  return {
    name: 'sanity-docs-loader',
    async load({ store, logger }: { store: any; logger: any }) {
      const projectId = process.env.SANITY_PROJECT_ID;

      if (!projectId) {
        logger.info('SANITY_PROJECT_ID未設定のためローカルMDXを使用します');
        const docsDir = 'src/content/docs';
        const files = getMdxFiles(docsDir);
        store.clear();
        for (const filePath of files) {
          const content = readFileSync(filePath, 'utf-8');
          const { data, body } = parseFrontmatter(content);
          // src/content/docs/getting-started/what-is-figma.mdx → getting-started/what-is-figma
          const id = filePath
            .replace(/\\/g, '/')
            .replace(/.*src\/content\/docs\//, '')
            .replace(/\.mdx$/, '');
          store.set({
            id,
            data: {
              title: data.title ?? id,
              description: data.description ?? '',
              sidebar: { order: data.order ?? 999 },
            },
            body,
            rendered: { html: `<p>${body.replace(/\n/g, '</p><p>')}</p>` },
            filePath,
          });
        }
        logger.info(`${files.length}件のローカルMDXページを読み込みました`);
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
        store.set({
          id: page.id,
          data: {
            title: page.title,
            description: page.description,
            sidebar: { order: page.order ?? 999 },
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
