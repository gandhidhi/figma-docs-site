import { defineType, defineField } from 'sanity';

export const docPage = defineType({
  name: 'docPage',
  title: 'ドキュメントページ',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'タイトル',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: '概要',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'スラッグ',
      type: 'slug',
      options: { source: 'title' },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'カテゴリ',
      type: 'string',
      options: {
        list: [
          { title: 'はじめに', value: 'getting-started' },
          { title: '基本操作', value: 'basics' },
          { title: '応用操作', value: 'advanced' },
          { title: 'リファレンス', value: 'reference' },
        ],
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: '表示順',
      type: 'number',
    }),
    defineField({
      name: 'body',
      title: '本文',
      type: 'array',
      of: [{ type: 'block' }],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
    },
  },
});
