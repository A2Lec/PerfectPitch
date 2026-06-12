# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PerfectPitch is a PWA for absolute pitch training. Two modes: **Sing** (user sings a displayed note, app detects pitch and scores) and **Listen** (app plays a note, user identifies it). All data stored in localStorage, no backend. Deployed on Vercel.

## Commands

- `npm run dev` — Start dev server (Next.js 16 + Turbopack, http://localhost:3000)
- `npm run build` — Production build
- `npm run start` — Serve production build
- `npm run lint` — ESLint

## Architecture

**Framework:** Next.js 16 (App Router, all pages are `"use client"` — pure SPA behavior)
**Styling:** Tailwind CSS 4 via `@tailwindcss/postcss`. Design tokens in CSS variables in `globals.css`.
**Animations:** Framer Motion
**Charts:** Recharts (progress page)

### Key modules in `src/lib/`

- `audio/notes.ts` — Note definitions, MIDI↔frequency conversion, random note generation. Notes use French names (Do, Ré, Mi...).
- `audio/synth.ts` — Web Audio API synthesis with harmonics (`playNoteWithTimbre`).
- `audio/pitch-detector.ts` — Real-time pitch detection from microphone using autocorrelation.
- `scoring/score.ts` — Scoring logic. **Important:** scoring is octave-agnostic — only the note name matters, not the octave sung. Uses cents offset normalized to the same octave.
- `storage.ts` — localStorage persistence for progress history (last 30 days).
- `notifications/push.ts` — Push notification scheduling via Service Worker (production only).

### PWA

- `public/manifest.json` — PWA manifest
- `public/sw.js` — Service worker (cache-first strategy + periodic sync for daily reminders)
- `src/app/sw-register.tsx` — Registers SW only in production (`process.env.NODE_ENV === "production"`)

## Known Issues

- **Dev on OneDrive paths:** Turbopack has issues with long/special paths. The `turbopack.root` in `next.config.ts` with `path.resolve(__dirname)` mitigates this. If dev server hangs, clear `.next/` and restart.
- **First load in dev:** May require a hard refresh (Ctrl+Shift+R) after Turbopack compiles.

## Design Conventions

- Mobile-first, max-width 448px (`max-w-md`), French UI text
- Color palette: `--primary` (blue #1a73e8), `--accent` (green #34a853), white surfaces
- All pages use the `Header` component for navigation
- Utility classes `.card`, `.btn-primary`, `.btn-secondary` defined in `globals.css`
