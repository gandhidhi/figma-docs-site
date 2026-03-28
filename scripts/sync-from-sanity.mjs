/**
 * SanityのコンテンツをMDXファイルとして src/content/docs/ に書き出すスクリプト
 * SANITY_PROJECT_ID が設定されている場合のみ実行される
 * 使い方: node scripts/sync-from-sanity.mjs
 */
import { createClient } from '@sanity/client';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { config } from 'dotenv';

config();

const projectId = process.env.SANITY_PROJECT_ID;
if (!projectId) {
  console.log('SANITY_PROJECT_ID未設定のためスキップします');
  process.exit(0);
}

const client = createClient({
  projectId,
  dataset: process.env.SANITY_DATASET ?? 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
});

const query = `*[_type == "docPage"] | order(category asc, order asc) {
  "slug": slug.current,
  title,
  description,
  category,
  order,
  "body": pt::text(body)
}`;

const pages = await client.fetch(query);
console.log(`${pages.length}件のページを取得しました`);

// 既存のSanity由来ファイルを削除（getting-started, basics, advanced, referenceディレクトリ）
const categories = ['getting-started', 'basics', 'advanced', 'reference'];
for (const cat of categories) {
  const catDir = join('src/content/docs', cat);
  if (existsSync(catDir)) {
    rmSync(catDir, { recursive: true });
    console.log(`🗑️  ${cat}/ を削除しました`);
  }
}

for (const page of pages) {
  // .mdx形式で書き出す（bodyのJSX特殊文字はエスケープ）
  const filePath = join('src/content/docs', `${page.slug}.mdx`);
  const dir = dirname(filePath);
  mkdirSync(dir, { recursive: true });

  // bodyのJSX特殊文字をエスケープ（{ } < > をHTMLエンティティに変換）
  const safeBody = (page.body ?? '')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const content = `---
title: ${page.title}
description: ${page.description}
sidebar:
  order: ${page.order ?? 999}
---

${safeBody}
`;

  writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ ${page.slug}`);
}

console.log('\n同期完了');
