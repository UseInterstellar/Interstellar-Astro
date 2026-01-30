# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interstellar V7 is a web proxy application built with Astro 5, React 19, and Fastify. It provides a multi-tab browser interface that proxies websites through Scramjet with Wisp/Bare-Mux transport layers.

## Commands

```bash
bun dev          # Dev server with hot reload
bun run build    # Type check + production build (runs obfuscation if enabled)
bun start        # Run production Fastify server (port 8080)
bun run preview  # Preview production build
bun run typecheck # Astro strict type checking
bun run check    # Format (Prettier) + lint (Biome)
bun run precommit # Full check: typecheck + format + lint
```

## Architecture

**Frontend:** Astro pages + React components with Tailwind CSS
**Backend:** Fastify server (`index.ts`) handling Wisp WebSocket routing, compression, optional auth
**Proxy:** Scramjet engine with service worker interception at `/sw.js`

### Key Paths

- `src/pages/` - Astro routes (index, tabs, apps, games, settings)
- `src/components/Browser.tsx` - Main React tabbed browser UI
- `src/lib/` - Client utilities (global.ts for theme/panic, tabs.ts for URL encoding)
- `index.ts` - Production Fastify server entry
- `config.ts` - Server port, obfuscation toggle, auth settings
- `src/lib/obfuscate.ts` - Build-time file/route name obfuscation

### Proxy Flow

1. User enters URL in Browser.tsx
2. `encodeProxyUrl()` in `tabs.ts` encodes URL with Scramjet prefix
3. Iframe loads encoded URL through service worker
4. Scramjet service worker proxies the request via Wisp transport

## Configuration

`config.ts` controls runtime behavior:

- `server.port` - HTTP port (default 8080)
- `server.obfuscate` - Enable build-time file name randomization
- `server.compress` - Enable Brotli/Gzip compression
- `auth.challenge` - Enable basic HTTP auth
- `auth.users` - Username/password pairs

## Code Style

- Biome for linting/formatting
- 2-space indentation, LF line endings
- Path alias: `@/` maps to `./src/`
- TypeScript strict mode enabled
