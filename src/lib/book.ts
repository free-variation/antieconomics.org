import { getCollection } from 'astro:content';

export const BOOK_TITLE = 'Antieconomic Stories';
export const AUTHOR = 'Carlos Taibo';

export const titleHtml = (title: string) => title.replace(/\*(.+?)\*/g, '<em>$1</em>');
export const titleText = (title: string) => title.replace(/\*/g, '');

export const getStories = async () =>
  (await getCollection('stories')).sort((a, b) => a.data.number - b.data.number);
