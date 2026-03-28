import { describe, test, expect } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';

async function getAllMdxFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await getAllMdxFiles(fullPath));
    } else if (entry.name.endsWith('.mdx')) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * プロパティ1: 全MDXファイルの必須フロントマター
 * Validates: Requirements 4.1, 4.2
 */
describe('プロパティ1: 全MDXファイルの必須フロントマター', () => {
  test('全MDXファイルにtitleとdescriptionが存在する', async () => {
    const docsDir = 'src/content/docs';
    const files = await getAllMdxFiles(docsDir);
    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      expect(content, `${file} に title が必要`).toMatch(/^title:/m);
      expect(content, `${file} に description が必要`).toMatch(/^description:/m);
    }
  });
});
