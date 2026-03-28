# 要件定義書

## はじめに

本ドキュメントは、Figmaデザインツールの使い方を解説するドキュメントサイトの要件を定義します。
Astro + Starlightフレームワークを使用した静的サイトとして構築し、インストール手順から基本操作・応用操作まで網羅したコンテンツを提供します。
gooseドキュメントサイト（https://block.github.io/goose/docs/category/guides/）を参考に、カテゴリ階層ナビゲーション・検索機能・MDXコンテンツ管理を備えた構成とします。

---

## 用語集

- **Site**: Figmaドキュメントサイト全体
- **Starlight**: Astroベースのドキュメント特化フレームワーク
- **MDX**: Markdownの拡張形式。JSXコンポーネントを埋め込み可能なコンテンツ形式
- **Sidebar**: サイト左側に表示されるカテゴリ階層ナビゲーション
- **Search**: サイト内コンテンツを全文検索する機能
- **Page**: 各ドキュメントページ（MDXファイル1つに対応）
- **Category**: 複数のPageをまとめるグループ（例: はじめに、基本操作、応用操作）
- **Frontmatter**: MDXファイル先頭のYAML形式メタデータ（title, descriptionなど）
- **Build**: AstroによるサイトのHTML静的ビルド処理

---

## 要件

### 要件1: プロジェクト初期構成

**ユーザーストーリー:** 開発者として、Astro + Starlightで構成されたプロジェクトを用意したい。そうすることで、ドキュメントサイトの開発をすぐに開始できる。

#### 受け入れ基準

1. THE Site SHALL use Astro and Starlight as the foundational framework.
2. THE Site SHALL be configurable via `astro.config.mjs` with Starlight integration settings.
3. THE Site SHALL include a `package.json` defining all required dependencies including `astro` and `@astrojs/starlight`.
4. WHEN `npm run build` is executed, THE Site SHALL generate a static HTML output without errors.
5. WHEN `npm run dev` is executed, THE Site SHALL start a local development server.

---

### 要件2: サイドバーナビゲーション（カテゴリ階層）

**ユーザーストーリー:** 読者として、カテゴリ階層のサイドバーからドキュメントを探したい。そうすることで、目的のページに素早くたどり着ける。

#### 受け入れ基準

1. THE Sidebar SHALL display a hierarchical category structure with at least the following top-level categories: 「はじめに」「基本操作」「応用操作」「リファレンス」.
2. WHEN a user clicks a category label in the Sidebar, THE Sidebar SHALL expand or collapse the child pages under that category.
3. WHEN a user navigates to a Page, THE Sidebar SHALL highlight the currently active page link.
4. THE Sidebar SHALL be defined declaratively in `astro.config.mjs` using Starlight's `sidebar` configuration.
5. THE Sidebar SHALL be visible on all documentation pages.

---

### 要件3: 全文検索機能

**ユーザーストーリー:** 読者として、キーワードでドキュメントを検索したい。そうすることで、特定のFigma機能の説明をすぐに見つけられる。

#### 受け入れ基準

1. THE Search SHALL be enabled via Starlight's built-in Pagefind integration.
2. WHEN a user enters a keyword in the search box, THE Search SHALL display matching pages and excerpts within 500ms of input.
3. WHEN no results are found, THE Search SHALL display a "見つかりませんでした" message.
4. THE Search SHALL index all Page content including headings and body text.
5. WHEN `npm run build` is executed, THE Search SHALL automatically generate a search index from the built HTML output.

---

### 要件4: MDXコンテンツ管理

**ユーザーストーリー:** コンテンツ編集者として、MDX形式でドキュメントを作成・管理したい。そうすることで、Markdownの書きやすさを保ちながらリッチなコンポーネントを埋め込める。

#### 受け入れ基準

1. THE Site SHALL store all documentation content as `.mdx` files under the `src/content/docs/` directory.
2. THE Site SHALL support Frontmatter fields `title` and `description` in every MDX file.
3. WHEN an MDX file is missing a required Frontmatter field, THE Build SHALL output a descriptive error message identifying the file and missing field.
4. THE Site SHALL support embedding Starlight built-in components (Aside, Card, CardGrid, Steps, Tabs) within MDX files.
5. THE Site SHALL support standard Markdown syntax including headings, lists, code blocks, tables, and links within MDX files.

---

### 要件5: コンテンツ構成 — はじめにカテゴリ

**ユーザーストーリー:** Figma初心者として、インストール手順とアカウント設定を知りたい。そうすることで、Figmaをすぐに使い始められる。

#### 受け入れ基準

1. THE Site SHALL include a Page titled 「Figmaとは」 explaining the overview and use cases of Figma.
2. THE Site SHALL include a Page titled 「インストール方法」 covering installation steps for Desktop App (Windows / macOS) and browser access.
3. THE Site SHALL include a Page titled 「アカウント作成とログイン」 covering account registration and login procedures.
4. WHEN a user reads the 「インストール方法」 Page, THE Page SHALL present installation steps using the Starlight Steps component.

---

### 要件6: コンテンツ構成 — 基本操作カテゴリ

**ユーザーストーリー:** Figma初心者として、UIの見方とファイル操作の基本を学びたい。そうすることで、Figmaを自力で操作できるようになる。

#### 受け入れ基準

1. THE Site SHALL include a Page titled 「画面構成と各部名称」 describing the Figma editor UI layout and component names.
2. THE Site SHALL include a Page titled 「ファイルとプロジェクトの管理」 covering file creation, duplication, and organization.
3. THE Site SHALL include a Page titled 「フレームとレイヤー」 covering frame creation and layer panel operations.
4. THE Site SHALL include a Page titled 「図形・テキスト・画像の配置」 covering placement and editing of shapes, text, and images.
5. THE Site SHALL include a Page titled 「コンポーネントの基本」 covering creation and reuse of components.

---

### 要件7: コンテンツ構成 — 応用操作カテゴリ

**ユーザーストーリー:** Figma中級者として、プロトタイプ作成やチーム共有の方法を学びたい。そうすることで、実務レベルのデザインワークフローを実践できる。

#### 受け入れ基準

1. THE Site SHALL include a Page titled 「オートレイアウト」 covering Auto Layout configuration and responsive design techniques.
2. THE Site SHALL include a Page titled 「プロトタイプとインタラクション」 covering prototype link creation and interaction settings.
3. THE Site SHALL include a Page titled 「チーム共有とコメント」 covering file sharing, permission settings, and comment features.
4. THE Site SHALL include a Page titled 「プラグインの活用」 covering plugin installation and usage examples.
5. THE Site SHALL include a Page titled 「デザイントークンとスタイル管理」 covering color styles, text styles, and design token management.

---

### 要件8: コンテンツ構成 — リファレンスカテゴリ

**ユーザーストーリー:** Figmaユーザーとして、ショートカットキーや用語を素早く参照したい。そうすることで、作業効率を高められる。

#### 受け入れ基準

1. THE Site SHALL include a Page titled 「ショートカットキー一覧」 listing keyboard shortcuts organized by category (選択・移動、編集、表示など).
2. THE Site SHALL include a Page titled 「用語集」 defining key Figma-specific terms.
3. THE 「ショートカットキー一覧」 Page SHALL present shortcuts in a table format with columns for 操作名, Windows, and macOS.

---

### 要件9: サイト全体のUI・UX

**ユーザーストーリー:** 読者として、読みやすく使いやすいサイトデザインを期待する。そうすることで、ストレスなくドキュメントを読み進められる。

#### 受け入れ基準

1. THE Site SHALL display a site title and logo in the header, configurable via `astro.config.mjs`.
2. THE Site SHALL support both light mode and dark mode, switchable by the user.
3. THE Site SHALL display a table of contents (TOC) for each Page showing the heading structure.
4. THE Site SHALL display previous/next page navigation links at the bottom of each Page.
5. THE Site SHALL be responsive and readable on screen widths from 375px (mobile) to 1440px (desktop).

---

### 要件10: 静的ビルドとデプロイ適合性

**ユーザーストーリー:** 開発者として、静的ファイルとしてビルドしてホスティングサービスにデプロイしたい。そうすることで、サーバーレスで低コストな運用ができる。

#### 受け入れ基準

1. WHEN `npm run build` is executed, THE Build SHALL output all files to the `dist/` directory as static HTML, CSS, and JavaScript.
2. THE Site SHALL be deployable to GitHub Pages, Netlify, or Vercel without server-side runtime dependencies.
3. THE Site SHALL include a `public/` directory for static assets such as images and favicon.
4. IF a broken internal link is detected during build, THEN THE Build SHALL output a warning identifying the source file and target URL.

---

### 要件11: Sanityヘッドレスコンテンツ管理（フェーズ2）

**ユーザーストーリー:** コンテンツ管理者として、Sanity Studioからドキュメントを編集・公開したい。そうすることで、コードを触らずにコンテンツを更新できる。

#### 受け入れ基準

1. THE Site SHALL integrate with Sanity as the headless CMS in Phase 2.
2. THE Site SHALL define a `docPage` content type in Sanity schema with fields: `title` (string, required), `description` (string, required), `slug` (slug, required, unique), `category` (string, required), `order` (number), `body` (array of blocks / Portable Text).
3. THE SanityAdapter SHALL implement IContentAdapter and fetch content via GROQ queries using `@sanity/client`.
4. WHEN `SANITY_PROJECT_ID` and `SANITY_DATASET` environment variables are set, THE Build SHALL use SanityAdapter instead of LocalMDXAdapter.
5. THE Site SHALL generate static pages at build time from Sanity content using `getStaticPaths`.
6. WHEN Sanity API returns an error, THE Build SHALL output a descriptive error message and exit with a non-zero status code.

---

### 要件12: Sanity MCPサーバー連携

**ユーザーストーリー:** 開発者として、KiroからSanity MCPサーバー経由でコンテンツを自然言語で操作したい。そうすることで、コンテンツの作成・更新・クエリをAIアシスタントと協力して効率的に行える。

#### 受け入れ基準

1. THE Project SHALL include a `.kiro/settings/mcp.json` configuration file that registers the Sanity MCP server (`mcp.sanity.io`).
2. WHEN the Sanity MCP server is configured, THE AI assistant SHALL be able to execute GROQ queries against the Sanity dataset.
3. WHEN the Sanity MCP server is configured, THE AI assistant SHALL be able to create, update, and patch Sanity documents using natural language instructions.
4. THE MCP configuration SHALL support both OAuth and token-based authentication methods.
5. THE Project SHALL include documentation in README.md explaining how to configure and use the Sanity MCP server with Kiro.
