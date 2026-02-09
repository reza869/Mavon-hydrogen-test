# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Shopify Hydrogen storefront using React Router v7 (NOT Remix). Hydrogen is Shopify's headless commerce framework for building custom storefronts.

## Commands

```bash
npm run dev        # Start dev server with hot reload and codegen
npm run build      # Production build with codegen
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run typecheck  # TypeScript check + React Router type generation
npm run codegen    # Generate GraphQL and React Router types
```

## Critical: React Router Imports

**This project uses React Router v7, NOT Remix.** When adapting Remix documentation or examples:

| Instead of (Remix)          | Use (React Router)              |
|-----------------------------|--------------------------------|
| `@remix-run/react`          | `react-router`                 |
| `@remix-run/dev`            | `@react-router/dev`            |
| `@remix-run/fs-routes`      | `@react-router/fs-routes`      |
| `@remix-run/node`           | `@react-router/node`           |
| `@remix-run/server-runtime` | `react-router`                 |

**NEVER use `react-router-dom` imports** - use `react-router` directly.

```typescript
// WRONG
import { useLoaderData } from '@remix-run/react';
import { Link } from 'react-router-dom';

// CORRECT
import { useLoaderData, Link } from 'react-router';
```

## Architecture

### Directory Structure
- `app/routes/` - File-based routing with React Router
- `app/components/` - Reusable React components
- `app/graphql/` - GraphQL queries for Customer Account API
- `app/lib/` - Utilities (context, fragments, session, i18n)
- `app/styles/` - CSS (Tailwind CSS 4.x)

### Routing Conventions
- `($locale)` - Optional locale prefix parameter
- `$handle` - Dynamic segments (product handle, collection handle)
- `_index` - Index routes
- `$.tsx` - Catch-all/splat routes
- `[file.ext].tsx` - Literal file routes (robots.txt, sitemap.xml)
- `account_` - Pathless layout escape (login/logout outside account layout)

### Key Files
- `app/root.tsx` - Root layout with providers
- `app/entry.server.tsx` - Server-side rendering entry
- `app/entry.client.tsx` - Client-side hydration entry
- `app/lib/context.ts` - Hydrogen router context setup
- `app/lib/fragments.ts` - Reusable GraphQL fragments
- `server.ts` - Oxygen worker entry point

### Path Alias
`~/*` maps to `app/*` (configured in tsconfig.json)

## GraphQL

Types are auto-generated from Shopify schemas. Run `npm run codegen` after modifying queries. GraphQL config is in `.graphqlrc.ts`.

## Deployment

Runs on Shopify Oxygen (Cloudflare Workers). Local dev uses `@shopify/mini-oxygen`.
