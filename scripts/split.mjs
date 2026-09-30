import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';

const SOURCE = 'texts/antieconomicstories-text-only.md';
const FRONT_DIR = 'src/content/front';
const STORIES_DIR = 'src/content/stories';
const FRONT_IDS = { 'Foreword to the English edition': 'foreword-english', Foreword: 'foreword' };

const footnotes = {};
const lines = readFileSync(SOURCE, 'utf8')
  .split('\n')
  .filter((line) => {
    const m = line.match(/^\[\^(\d+)\]:\s*(.*)$/);
    if (m) footnotes[m[1]] = m[2].trim();
    return !m;
  });

const cleanTitle = (t) => t.replace(/\s+/g, ' ').trim().replace(/\.$/, '').replace(/\\([[\]])/g, '$1');

const slugify = (t) =>
  t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const withFootnotes = (body) => {
  const refs = [...new Set([...body.matchAll(/\[\^(\d+)\](?!:)/g)].map((m) => m[1]))];
  const defs = refs.map((n) => `[^${n}]: ${footnotes[n]}`).join('\n\n');
  return body.trim() + (defs ? `\n\n${defs}` : '') + '\n';
};

const write = (path, data, body) => {
  const fm = Object.entries(data).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join('\n');
  writeFileSync(path, `---\n${fm}\n---\n\n${withFootnotes(body)}`);
};

const sections = [];
for (const line of lines) {
  const h1 = line.match(/^# (.*)$/);
  if (h1) sections.push({ title: cleanTitle(h1[1]), lines: [] });
  else sections.at(-1).lines.push(line);
}

for (const dir of [FRONT_DIR, STORIES_DIR]) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
}

let order = 0;
for (const { title, lines: body } of sections) {
  if (title === 'The Stories') {
    const stories = [];
    for (const line of body) {
      const h = line.match(/^(\d+)\.\s+##\s+(.*)$/);
      if (h) stories.push({ number: Number(h[1]), title: cleanTitle(h[2]), lines: [] });
      else stories.at(-1)?.lines.push(line);
    }
    for (const s of stories) {
      const plain = s.title.replace(/\*/g, '');
      write(`${STORIES_DIR}/${String(s.number).padStart(3, '0')}-${slugify(plain)}.md`,
        { number: s.number, title: s.title }, s.lines.join('\n'));
    }
    console.log(`${stories.length} stories`);
  } else {
    const id = FRONT_IDS[title] ?? slugify(title.split('.')[0]);
    write(`${FRONT_DIR}/${id}.md`, { title, order: order++ }, body.join('\n'));
    console.log(`front: ${id}`);
  }
}
