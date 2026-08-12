---
name: Document RAG Chatbot
description: Restrained operate-mode UI for uploading a PDF and chatting with it, grounded in cited source chunks.
colors:
  bg: "oklch(0.975 0.004 250)"
  surface: "oklch(1 0 0)"
  surface-sunken: "oklch(0.96 0.006 250)"
  border: "oklch(0.89 0.008 250)"
  border-strong: "oklch(0.78 0.012 250)"
  text: "oklch(0.22 0.015 250)"
  text-secondary: "oklch(0.42 0.015 250)"
  text-muted: "oklch(0.58 0.012 250)"
  accent: "oklch(0.5 0.1 200)"
  accent-hover: "oklch(0.44 0.11 200)"
  accent-active: "oklch(0.39 0.11 200)"
  accent-subtle: "oklch(0.94 0.035 200)"
  accent-text: "oklch(0.34 0.09 200)"
  success: "oklch(0.55 0.13 155)"
  success-subtle: "oklch(0.95 0.045 155)"
  warning: "oklch(0.64 0.15 70)"
  warning-subtle: "oklch(0.95 0.06 80)"
  error: "oklch(0.53 0.19 25)"
  error-subtle: "oklch(0.96 0.045 20)"
typography:
  body:
    fontFamily: "IBM Plex Sans, -apple-system, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  title:
    fontFamily: "IBM Plex Sans, -apple-system, Segoe UI, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 600
    letterSpacing: "-0.01em"
  display:
    fontFamily: "IBM Plex Sans, -apple-system, Segoe UI, sans-serif"
    fontSize: "2.125rem"
    fontWeight: 600
    letterSpacing: "-0.02em"
  label:
    fontFamily: "IBM Plex Sans, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    letterSpacing: "0.03em"
  mono:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.8125rem"
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  full: "999px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "24px"
  6: "32px"
  8: "48px"
  10: "64px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "oklch(0.99 0.005 200)"
    rounded: "{rounded.md}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-primary-active:
    backgroundColor: "{colors.accent-active}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "16px 24px"
---

# Design System: Document RAG Chatbot

## Overview

**Creative North Star: "The Quiet Instrument"**

A single-user tool for interrogating one PDF at a time. The interface has no audience to persuade and no story to tell beyond the document's own text — it exists to get out of the way of upload → embed → ask → cite. Everything is restrained neutral gray-blue with one muted teal accent reserved for actions, current state, and in-progress work; nothing else in the UI competes for attention with the document content or the streamed answer.

There is no incumbent visual identity to preserve — the app shipped with unstyled default HTML — so this is the first committed world, chosen for an Operate surface used daily, not demoed once.

**Key Characteristics:**
- Restrained: neutral surfaces, one accent color, no decorative color
- Data-literate: monospace reserved for chunk indices and similarity scores, never as a "technical" costume
- State-explicit: every document lifecycle state (pending/processing/ready/failed) and every interactive control has a visible default/hover/active/disabled/loading form
- Light only — chosen because this is a real daily working tool used at a desk, not a system-default guess

## Colors

Restrained: one neutral gray-blue scale carries structure, one muted teal accent carries action and state.

### Primary
- **Teal Accent** (`oklch(0.5 0.1 200)`): primary buttons, links, the current-page nav underline, focus rings, and the "processing" status dot. Used sparingly — never as page-filling decoration.

### Neutral
- **Paper** (`oklch(0.975 0.004 250)`): page background.
- **Surface** (`oklch(1 0 0)`): cards, the header bar, the chat input bar.
- **Surface Sunken** (`oklch(0.96 0.006 250)`): the second neutral layer — citation chips, the pending status badge.
- **Border / Border Strong** (`oklch(0.89 0.008 250)` / `oklch(0.78 0.012 250)`): hairline dividers and input strokes respectively.
- **Text / Text Secondary / Text Muted** (`oklch(0.22 0.015 250)` / `oklch(0.42…)` / `oklch(0.58…)`): primary copy, secondary copy (descriptions, meta lines), and the quietest tier (section labels, empty states).

### Named Rules
**The One Accent Rule.** Teal never fills a surface. It marks the thing you can act on (buttons, links) or the thing currently happening (processing state, focus ring) — nothing else.

## Typography

**Body/Display Font:** IBM Plex Sans (with `-apple-system, Segoe UI, sans-serif`)
**Label/Mono Font:** IBM Plex Mono (chunk indices and similarity scores only)

**Character:** One workhorse humanist sans carries headings, labels, buttons, and body — Operate surfaces don't need a display/body pairing. Plex was chosen over a system default because it's a real, distinctive, technically-literate face with a matching mono sibling for the one place this UI shows raw data (citation metadata).

### Hierarchy
- **Display** (600, 2.125rem, -0.02em): page-level `h1` only (home hero, "Documents").
- **Title** (600, 1.375rem, -0.01em): document title in the chat header, status-page heading.
- **Body** (400, 1rem, line-height 1.6): chat messages, hero description. Bubbles cap at 75% width rather than a fixed ch measure.
- **Label** (600, 0.8125rem, 0.03em, uppercase): section labels ("1 DOCUMENT", "SOURCES").
- **Mono** (400, 0.8125rem): chunk index (`#16`) and similarity (`26%`) in citations only.

## Layout

Single-column, max-width containers centered on the page (`44rem` for documents, `48rem` for chat, `32rem` for the home card) — this is a task tool, not a dashboard, so no multi-column grid. The chat page is the one full-height layout: header, scrollable message list, and a bottom input bar composed with flexbox (`flex: 1` + `min-height: 0` on the scroll region) rather than fixed positioning. Spacing runs a 4px-based scale (4/8/12/16/24/32/48/64px); more space above a heading than below it throughout.

## Elevation & Depth

Mostly flat. Cards sit at rest with a 1px border and no shadow; a soft, offset shadow (`--shadow-sm`) appears only as a hover response on clickable document cards, never as decoration on a static element.

### Shadow Vocabulary
- **shadow-sm** (`0 1px 2px oklch(0.22 0.02 250 / 0.06), 0 1px 1px oklch(0.22 0.02 250 / 0.05)`): document card hover.
- **shadow-md** (`0 8px 20px oklch(0.22 0.02 250 / 0.09), 0 2px 6px oklch(0.22 0.02 250 / 0.05)`): reserved for future overlays (none currently ship).

## Shapes

Corners are gently rounded, not sharp and not pill-shaped except for true badges/status pills: `6px` (small controls, citation chips), `10px` (cards, buttons, inputs), `14px` (chat bubbles), `999px` (status badges only). 1px hairline borders throughout; no border-left/border-right decorative accents.

## Components

### Buttons
- **Shape:** 10px radius, no border.
- **Primary:** teal background, white-on-teal text, 12px/20px padding.
- **Hover / Active:** darkens one step each (`accent-hover`, `accent-active`); no transform/scale on hover, a slight `scale(0.98)` on the home CTA's `:active` only.
- **Disabled:** background drops to `border-strong` gray, cursor default — used for Send while the input is empty or a reply is streaming.

### Status Badges
- **Style:** pill (999px), `surface-sunken`/`accent-subtle`/`success-subtle`/`error-subtle` background matched to state, a small solid dot before the label.
- **State:** the `PROCESSING` dot pulses (opacity animation, disabled under `prefers-reduced-motion`); the rest are static.

### Cards / Containers
- **Corner Style:** 10px.
- **Background:** white surface on the paper page background.
- **Shadow Strategy:** flat at rest, `shadow-sm` on hover only when the card is a link (document → chat).
- **Border:** 1px `border`, strengthens to `border-strong` on hover.
- **Internal Padding:** 16px/24px.

### Inputs / Fields
- **Style:** 1px `border-strong` stroke, 10px radius, `bg` fill (slightly recessed from white surfaces around it).
- **Focus:** border shifts to accent + a 3px accent-tinted glow (`box-shadow` ring), not the browser default outline.
- **Disabled:** 0.6 opacity, used while a message is streaming.

### Navigation
- Single top bar: wordmark left, one nav link ("Documents") right, underlined in accent when active. No mobile-specific nav treatment needed at one link.

### Chat Bubbles (signature component)
User messages are solid teal, right-aligned, 75% max width, small corner radius on the near corner (speech-tail cue). Assistant messages are white-bordered, left-aligned, same shape mirrored. A streaming assistant bubble ends in a blinking 2px caret instead of a spinner. Citations render as a stack of compact chips directly under the assistant bubble: mono chunk index, mono similarity percentage, truncated excerpt — never a modal or a collapsed accordion.

## Do's and Don'ts

### Do:
- **Do** keep teal reserved for actions and in-progress/selected state (The One Accent Rule).
- **Do** give every interactive control its hover, focus-visible, active, and disabled form before shipping it.
- **Do** represent document lifecycle state explicitly (badge + copy), never silently.
- **Do** use IBM Plex Mono only for chunk/similarity data, not as a generic "technical" label style.

### Don't:
- **Don't** introduce a second accent color or a gradient; the palette is intentionally one-note.
- **Don't** add a display/serif face for headings — one sans carries the whole hierarchy.
- **Don't** reach for a modal for citations, confirmations, or errors that fit inline.
- **Don't** add dark mode by guessing a system default; if it's wanted, ask which real usage scene (lighting, time of day) should drive it, per the same reasoning that picked light mode here.
