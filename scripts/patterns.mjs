/*
 * The patterns (docs/PATTERNS.md) against this theme as it's being changed: runs marccent-patterns' check with
 * --theme pointing here, so a class or component a pattern uses can't be removed without the patterns noticing. The
 * patterns' markup and the check itself live in marccent-patterns (projects.json's path); without a checkout it's
 * skipped and said so, as the conformance check does for an adapter.
 *
 *   node scripts/patterns.mjs
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = new URL('..', import.meta.url).pathname;
const { projects } = JSON.parse(readFileSync(join(ROOT, 'docs', 'projects.json'), 'utf8'));
const repo = resolve(ROOT, '..', projects.find((p) => p.repo === 'marccent-patterns').path);
const check = join(repo, 'scripts', 'patterns.mjs');
if (!existsSync(check)) {
  console.log(`skip patterns: no marccent-patterns checkout at ${repo}`);
  process.exit(0);
}
const run = spawnSync(process.execPath, [ check, '--theme', ROOT ], { stdio: 'inherit' });
process.exit(run.status ?? 1);
