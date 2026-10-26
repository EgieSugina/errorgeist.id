# errorgeist.id

Portfolio of Egie Sugina, presented as a "Top Secret Dossier". Deployed to https://errorgeist.id/ (once the Vercel project and domain are configured).

A static single-page site built with React 19, StyleX, motion and three.js on Vite. No backend.

## Prerequisites

- Node.js 20 or newer.
- Run `corepack enable` once so the pinned pnpm version (12.6.0, from `packageManager` in `package.json`) is used.

## Scripts

| Command          | What it does                                             |
| ---------------- | -------------------------------------------------------- |
| `pnpm dev`       | Start the Vite dev server                                |
| `pnpm test`      | Run the unit tests (Vitest); needs the leak blocklist    |
| `pnpm typecheck` | Type-check the project (`tsc --noEmit`)                  |
| `pnpm build`     | Type-check, build to `dist/`, then run the leak check    |
| `pnpm e2e`       | Run the Playwright end-to-end tests against `dist/`      |
| `pnpm leak:tree` | Scan tracked files, their paths and unpushed commit messages for blocklisted terms |

## Leak check

`pnpm build` ends with a fail-closed scan of `dist/` against a private blocklist of terms that must never ship. The blocklist is kept out of git. It is read from the git-ignored `.leak-blocklist` file or, when set, from the `LEAK_BLOCKLIST_TERMS` environment variable (one term per line or comma-separated). The build fails on any match, on any source map, and if the blocklist is missing or empty. File paths count as matches too.

`pnpm test` needs the same blocklist (the file or `LEAK_BLOCKLIST_TERMS`): the content tests check every bilingual string against it and fail, rather than skip, when neither is present.

`pnpm leak:tree` applies the same check to the source tree: the path and contents of every tracked file, plus the commit messages not yet pushed (all of them when the branch has no upstream). `pnpm install` sets `core.hooksPath` to `.githooks`, whose `pre-push` hook runs this check and blocks the push on any hit.

## Deploy to Vercel

1. Import the repository in Vercel. The framework, install, build and output settings are picked up from `vercel.json`.
2. Under Project, Settings, Environment Variables (the dashboard, not `vercel.json`), set `ENABLE_EXPERIMENTAL_COREPACK=1` for both Production and Preview. It is required for Vercel to use pnpm 12.6.0 from `packageManager`; without it Vercel ignores that field and picks its own pnpm, which cannot install from this lockfile.
3. Set `LEAK_BLOCKLIST_TERMS` for both Production and Preview to the blocklist, comma-separated on one line. Print exactly that line with `node scripts/print-blocklist-env.mjs` (or `pnpm blocklist:env 2>/dev/null`; plain `pnpm blocklist:env` also prints a `$ node ...` banner on stderr, which must not be copied). This value is private: paste it only into the Vercel dashboard, never into issues, chats or CI logs. Without it the build fails by design.
4. Under Project, Domains, add `errorgeist.id` and `www.errorgeist.id` (set the `www` entry to redirect to the apex domain), then point DNS as Vercel instructs.
