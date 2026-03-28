# セッションメモ

## プロジェクト概要

Figmaの使い方を解説するドキュメントサイト。
Astro + Starlightで構築し、フェーズ2でSanity CMSへ移行する計画。

---

## 現在の状態（フェーズ1完了）

- Astro + Starlightのプロジェクト初期構成済み
- 全16ページのMDXコンテンツ作成済み
- コンテンツアダプター層（IContentAdapter / LocalMDXAdapter / HeadlessCMSAdapter）実装済み
- Vitestテスト20件全通過
- GitHubリポジトリ: https://github.com/gandhidhi/figma-docs-site
- トップページ（index.mdx）追加済み、動作確認完了

---

## フェーズ2: Sanity連携（未着手）

### 決定事項
- ヘッドレスCMS: **Sanity**（microCMS・Contentful・Storyblokと比較検討の上決定）
- Sanity MCPサーバー（mcp.sanity.io）をKiroに設定済み → `.kiro/settings/mcp.json`
- Sanityアカウント登録済み、APIトークン取得済み

### 環境変数（.envに設定済み）
- `SANITY_PROJECT_ID` = g35v6oh8
- `SANITY_DATASET` = production
- `SANITY_API_TOKEN` = Viewer権限トークン（Astroビルド用）
- `SANITY_MCP_TOKEN` = Developer権限トークン（Kiro MCP操作用）

### 完了済み（フェーズ2）
1. ✅ Sanityスキーマ定義（`sanity/schemaTypes/docPage.ts`）
2. ✅ Sanity Studioのセットアップ（`sanity/sanity.config.ts`）
3. ✅ 既存MDXコンテンツをSanityにインポート（`scripts/import-to-sanity.mjs`、15件）
4. ✅ `SanityAdapter` の実装（`src/adapters/sanity.ts`）
5. ✅ Astro Content Loaderでの切り替えロジック（`src/lib/sanity-loader.ts`）
6. ✅ ビルド・動作確認完了

### 次にやること（あれば）
- Sanity Studioのデプロイ（`npx sanity deploy`）
- Vercel / Netlifyへの本番デプロイ（環境変数の設定）
- README.mdの整備（MCP設定手順など）

### 設計書の参照先
- アダプターインターフェース: `design.md` → コンポーネントとインターフェース
- Sanityスキーマ定義例: `design.md` → Sanityスキーマ定義
- SanityAdapter実装例: `design.md` → SanityAdapter
- MCP設定例: `design.md` → Sanity MCPサーバー設定

---

## 技術的メモ

### zod互換性問題（解決済み）
Astro 5 + Starlight 0.32 で zod v4 が混入してビルドエラーが発生。
`package.json` で `"zod": "3.25.76"` に固定して解決。

### Sanity APIトークン権限
- Viewer: 公開コンテンツ読み取りのみ → ビルド用
- Developer: コンテンツ読み書き + スキーマ操作 → MCP用
- Editor: コンテンツ読み書きのみ（スキーマ操作不可）
- Administrator: 全権限

### Sanity MCP設定
`.kiro/settings/mcp.json` に設定済み、接続確認済み。
- 正しいURL: `https://mcp.sanity.io`（`/sse` は不要）
- type: `http`、AuthorizationヘッダーにDeveloperトークンを設定
- 接続できない場合はコマンドパレット「MCP: Reconnect」を実行
