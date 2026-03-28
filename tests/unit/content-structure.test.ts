import { describe, test, expect } from 'vitest';
import { promises as fs } from 'node:fs';

describe('コンテンツ構造', () => {
  const requiredPages = [
    'getting-started/what-is-figma.mdx',
    'getting-started/installation.mdx',
    'getting-started/account-setup.mdx',
    'basics/ui-overview.mdx',
    'basics/file-management.mdx',
    'basics/frames-and-layers.mdx',
    'basics/shapes-text-images.mdx',
    'basics/components-basics.mdx',
    'advanced/auto-layout.mdx',
    'advanced/prototypes.mdx',
    'advanced/team-sharing.mdx',
    'advanced/plugins.mdx',
    'advanced/design-tokens.mdx',
    'reference/shortcuts.mdx',
    'reference/glossary.mdx',
  ];

  test.each(requiredPages)('src/content/docs/%s が存在する', async (page) => {
    const exists = await fs.access(`src/content/docs/${page}`).then(() => true).catch(() => false);
    expect(exists).toBe(true);
  });
});
