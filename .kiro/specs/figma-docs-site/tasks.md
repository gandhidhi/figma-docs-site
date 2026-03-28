# 実装計画: Figmaドキュメントサイト

## 概要

Astro + Starlightを使用したFigmaドキュメントサイトを段階的に構築する。
コンテンツアダプター層を先に定義してフェーズ2（ヘッドレスCMS）への移行を容易にしつつ、
フェーズ1ではMDXローカル管理で全コンテンツを実装する。

## タスク

- [x] 1. プロジェクト初期構成のセットアップ
  - `package.json` を作成し `astro`・`@astrojs/starlight`・`vitest`・`fast-check` を依存関係に追加する
  - `tsconfig.json` を作成してTypeScript設定を行う
  - `astro.config.mjs` を作成してStarlightインテグレーションの基本設定を記述する（title・defaultLocale）
  - `public/favicon.svg` を作成する
  - _要件: 1.1, 1.2, 1.3_

- [x] 2. コンテンツアダプター層の実装
  - [x] 2.1 `src/adapters/types.ts` を作成して `DocPage` インターフェースと `IContentAdapter` インターフェースを定義する
    - `getAllPages()`, `getPageBySlug()`, `getPagesByCategory()` メソッドを定義する
    - _要件: 4.1, 4.2_
  - [x] 2.2 `src/adapters/local-mdx.ts` を作成して `LocalMDXAdapter` クラスを実装する
    - `getCollection('docs')` を使用してMDXファイルを取得する
    - スラッグからカテゴリを抽出するロジックを実装する
    - _要件: 4.1, 4.2_
  - [ ]* 2.3 プロパティテスト: ラウンドトリップ一貫性（プロパティ3）
    - **プロパティ3: コンテンツアダプターのラウンドトリップ**
    - **検証: 要件 4.1, 4.2**
    - `tests/property/adapter.property.test.ts` に `fc.asyncProperty` で実装する
  - [ ]* 2.4 プロパティテスト: カテゴリフィルタリング一貫性（プロパティ4）
    - **プロパティ4: カテゴリフィルタリングの一貫性**
    - **検証: 要件 2.1, 4.1**
    - `getPagesByCategory` の返却値が全て入力カテゴリと一致することを検証する
  - [x] 2.5 `src/adapters/headless-cms.ts` を作成してフェーズ2用の `HeadlessCMSAdapter` スタブを実装する
    - `IContentAdapter` を実装し、全メソッドは `throw new Error('Not implemented')` とする
    - _要件: （フェーズ2対応）_

- [x] 3. Content Collectionsスキーマ定義
  - [x] 3.1 `src/content/config.ts` を作成して `docsSchema` を使用したコレクション定義を実装する
    - `title`・`description` を必須フィールドとして定義する
    - `sidebar.order`・`sidebar.label` をオプションフィールドとして定義する
    - _要件: 4.2, 4.3_
  - [ ]* 3.2 ユニットテスト: フロントマターバリデーション
    - `title` または `description` が欠如した場合にバリデーションエラーが発生することを確認する
    - `tests/unit/frontmatter.test.ts` に実装する
    - _要件: 4.3_

- [x] 4. チェックポイント — アダプター層の動作確認
  - 全テストが通ることを確認する。疑問点があればユーザーに確認する。

- [x] 5. サイドバーナビゲーション設定
  - [x] 5.1 `astro.config.mjs` のサイドバー設定に4つのトップレベルカテゴリを定義する
    - 「はじめに」「基本操作」「応用操作」「リファレンス」の各カテゴリとスラッグを設定する
    - _要件: 2.1, 2.4_
  - [ ]* 5.2 ユニットテスト: サイドバー設定の検証
    - サイドバー設定に4つのカテゴリが含まれることを確認する
    - `tests/unit/project-setup.test.ts` に実装する
    - _要件: 2.1_

- [x] 6. 「はじめに」カテゴリのMDXコンテンツ作成
  - [x] 6.1 `src/content/docs/getting-started/what-is-figma.mdx` を作成する
    - frontmatter: `title: Figmaとは`, `description` を設定する
    - Figmaの概要とユースケースを記述する
    - _要件: 5.1_
  - [x] 6.2 `src/content/docs/getting-started/installation.mdx` を作成する
    - frontmatter: `title: インストール方法`, `description` を設定する
    - Starlightの `Steps` コンポーネントと `Tabs` コンポーネントを使用してWindows/macOS/ブラウザの手順を記述する
    - _要件: 5.2, 5.4_
  - [x] 6.3 `src/content/docs/getting-started/account-setup.mdx` を作成する
    - frontmatter: `title: アカウント作成とログイン`, `description` を設定する
    - アカウント登録とログイン手順を記述する
    - _要件: 5.3_

- [x] 7. 「基本操作」カテゴリのMDXコンテンツ作成
  - [x] 7.1 `src/content/docs/basics/ui-overview.mdx` を作成する（`title: 画面構成と各部名称`）
    - _要件: 6.1_
  - [x] 7.2 `src/content/docs/basics/file-management.mdx` を作成する（`title: ファイルとプロジェクトの管理`）
    - _要件: 6.2_
  - [x] 7.3 `src/content/docs/basics/frames-and-layers.mdx` を作成する（`title: フレームとレイヤー`）
    - _要件: 6.3_
  - [x] 7.4 `src/content/docs/basics/shapes-text-images.mdx` を作成する（`title: 図形・テキスト・画像の配置`）
    - _要件: 6.4_
  - [x] 7.5 `src/content/docs/basics/components-basics.mdx` を作成する（`title: コンポーネントの基本`）
    - _要件: 6.5_

- [x] 8. 「応用操作」カテゴリのMDXコンテンツ作成
  - [x] 8.1 `src/content/docs/advanced/auto-layout.mdx` を作成する（`title: オートレイアウト`）
    - _要件: 7.1_
  - [x] 8.2 `src/content/docs/advanced/prototypes.mdx` を作成する（`title: プロトタイプとインタラクション`）
    - _要件: 7.2_
  - [x] 8.3 `src/content/docs/advanced/team-sharing.mdx` を作成する（`title: チーム共有とコメント`）
    - _要件: 7.3_
  - [x] 8.4 `src/content/docs/advanced/plugins.mdx` を作成する（`title: プラグインの活用`）
    - _要件: 7.4_
  - [x] 8.5 `src/content/docs/advanced/design-tokens.mdx` を作成する（`title: デザイントークンとスタイル管理`）
    - _要件: 7.5_

- [x] 9. 「リファレンス」カテゴリのMDXコンテンツ作成
  - [x] 9.1 `src/content/docs/reference/shortcuts.mdx` を作成する（`title: ショートカットキー一覧`）
    - 操作名・Windows・macOSの3列テーブル形式でショートカットを記述する
    - _要件: 8.1, 8.3_
  - [x] 9.2 `src/content/docs/reference/glossary.mdx` を作成する（`title: 用語集`）
    - Figma固有の主要用語を定義する
    - _要件: 8.2_

- [x] 10. チェックポイント — コンテンツ網羅性の確認
  - 全テストが通ることを確認する。疑問点があればユーザーに確認する。

- [x] 11. ファイル構造テストの実装
  - [x] 11.1 `tests/unit/content-structure.test.ts` を作成して全16ページのMDXファイル存在確認テストを実装する
    - `test.each` で各ファイルパスを検証する
    - _要件: 5.1〜5.3, 6.1〜6.5, 7.1〜7.5, 8.1〜8.2_
  - [ ]* 11.2 プロパティテスト: 全MDXファイルの必須フロントマター（プロパティ1）
    - **プロパティ1: 全MDXファイルの配置と必須フロントマター**
    - **検証: 要件 4.1, 4.2**
    - `src/content/docs/` 配下の全MDXファイルに `title` と `description` が存在することを検証する
  - [ ]* 11.3 プロパティテスト: 定義済みページの網羅的存在（プロパティ2）
    - **プロパティ2: 定義済みページの網羅的存在**
    - **検証: 要件 5.1〜5.3, 6.1〜6.5, 7.1〜7.5, 8.1〜8.2**
    - 要件定義の16ページ全てに対応するMDXファイルが存在することを検証する

- [x] 12. プロジェクト設定テストの実装
  - [x] 12.1 `tests/unit/project-setup.test.ts` を作成する
    - `package.json` に `astro` と `@astrojs/starlight` が含まれることを確認する
    - `astro.config.mjs` に `@astrojs/starlight` が含まれることを確認する
    - _要件: 1.2, 1.3_
  - [x] 12.2 `vitest.config.ts` を作成してテスト設定を定義する
    - `environment: 'node'`、`include: ['tests/**/*.test.ts']` を設定する

- [x] 13. 最終チェックポイント — 全テスト通過確認
  - 全テストが通ることを確認する。疑問点があればユーザーに確認する。

## 注意事項

- `*` が付いたタスクはオプションであり、MVPを優先する場合はスキップ可能
- 各タスクは対応する要件番号を参照しているため、トレーサビリティを確保している
- プロパティテストはfast-checkを使用し、最低100回のイテレーションで実行する
- ユニットテストはVitestを使用する
- フェーズ2（ヘッドレスCMS移行）はタスク2.5のスタブ実装のみ含み、実際の移行は別スペックで対応する
