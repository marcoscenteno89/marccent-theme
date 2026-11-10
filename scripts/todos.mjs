/*
 * npm run todos: the work lists' check (PRODUCT-LINE.md section 8).
 *
 * Reads docs/TICKETS.md and every project's list in docs/todo/<repo>.md, and fails when a list breaks the rules:
 * sections missing, out of order or extra; the rules line missing; an item not in the item shape or without its
 * found date (anywhere in the item); a Waiting on line without a ticket ID or linking one that isn't open; an open ticket naming a project
 * whose list doesn't link it. A project without a list yet is skipped (said so).
 *
 *   node scripts/todos.mjs
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LISTS = join(ROOT, 'docs', 'todo');

// Every project with a list (docs/todo/<repo>.md): its repo and the names TICKETS.md's Who
// column calls it by. A new project is one more entry.
const PROJECTS = [
  { repo: 'marccent-blocks', names: ['Marccent Blocks', 'marccent-blocks'] },
  { repo: 'marccent-content', names: ['Marccent Content', 'marccent-content'] },
  { repo: 'marccent-local', names: ['Marccent Local', 'marccent-local'] },
  { repo: 'marccent-wp', names: ['Marccent WP', 'marccent-wp'] },
  { repo: 'django-marccent', names: ['django-marccent'] },
  { repo: 'marccent', names: ['marccent/next', 'marccent.com'] },
  { repo: 'marccent-html', names: ['marccent-html'] },
];

const SECTIONS = ['Bugs', 'Requests', 'Waiting on', 'After 1.0', 'Notes'];
const RULES_LINK = 'PRODUCT-LINE.md#8-work-lists-ticketsmd-and-each-projects-todomd';
const ITEM = /^- \[( |x)\] \*\*.+?\*\*/;
const FOUND = /\(found \d{4}-\d{2}-\d{2}\)/;
const TICKET = /\b([TBP]-\d{3})\b/;

let failures = 0;
const fail = (where, message) => {
  failures++;
  console.log(`FAIL ${where}: ${message}`);
};

// TICKETS.md: the open tickets (the tables before "## Done") and who each names.
const tickets = readFileSync(join(ROOT, 'docs', 'TICKETS.md'), 'utf8');
const open = new Map();
for (const line of tickets.split('## Done')[0].split('\n')) {
  const cells = line.split('|').map((c) => c.trim());
  if (cells.length > 3 && /^[TBP]-\d{3}$/.test(cells[1])) open.set(cells[1], cells[2]);
}

for (const project of PROJECTS) {
  const file = join(LISTS, `${project.repo}.md`);
  if (!existsSync(file)) {
    console.log(`skip ${project.repo}: no docs/todo/${project.repo}.md yet`);
    continue;
  }
  const where = `docs/todo/${project.repo}.md`;
  const before = failures;
  const text = readFileSync(file, 'utf8');
  const lines = text.split('\n');

  if (!/^# To do: \S/.test(lines[0])) fail(where, 'its first line is "# To do: <project>"');
  if (!text.includes(`**Belongs to: ${project.repo}.**`)) fail(where, `the line "**Belongs to: ${project.repo}.**" is missing`);
  if (!text.includes(RULES_LINK)) fail(where, `the rules line linking ${RULES_LINK} is missing`);

  const headings = lines.filter((l) => l.startsWith('## ')).map((l) => l.slice(3).trim());
  if (headings.join('|') !== SECTIONS.join('|')) {
    fail(where, `sections are [${headings.join(', ')}], must be exactly [${SECTIONS.join(', ')}]`);
  }
  if (lines.some((l) => /^#{3,} /.test(l))) fail(where, 'no headings inside a section');

  let section = null;
  const linked = new Set();
  lines.forEach((line, i) => {
    if (line.startsWith('## ')) return void (section = line.slice(3).trim());
    if (!section || !line.startsWith('- ')) return; // indented details, blank lines, the intro
    const at = `${where}:${i + 1}`;
    if (section === 'Notes') {
      if (/^- \[[ x]\]/.test(line)) fail(at, 'Notes have no checkboxes: decided work is an item in Bugs, Requests or After 1.0');
      return;
    }
    if (!ITEM.test(line)) return void fail(at, 'an item is "- [ ] **What** — details (found YYYY-MM-DD)"');
    // The item with its indented lines: the found date can close any of them.
    let item = line;
    for (let j = i + 1; j < lines.length && /^\s+\S/.test(lines[j]); j++) item += ' ' + lines[j].trim();
    if (!FOUND.test(item)) fail(at, 'no (found YYYY-MM-DD) in the item');
    if (section === 'Waiting on') {
      const id = line.match(/^- \[[ x]\] \*\*\[?([TBP]-\d{3})/)?.[1];
      if (!id) return void fail(at, 'a Waiting on line starts with the ticket\'s ID, linked: **[T-000](…)**');
      if (!open.has(id)) fail(at, `${id} isn't open in TICKETS.md: it shipped (delete this line and its stopgap) or doesn't exist`);
      linked.add(id);
    } else if (TICKET.test(line) && section !== 'After 1.0') {
      // A ticket mentioned in Bugs or Requests: the work is the ticket's, so it belongs under Waiting on.
      const id = line.match(TICKET)[1];
      if (open.has(id)) fail(at, `mentions ${id}: work waiting on a ticket is a Waiting on line, not a ${section} item`);
    }
  });

  for (const [id, who] of open) {
    if (project.names.some((n) => who.includes(n)) && !linked.has(id)) {
      fail(where, `${id} names this project (${who}) but has no Waiting on line here`);
    }
  }
  if (failures === before) console.log(`ok   ${where}: ${linked.size} tickets linked`);
}

if (failures) {
  console.log(`\n${failures} problem(s). The rules: PRODUCT-LINE.md section 8.`);
  process.exit(1);
}
console.log('\nEvery work list follows PRODUCT-LINE.md section 8.');
