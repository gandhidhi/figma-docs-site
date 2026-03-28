import { describe, it, expect } from 'vitest';
import { promises as fs } from 'node:fs';

describe('プロジェクト初期構成', () => {
  it('package.jsonにastroが含まれる', async () => {
    const pkg = JSON.parse(await fs.readFile('package.json', 'utf-8'));
    const hasAstro = 'astro' in (pkg.dependencies ?? {}) || 'astro' in (pkg.devDependencies ?? {});
    expect(hasAstro).toBe(true);
  });

  it('package.jsonに@astrojs/starlightが含まれる', async () => {
    const pkg = JSON.parse(await fs.readFile('package.json', 'utf-8'));
    const hasSL = '@astrojs/starlight' in (pkg.dependencies ?? {}) || '@astrojs/starlight' in (pkg.devDependencies ?? {});
    expect(hasSL).toBe(true);
  });

  it('astro.config.mjsに@astrojs/starlightが設定されている', async () => {
    const config = await fs.readFile('astro.config.mjs', 'utf-8');
    expect(config).toContain('@astrojs/starlight');
  });
});

describe('サイドバー設定', () => {
  it('4つのトップレベルカテゴリが定義されている', async () => {
    const config = await fs.readFile('astro.config.mjs', 'utf-8');
    expect(config).toContain('はじめに');
    expect(config).toContain('基本操作');
    expect(config).toContain('応用操作');
    expect(config).toContain('リファレンス');
  });
});
