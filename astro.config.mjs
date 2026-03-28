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
            { label: 'Figmaとは', link: '/getting-started/what-is-figma/' },
            { label: 'インストール方法', link: '/getting-started/installation/' },
            { label: 'アカウント作成とログイン', link: '/getting-started/account-setup/' },
          ],
        },
        {
          label: '基本操作',
          items: [
            { label: '画面構成と各部名称', link: '/basics/ui-overview/' },
            { label: 'ファイルとプロジェクトの管理', link: '/basics/file-management/' },
            { label: 'フレームとレイヤー', link: '/basics/frames-and-layers/' },
            { label: '図形・テキスト・画像の配置', link: '/basics/shapes-text-images/' },
            { label: 'コンポーネントの基本', link: '/basics/components-basics/' },
          ],
        },
        {
          label: '応用操作',
          items: [
            { label: 'オートレイアウト', link: '/advanced/auto-layout/' },
            { label: 'プロトタイプとインタラクション', link: '/advanced/prototypes/' },
            { label: 'チーム共有とコメント', link: '/advanced/team-sharing/' },
            { label: 'プラグインの活用', link: '/advanced/plugins/' },
            { label: 'デザイントークンとスタイル管理', link: '/advanced/design-tokens/' },
          ],
        },
        {
          label: 'リファレンス',
          items: [
            { label: 'ショートカットキー一覧', link: '/reference/shortcuts/' },
            { label: '用語集', link: '/reference/glossary/' },
          ],
        },
      ],
    }),
  ],
});
