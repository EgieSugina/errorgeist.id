# errorgeist.id

Portfolio of Egie Sugina, presented as a "Top Secret Dossier". Live at https://errorgeist.id/.

A static single-page site built with React 19, StyleX, motion and three.js on Vite. No backend.

## Scripts

| Command          | What it does                                             |
| ---------------- | -------------------------------------------------------- |
| `pnpm dev`       | Start the Vite dev server                                |
| `pnpm test`      | Run the unit tests (Vitest)                              |
| `pnpm typecheck` | Type-check the project (`tsc --noEmit`)                  |
| `pnpm build`     | Type-check, build to `dist/`, then run the leak check    |
| `pnpm e2e`       | Run the Playwright end-to-end tests against `dist/`      |

## Leak check

`pnpm build` ends with a fail-closed scan of `dist/` against a private blocklist of terms that must never ship. The blocklist is kept out of git. It is read from the git-ignored `.leak-blocklist` file or, when set, from the `LEAK_BLOCKLIST_TERMS` environment variable (one term per line or comma-separated). The build fails on any match, on any source map, and if the blocklist is missing or empty.

## Deploy to Vercel

1. Import the repository in Vercel. The framework, install, build and output settings are picked up from `vercel.json`.
2. Run `pnpm blocklist:env` locally and set its output as the `LEAK_BLOCKLIST_TERMS` environment variable for both Production and Preview. Without it the build fails by design.
3. Under Project, Domains, add `errorgeist.id` and `www.errorgeist.id` (set the `www` entry to redirect to the apex domain), then point DNS as Vercel instructs.
