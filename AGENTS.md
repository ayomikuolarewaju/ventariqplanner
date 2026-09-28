# Ventariq AI agent guide

This repository is a Next.js 16 App Router app using React 19 and Supabase. It does not follow the older Next.js conventions that many training examples assume.

## Critical rules

- Read the relevant documentation in `node_modules/next/dist/docs/` before writing or changing app routing, metadata, server/client boundaries, or async page patterns.
- Treat this project as a modern App Router app, not a legacy Pages Router app.
- Keep server-only logic on the server and client-only UI behind `"use client"`.
- Do not use the plain Supabase client for auth flows that must read the server session or cookies.

## Project structure

- App routes live under `app/`.
- Reusable UI lives under `components/`.
- Shared data access helpers live under `lib/`.
- Admin work is concentrated under `app/admin/` and uses server-side Supabase access.

## Supabase conventions

- Use `lib/supabase.ts` for browser-side client usage in client components.
- Use `lib/supabase-server.ts` in server components and route handlers that need the current authenticated user/session.
- Use `lib/supabase-admin.ts` only for privileged server-side admin/service-role operations.
- Do not replace the browser client with `@supabase/supabase-js` in client code or the server/client session wrappers with a plain client where cookies are needed.
- Past auth bugs were caused by mixing the wrong Supabase client type with server-side session handling; preserve the existing split.

## Commands

- Install dependencies: `npm install`
- Start local dev server: `npm run dev`
- Production build: `npm run build`
- Lint: `npm run lint`

## Working style for this repo

- Prefer existing patterns used by the admin and checkout features instead of inventing new architecture.
- Server components should fetch data close to the page and pass minimal data to presentational components.
- If a feature needs auth or admin access, follow the server-client boundary used in `app/admin/*` and `app/api/*`.
- For public pages, keep metadata generation and route handlers aligned with the App Router patterns already used in `app/events/[slug]/page.tsx` and related files.
- When adding or editing data access code, preserve the distinction between public browsing and authenticated admin flows.

## Guardrails

- Do not assume Next.js 15/16 APIs match older examples from memory.
- Do not add browser-only auth logic that depends on localStorage when a server-side session is required.
- Keep changes small, targeted, and consistent with the project’s existing Supabase and App Router patterns.

This file is intentionally brief; for deeper implementation details, inspect the relevant route, component, and Supabase helper before changing behavior.
