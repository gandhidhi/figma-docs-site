import { defineCollection } from 'astro:content';
import { docsSchema } from '@astrojs/starlight/schema';
import { sanityDocsLoader } from '../lib/sanity-loader';

const useSanity = !!process.env.SANITY_PROJECT_ID;

export const collections = {
  docs: useSanity
    ? defineCollection({
        loader: sanityDocsLoader(),
        schema: docsSchema(),
      })
    : defineCollection({
        schema: docsSchema(),
      }),
};
