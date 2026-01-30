# Repository Guidelines

## Project Structure & Module Organization

- `src/` holds Astro pages (`src/pages/*.astro`), layouts (`src/layouts/`), UI components (`src/components/`), and client utilities (`src/lib/`).
- `public/` contains static assets and proxy bundles (e.g., `public/sw.js`, `public/assets/bundled/`).
- `index.ts` is the Fastify production server entry; `config.ts` contains runtime configuration.
- `docs/CODEBASE_MAP.md` is the canonical, full codebase map.

## Build, Test, and Development Commands

- `pnpm dev`: start the Astro dev server with HMR for local development.
- `pnpm start`: run the Fastify server via `tsx index.ts` (production-style runtime).
- `pnpm build`: typecheck then build the Astro site (`astro check && astro build`).
- `pnpm preview`: serve the built site locally using Astro preview.
- `pnpm typecheck`: run `astro check` only.
- `pnpm check`: format and lint (`prettier --write .` and `biome check --write .`).
- `pnpm precommit`: full verification (`pnpm typecheck && pnpm check`).

## Coding Style & Naming Conventions

- Language stack: TypeScript, Astro, React, Tailwind.
- Formatting/linting: Prettier + Biome; use `pnpm check`.
- Style defaults: 2-space indentation, LF line endings, TypeScript strict mode.
- Path alias: `@/` maps to `./src/`.
- Use file-based routing in `src/pages/` and PascalCase for components (e.g., `Browser.tsx`).
- Keep client-only logic in `src/lib/` and guard SSR-sensitive code with `typeof window`.

## Testing Guidelines

- No dedicated test framework is configured in this repo.
- Use `pnpm typecheck` and `pnpm build` as baseline verification.
- When adding tests, align with Astro/TypeScript defaults and document new commands here.

## Commit & Pull Request Guidelines

- Recent history mixes short imperative messages (e.g., “Bump deps”) and Conventional Commits from automation (e.g., `chore(deps): ...`).
- Prefer Conventional Commit style for clarity, especially for dependency updates.
- PRs should include a brief description, linked issues where applicable, and screenshots for UI changes.

## Security & Configuration Notes

- Review `SECURITY.md` for reporting guidelines.

## Architecture & Proxy Notes

- Frontend: Astro pages + React components with Tailwind.
- Backend: Fastify server in `index.ts` handling Wisp WebSocket routing, compression, and optional auth.
- Proxy flow: URL encoded in `src/lib/tabs.ts` → iframe load → service worker (`public/sw.js`) → UV + Wisp/Bare-Mux.

## Configuration Notes

- Runtime settings live in `config.ts` (server port, obfuscation, compression, basic auth).
- Build obfuscation uses `randomize.ts` and renames files under `src/components/`, `src/layouts/`, `src/lib/`, `src/pages/`.
- Avoid hardcoding secrets in the repo.
