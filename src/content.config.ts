import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const front = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/front' }),
  schema: z.object({ title: z.string(), order: z.number() }),
});

const stories = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/stories' }),
  schema: z.object({ number: z.number(), title: z.string() }),
});

export const collections = { front, stories };
