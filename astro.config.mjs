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
