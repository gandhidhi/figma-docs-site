# 技術設計書: Figmaドキュメントサイト

## 概要

Figmaの使い方を解説する静的ドキュメントサイトを、Astro + Starlightフレームワークで構築する。
コンテンツはフェーズ1でMDXファイルをローカル管理し、フェーズ2でヘッドレスCMS（Contentful / Sanity / Micro など）へ移行できる設計とする。

### 設計方針

- **コンテンツ抽象化**: コンテンツ取得ロジックをアダプター層に集約し、MDXとCMSを差し替え可能にする
- **静的生成優先**: ビルド時に全ページを静的HTMLとして出力し、サーバーレス運用を実現する
- **Starlight活用**: サイドバー・検索・TOC・ダークモードなどはStarlightの組み込み機能を最大限利用する
- **段階的移行**: フェーズ1の実装がフェーズ2移行の障壁にならないよう、インターフェースを先に定義する

---

## アーキテクチャ

### 全体構成

```
┌─────────────────────────────────────────────────────┐
│                   ブラウザ (静的HTML)                  │
└─────────────────────────────────────────────────────┘
                          ↑ 静的ファイル配信
┌─────────────────────────────────────────────────────┐
│          静的ホスティング (GitHub Pages / Netlify / Vercel) │
└─────────────────────────────────────────────────────┘
                          ↑ npm run build
┌─────────────────────────────────────────────────────┐
│                   Astro ビルドパイプライン               │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │  Starlight   │  │  Pagefind    │  │  MDX処理  │  │
│  │  (UI/Nav)    │  │  (検索Index) │  │  (remark) │  │
│  └──────────────┘  └──────────────┘  └───────────┘  │
│                          ↑                           │
│  ┌─────────────────────────────────────────────────┐ │
│  │           コンテンツアダプター層                   │ │
│  │  ┌──────────────────┐  ┌──────────────────────┐ │ │
│  │  │  LocalMDXAdapter │  │  HeadlessCMSAdapter  │ │ │
│  │  │  (フェーズ1)      │  │  (フェーズ2)          │ │ │
│  │  └──────────────────┘  └──────────────────────┘ │ │
│  └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### フェーズ移行戦略

| 項目 | フェーズ1 (MDXローカル) | フェーズ2 (ヘッドレスCMS) |
|------|----------------------|------------------------|
| コンテンツ保存先 | `src/content/docs/*.mdx` | CMS API (Contentful / Sanity / Micro) |
| ビルド時データ取得 | Astro Content Collections | `getStaticPaths` + CMS SDK |
| スキーマ定義 | `src/content/config.ts` | CMS側スキーマ + 型生成 |
| アダプター | `LocalMDXAdapter` | `ContentfulAdapter` 等 |
| 環境変数 | 不要 | `CMS_API_KEY`, `CMS_SPACE_ID` 等 |

移行時に変更が必要なのはアダプター実装のみで、Starlightの設定・UIコンポーネント・ページルーティングは変更不要。

---

## コンポーネントとインターフェース

### ディレクトリ構成

```
figma-docs-site/
├── astro.config.mjs          # Astro + Starlight 設定
├── package.json
├── tsconfig.json
├── public/
│   ├── favicon.svg
│   └── images/               # 静的画像アセット
├── src/
│   ├── content/
│   │   ├── config.ts         # Content Collections スキーマ定義
│   │   └── docs/             # MDXコンテンツ (フェーズ1)
│   │       ├── getting-started/
│   │       │   ├── what-is-figma.mdx
│   │       │   ├── installation.mdx
│   │       │   └── account-setup.mdx
│   │       ├── basics/
│   │       │   ├── ui-overview.mdx
│   │       │   ├── file-management.mdx
│   │       │   ├── frames-and-layers.mdx
│   │       │   ├── shapes-text-images.mdx
│   │       │   └── components-basics.mdx
│   │       ├── advanced/
│   │       │   ├── auto-layout.mdx
│   │       │   ├── prototypes.mdx
│   │       │   ├── team-sharing.mdx
│   │       │   ├── plugins.mdx
│   │       │   └── design-tokens.mdx
│   │       └── reference/
│   │           ├── shortcuts.mdx
│   │           └── glossary.mdx
│   ├── adapters/
│   │   ├── types.ts           # IContentAdapter インターフェース定義
│   │   ├── local-mdx.ts       # LocalMDXAdapter (フェーズ1)
│   │   └── headless-cms.ts    # HeadlessCMSAdapter スタブ (フェーズ2用)
│   └── components/
│       └── custom/            # カスタムMDXコンポーネント (必要に応じて追加)
└── dist/                      # ビルド出力 (gitignore)
```

### コンテンツアダプターインターフェース

フェーズ移行を容易にするため、コンテンツ取得を抽象化するインターフェースを定義する。

```typescript
// src/adapters/types.ts

export interface DocPage {
  slug: string;
  title: string;
  description: string;
  category: string;
  order: number;
  body: string; // MDX/HTML文字列
}

export interface IContentAdapter {
  /** 全ページのメタデータ一覧を取得 */
  getAllPages(): Promise<DocPage[]>;
  /** スラッグでページを1件取得 */
  getPageBySlug(slug: string): Promise<DocPage | null>;
  /** カテゴリ別ページ一覧を取得 */
  getPagesByCategory(category: string): Promise<DocPage[]>;
}
```

### LocalMDXAdapter (フェーズ1)

```typescript
// src/adapters/local-mdx.ts
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
```

### Starlight 設定 (astro.config.mjs)

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Figma ドキュメント',
      logo: { src: './public/favicon.svg' },
      defaultLocale: 'ja',
      sidebar: [
        {
          label: 'はじめに',
          items: [
            { label: 'Figmaとは', slug: 'getting-started/what-is-figma' },
            { label: 'インストール方法', slug: 'getting-started/installation' },
            { label: 'アカウント作成とログイン', slug: 'getting-started/account-setup' },
          ],
        },
        {
          label: '基本操作',
          items: [
            { label: '画面構成と各部名称', slug: 'basics/ui-overview' },
            { label: 'ファイルとプロジェクトの管理', slug: 'basics/file-management' },
            { label: 'フレームとレイヤー', slug: 'basics/frames-and-layers' },
            { label: '図形・テキスト・画像の配置', slug: 'basics/shapes-text-images' },
            { label: 'コンポーネントの基本', slug: 'basics/components-basics' },
          ],
        },
        {
          label: '応用操作',
          items: [
            { label: 'オートレイアウト', slug: 'advanced/auto-layout' },
            { label: 'プロトタイプとインタラクション', slug: 'advanced/prototypes' },
            { label: 'チーム共有とコメント', slug: 'advanced/team-sharing' },
            { label: 'プラグインの活用', slug: 'advanced/plugins' },
            { label: 'デザイントークンとスタイル管理', slug: 'advanced/design-tokens' },
          ],
        },
        {
          label: 'リファレンス',
          items: [
            { label: 'ショートカットキー一覧', slug: 'reference/shortcuts' },
            { label: '用語集', slug: 'reference/glossary' },
          ],
        },
      ],
    }),
  ],
});
```

---

## データモデル

### MDXフロントマタースキーマ (フェーズ1)

Astro Content Collections でスキーマを型安全に定義する。

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({
    schema: docsSchema({
      extend: z.object({
        // Starlightの標準フィールド (title, description) に加えて拡張可能
        // フェーズ2移行時はここにCMS由来のフィールドを追加
      }),
    }),
  }),
};
```

### 標準フロントマターフィールド

| フィールド | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `title` | `string` | ✅ | ページタイトル（サイドバー・TOCに表示） |
| `description` | `string` | ✅ | ページ概要（SEOメタタグに使用） |
| `sidebar.order` | `number` | - | サイドバー内の表示順序 |
| `sidebar.label` | `string` | - | サイドバー表示名（titleと異なる場合） |

### MDXファイル例

```mdx
---
title: インストール方法
description: Figmaデスクトップアプリとブラウザアクセスのインストールおよびセットアップ手順
sidebar:
  order: 2
---

import { Steps, Tabs, TabItem } from '@astrojs/starlight/components';

## インストール手順

<Tabs>
  <TabItem label="デスクトップアプリ">
    <Steps>
      1. [Figma公式サイト](https://figma.com)からインストーラーをダウンロード
      2. インストーラーを実行してインストール完了
      3. アプリを起動してログイン
    </Steps>
  </TabItem>
  <TabItem label="ブラウザ">
    <Steps>
      1. ブラウザで [figma.com](https://figma.com) にアクセス
      2. アカウントでログイン
      3. そのまま使用開始
    </Steps>
  </TabItem>
</Tabs>
```

### フェーズ2: ヘッドレスCMSデータモデル対応表

フェーズ2移行時、CMSのコンテンツタイプは以下のフィールドを持つよう設計する。

| CMSフィールド | 対応するMDXフロントマター | 型 |
|-------------|----------------------|-----|
| `title` | `title` | Short Text |
| `description` | `description` | Short Text |
| `slug` | ファイルパス由来 | Short Text (unique) |
| `category` | ディレクトリ名由来 | Reference / Enum |
| `order` | `sidebar.order` | Integer |
| `body` | MDXボディ | Rich Text / Markdown |


---

## 正確性プロパティ

*プロパティとは、システムの全ての有効な実行において成立すべき特性や振る舞いのことです。つまり、システムが何をすべきかについての形式的な記述です。プロパティは人間が読める仕様と機械で検証可能な正確性保証の橋渡しをします。*

### プロパティ1: 全MDXファイルの配置と必須フロントマター

*全ての* ドキュメントページ（MDXファイル）は `src/content/docs/` 配下の適切なカテゴリディレクトリに配置されており、かつ `title` と `description` の両フロントマターフィールドを持つ。

**検証対象: 要件 4.1, 4.2**

### プロパティ2: 定義済みページの網羅的存在

*全ての* 要件定義書（要件5〜8）で列挙されたページ（計16ページ）に対応するMDXファイルが `src/content/docs/` 配下に存在する。

**検証対象: 要件 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2**

### プロパティ3: コンテンツアダプターのラウンドトリップ

*任意の* MDXページスラッグに対して、`LocalMDXAdapter.getPageBySlug(slug)` を呼び出した結果のスラッグが、入力スラッグと一致する。

**検証対象: 要件 4.1, 4.2**

### プロパティ4: カテゴリフィルタリングの一貫性

*任意の* カテゴリ名に対して、`LocalMDXAdapter.getPagesByCategory(category)` が返す全ページのカテゴリフィールドが、入力カテゴリ名と一致する。

**検証対象: 要件 2.1, 4.1**

---

## エラーハンドリング

### ビルド時エラー

| エラー種別 | 発生条件 | 対応 |
|-----------|---------|------|
| フロントマター不足 | MDXファイルに `title` または `description` が欠如 | Astro Content Collectionsがビルドエラーを出力し、対象ファイルとフィールド名を明示 |
| 壊れた内部リンク | MDX内のリンク先ページが存在しない | Starlightの `checkLinks` 設定でビルド警告を出力 |
| 無効なコンポーネント | MDXで未インポートのコンポーネントを使用 | Astroのビルドエラーとして報告 |

### フェーズ2移行時のエラー

| エラー種別 | 発生条件 | 対応 |
|-----------|---------|------|
| CMS API認証失敗 | 環境変数 `CMS_API_KEY` が未設定または無効 | ビルド開始時に早期エラーを出力し、必要な環境変数を明示 |
| CMS接続タイムアウト | ビルド時のAPI呼び出しがタイムアウト | リトライロジック（最大3回）を実装し、失敗時はエラーメッセージを出力 |
| スキーマ不一致 | CMSのコンテンツタイプとアダプターの型定義が不一致 | TypeScriptの型チェックでビルド前に検出 |

### ランタイムエラー（静的サイトのため最小限）

静的サイトのためサーバーサイドのランタイムエラーは発生しない。
クライアントサイドのエラーはPagefind検索のみに限定される。

---

## テスト戦略

### デュアルテストアプローチ

ユニットテストとプロパティベーステストを組み合わせて包括的なカバレッジを実現する。

- **ユニットテスト**: 特定の例・エッジケース・エラー条件を検証
- **プロパティテスト**: 全入力に対して成立すべき普遍的プロパティを検証

### テストフレームワーク

| テスト種別 | ライブラリ | 対象 |
|-----------|----------|------|
| ユニットテスト | [Vitest](https://vitest.dev/) | アダプター・設定・ファイル構造 |
| プロパティベーステスト | [fast-check](https://fast-check.io/) | アダプターのデータ変換ロジック |

### ユニットテスト

ユニットテストは具体的な例・統合ポイント・エラー条件に集中する。

**テスト対象と例:**

```typescript
// tests/unit/project-setup.test.ts
// 要件1: プロジェクト初期構成
describe('プロジェクト初期構成', () => {
  it('package.jsonにastroと@astrojs/starlightが含まれる', async () => {
    const pkg = JSON.parse(await fs.readFile('package.json', 'utf-8'));
    expect(pkg.dependencies['astro'] ?? pkg.devDependencies['astro']).toBeDefined();
    expect(pkg.dependencies['@astrojs/starlight'] ?? pkg.devDependencies['@astrojs/starlight']).toBeDefined();
  });

  it('astro.config.mjsにstarlightインテグレーションが設定されている', async () => {
    const config = await fs.readFile('astro.config.mjs', 'utf-8');
    expect(config).toContain('@astrojs/starlight');
  });
});

// 要件2: サイドバー設定
describe('サイドバー設定', () => {
  it('4つのトップレベルカテゴリが定義されている', () => {
    const labels = sidebarConfig.map(item => item.label);
    expect(labels).toContain('はじめに');
    expect(labels).toContain('基本操作');
    expect(labels).toContain('応用操作');
    expect(labels).toContain('リファレンス');
  });
});

// 要件4: フロントマターエラー
describe('フロントマターバリデーション', () => {
  it('titleが欠如したMDXファイルはビルドエラーを出力する', async () => {
    // Astro Content Collectionsのスキーマバリデーションを確認
    await expect(validateFrontmatter({ description: 'test' })).rejects.toThrow();
  });
});
```

### プロパティベーステスト

各プロパティテストは最低100回のイテレーションで実行する。

```typescript
// tests/property/adapter.property.test.ts
import fc from 'fast-check';
import { LocalMDXAdapter } from '../../src/adapters/local-mdx';

// Feature: figma-docs-site, Property 3: コンテンツアダプターのラウンドトリップ
test('getPageBySlugのラウンドトリップ', async () => {
  const adapter = new LocalMDXAdapter();
  const allPages = await adapter.getAllPages();
  const slugs = allPages.map(p => p.slug);

  await fc.assert(
    fc.asyncProperty(
      fc.constantFrom(...slugs),
      async (slug) => {
        const page = await adapter.getPageBySlug(slug);
        return page !== null && page.slug === slug;
      }
    ),
    { numRuns: 100 }
  );
});

// Feature: figma-docs-site, Property 4: カテゴリフィルタリングの一貫性
test('getPagesByCategoryの一貫性', async () => {
  const adapter = new LocalMDXAdapter();
  const categories = ['getting-started', 'basics', 'advanced', 'reference'];

  await fc.assert(
    fc.asyncProperty(
      fc.constantFrom(...categories),
      async (category) => {
        const pages = await adapter.getPagesByCategory(category);
        return pages.every(p => p.category === category);
      }
    ),
    { numRuns: 100 }
  );
});
```

### ファイル構造テスト

```typescript
// tests/unit/content-structure.test.ts
// Feature: figma-docs-site, Property 1 & 2: MDXファイルの配置と網羅性
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
```

### テスト設定

```json
// vitest.config.ts
{
  "test": {
    "globals": true,
    "environment": "node",
    "include": ["tests/**/*.test.ts"],
    "coverage": {
      "provider": "v8",
      "include": ["src/adapters/**"]
    }
  }
}
```
