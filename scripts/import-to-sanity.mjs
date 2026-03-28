/**
 * MDXコンテンツをSanityにインポートするスクリプト
 * 使い方: node scripts/import-to-sanity.mjs
 */

import { createClient } from '@sanity/client';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, basename, extname } from 'node:path';
import { readFile } from 'node:fs/promises';
import { config } from 'dotenv';

config(); // .envを読み込む

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_MCP_TOKEN, // Developer権限トークンを使用
  useCdn: false,
});

/** frontmatterをパースする */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { data: {}, body: content };

  const frontmatter = match[1];
  const body = content.slice(match[0].length).trim();
  const data = {};

  for (const line of frontmatter.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    if (key && value) data[key] = value;
  }

  // sidebar.order を取得
  const orderMatch = frontmatter.match(/sidebar:\s*\n\s+order:\s*(\d+)/);
  if (orderMatch) data.order = parseInt(orderMatch[1], 10);

  return { data, body };
}

/** MDXのJSXコンポーネントタグを除去してプレーンテキストに変換 */
function mdxToPlainText(mdx) {
  return mdx
    .replace(/^import\s+.*$/gm, '')           // importを除去
    .replace(/<[A-Z][^>]*>[\s\S]*?<\/[A-Z][^>]*>/g, '') // JSXコンポーネントを除去
    .replace(/<[A-Z][^/]*\/>/g, '')            // 自己閉じタグを除去
    .replace(/^#{1,6}\s+/gm, '')              // 見出し記号を除去
    .replace(/\*\*(.*?)\*\*/g, '$1')          // 太字を除去
    .replace(/\*(.*?)\*/g, '$1')              // イタリックを除去
    .replace(/`(.*?)`/g, '$1')               // インラインコードを除去
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // リンクをテキストに
    .replace(/^\s*[-*]\s+/gm, '')            // リスト記号を除去
    .replace(/\n{3,}/g, '\n\n')              // 連続改行を整理
    .trim();
}

/** Portable Text形式のブロックに変換 */
function textToPortableText(text) {
  return text
    .split('\n\n')
    .filter(p => p.trim())
    .map(paragraph => ({
      _type: 'block',
      _key: Math.random().toString(36).slice(2, 9),
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: Math.random().toString(36).slice(2, 9),
          text: paragraph.trim(),
          marks: [],
        },
      ],
    }));
}

/** ディレクトリ内のMDXファイルを再帰的に取得 */
function getMdxFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      files.push(...getMdxFiles(fullPath));
    } else if (extname(entry) === '.mdx' && entry !== 'index.mdx') {
      files.push(fullPath);
    }
  }
  return files;
}

/** カテゴリをディレクトリ名から取得 */
function getCategoryFromPath(filePath) {
  const parts = filePath.replace(/\\/g, '/').split('/');
  const docsIdx = parts.indexOf('docs');
  return docsIdx !== -1 ? parts[docsIdx + 1] : 'getting-started';
}

/** スラッグをファイルパスから生成 */
function getSlugFromPath(filePath) {
  const parts = filePath.replace(/\\/g, '/').split('/');
  const docsIdx = parts.indexOf('docs');
  if (docsIdx === -1) return basename(filePath, '.mdx');
  return parts.slice(docsIdx + 1).join('/').replace('.mdx', '');
}

async function main() {
  console.log('🚀 Sanityへのインポートを開始します...\n');

  if (!process.env.SANITY_PROJECT_ID) {
    console.error('❌ SANITY_PROJECT_ID が設定されていません');
    process.exit(1);
  }

  const docsDir = 'src/content/docs';
  const files = getMdxFiles(docsDir);
  console.log(`📄 ${files.length}件のMDXファイルを検出しました\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const filePath of files) {
    const content = readFileSync(filePath, 'utf-8');
    const { data, body } = parseFrontmatter(content);
    const slug = getSlugFromPath(filePath);
    const category = getCategoryFromPath(filePath);
    const plainText = mdxToPlainText(body);
    const portableText = textToPortableText(plainText);

    const doc = {
      _type: 'docPage',
      _id: `docPage-${slug.replace(/\//g, '-')}`,
      title: data.title ?? basename(filePath, '.mdx'),
      description: data.description ?? '',
      slug: { _type: 'slug', current: slug },
      category,
      order: data.order ?? 999,
      body: portableText,
    };

    try {
      await client.createOrReplace(doc);
      console.log(`✅ ${slug}`);
      successCount++;
    } catch (err) {
      console.error(`❌ ${slug}: ${err.message}`);
      errorCount++;
    }
  }

  console.log(`\n完了: ${successCount}件成功, ${errorCount}件失敗`);
}

main().catch(err => {
  console.error('予期しないエラー:', err);
  process.exit(1);
});
