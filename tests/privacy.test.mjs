import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const TEXT_EXTENSIONS = new Set(['.html', '.js', '.mjs', '.md', '.xml', '.txt', '.css']);

function textFiles(dir = ROOT) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === '.superpowers') continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...textFiles(path));
    else if (TEXT_EXTENSIONS.has(extname(entry.name)) && relative(ROOT, path) !== 'tests/privacy.test.mjs') files.push(path);
  }
  return files;
}

test('repository text contains no private phone-number-shaped values or referee email markers', () => {
  const phone = /(?<!\d)(?:\+44\s?(?:\(0\)\s?)?|0)(?:\d[\s-]?){9,10}(?!\d)/g;
  const email = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
  const allowedEmails = new Set(['glynn.williams@me.com', 'your-email@example.com']);
  for (const path of textFiles()) {
    const text = readFileSync(path, 'utf8');
    assert.equal(phone.test(text), false, `phone-shaped private value in ${relative(ROOT, path)}`);
    phone.lastIndex = 0;
    for (const match of text.matchAll(email)) {
      assert.equal(allowedEmails.has(match[0].toLowerCase()), true, `unapproved email address in ${relative(ROOT, path)}`);
    }
  }
});
