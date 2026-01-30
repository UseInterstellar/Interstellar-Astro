# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interstellar V6 is a web proxy application built with Astro 5, React 19, and Fastify. It provides a multi-tab browser interface that proxies websites through Ultraviolet (UV) with Wisp/Bare-Mux transport layers.

## Commands

```bash
pnpm dev          # Dev server with hot reload
pnpm build        # Type check + production build (runs obfuscation if enabled)
pnpm start        # Run production Fastify server (port 8080)
pnpm preview      # Preview production build
pnpm typecheck    # Astro strict type checking
pnpm check        # Format (Prettier) + lint (Biome)
pnpm precommit    # Full check: typecheck + format + lint
```

## Architecture

**Frontend:** Astro pages + React components with Tailwind CSS
**Backend:** Fastify server (`index.ts`) handling Wisp WebSocket routing, compression, optional auth
**Proxy:** Ultraviolet engine with service worker interception at `/sw.js`

### Key Paths

- `src/pages/` - Astro routes (index, tabs, apps, games, settings)
- `src/components/Browser.tsx` - Main React tabbed browser UI
- `src/lib/` - Client utilities (global.ts for theme/panic, tabs.ts for URL encoding)
- `index.ts` - Production Fastify server entry
- `config.ts` - Server port, obfuscation toggle, auth settings
- `randomize.ts` - Build-time file/route name obfuscation

### Proxy Flow

1. User enters URL in Browser.tsx
2. `encodeProxyUrl()` in `tabs.ts` encodes URL with UV prefix
3. Iframe loads encoded URL through service worker
4. UV service worker proxies the request via Wisp transport

### URL Encoding

```typescript
// tabs.ts
encodeProxyUrl(url) → UV prefix + xor-encoded URL
decodeProxyUrl(path) → original URL from encoded path
```

## Configuration

`config.ts` controls runtime behavior:

- `server.port` - HTTP port (default 8080)
- `server.obfuscate` - Enable build-time file name randomization
- `server.compress` - Enable Brotli/Gzip compression
- `auth.challenge` - Enable basic HTTP auth
- `auth.users` - Username/password pairs

## Code Style

- Biome for linting/formatting (replaces ESLint + Prettier)
- 2-space indentation, LF line endings
- Path alias: `@/` maps to `./src/`
- TypeScript strict mode enabled

## Build Obfuscation

When `config.server.obfuscate` is true, `randomize.ts` renames files in `src/components/`, `src/layouts/`, `src/lib/`, `src/pages/` with randomized names during build.

## Detailed Architecture

For comprehensive module documentation, data flows, and navigation guides, see [docs/CODEBASE_MAP.md](docs/CODEBASE_MAP.md).
