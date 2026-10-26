#!/usr/bin/env node
// Prints the local blocklist comma-joined on one line, for pasting into the
// Vercel env var LEAK_BLOCKLIST_TERMS. Nothing else goes to stdout.
import { loadBlocklist } from './check-leaks.mjs';

try {
  console.log(loadBlocklist(process.env.LEAK_BLOCKLIST ?? '.leak-blocklist').join(','));
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}
