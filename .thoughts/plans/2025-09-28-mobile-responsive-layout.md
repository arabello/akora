# Mobile Responsive Layout Implementation Plan

## Overview

Implement a mobile-friendly version of Night Focus with clearly separated layouts for web and mobile while reusing existing components. On mobile, prioritize the search bar (top) and the current tracks list, hide auxiliary UI (sources list, menu items, instructions) by default, and show the sounds list as an overlay when the user focuses or types in search.

## Current State Analysis

- Mobile is currently blocked via `isMobile` with a banner: `src/App.tsx:75-85`, `312-324`.
- Desktop layout is a 3-column structure using `Columns`:
  - Left: Title, menu items, `SearchBar`, sources (`src/App.tsx:345-401`).
  - Center: Tracks list using `TrackControls` + `ProgressBarCard` (`src/App.tsx:404-416`, `242-282`).
  - Right: Instructions text (`src/App.tsx:417-462`).
- Shared logic/components available and to be reused:
  - Search/filtering: `searchQuery`, `search()`, `sources` (`src/App.tsx:124-129`, `src/sources.ts`).
  - Tracks/mixer: `useMixer`, `TrackControls`, `ProgressBarCard` (`src/mixer.ts`, `src/components`).
  - Focus/keyboard: `useFocus`, `useKeyBinding`, `KB` (`src/useFocus.ts`, `src/keybinding/`).
  - Overlay: `Overlay` (`src/components/Overlay`).
- Tooling: `pnpm build`, `pnpm check` (Prettier), `pnpm dev`, `pnpm preview` (`package.json`).

## Desired End State

- The app supports mobile viewports without UA sniffing.
- On mobile:
  - Top `SearchBar` visible at all times.
  - Current tracks list shown below the search.
  - Sources list + instructions + menu items hidden by default.
  - Sounds (sources) appear as a full-screen overlay when search is focused or contains a query.
- Desktop behavior remains unchanged.
- Codebase structured with distinct `WebLayout` and `MobileLayout`, with shared rendering helpers.

### Key Discoveries
- `isMobile` is UA-based and currently prevents mobile usage (`src/App.tsx:75-85`, `312-324`).
- Reusable pieces exist for tracks and sources rendering (`src/App.tsx:212-241`, `242-282`).
- Instructions are purely presentational and can be excluded on mobile (`src/App.tsx:417-462`).

## What We’re NOT Doing

- Not introducing a new CSS framework or design system.
- Not changing audio/mixer behavior or persistence logic.
- Not adding an E2E test suite in this pass.
- Not altering desktop layout beyond refactoring extraction.

## Implementation Approach

- Introduce a responsive hook using `window.matchMedia('(max-width: 768px)')` with SSR-safe guards to prefer CSS-like breakpoints over UA detection.
- Extract current desktop JSX into `WebLayout`.
- Build `MobileLayout` with search and tracks only; overlay the sources when searching.
- Factor shared rendering for sources/tracks to avoid duplication.
- Remove `isMobile`-based blocking; rely on layout selection.

## Phase 1: Layout Separation

### Overview
Create responsive layout selector and extract existing desktop UI.

### Changes Required

1. Folder and files
   - File: `src/layouts/useResponsiveLayout.ts`
     - Create hook that returns `{ isMobile }` based on `matchMedia('(max-width: 768px)')` and listens to changes; SSR-safe.
   - File: `src/layouts/WebLayout.tsx`
     - Extract current desktop branch (from `src/App.tsx` non-mobile return) into a component `<WebLayout ...props />` that accepts needed props/state.
   - File: `src/layouts/MobileLayout.tsx`
     - Create a placeholder that will render search + tracks (implemented in Phase 2).
2. Update App
   - File: `src/App.tsx`
     - Remove UA-based `isMobile` guard/banners.
     - Use `useResponsiveLayout()` to choose between `<WebLayout ... />` and `<MobileLayout ... />`.
     - Lift state/handlers as needed (search, mixer, focus) and pass down as props.

### Success Criteria

#### Automated Verification
- [x] Build succeeds: `pnpm build`
- [x] Prettier check passes: `pnpm check`

#### Manual Verification
- [ ] Desktop renders identical 3-column UI.
- [ ] Mobile viewport (<=768px) renders `MobileLayout` scaffold without errors.

---

## Phase 2: Mobile Layout (Search + Tracks)

### Overview
Render search on top and current tracks list below. Hide menus and instructions.

### Changes Required

- File: `src/layouts/MobileLayout.tsx`
  - Render:
    - `SearchBar` at top, wired to `searchQuery`/`setSearchQuery`.
    - Tracks list using existing `TrackControls` + `ProgressBarCard` (reuse render function from Phase 4 extraction).
  - Exclude About/Shortcuts/Mute and right-column instructions.
  - Ensure touch interactions for controls work (no hover dependency).

### Success Criteria

#### Automated Verification
- [x] Build succeeds: `pnpm build`
- [x] Prettier check passes: `pnpm check`

#### Manual Verification
- [ ] Search bar visible and functional at the top on mobile.
- [ ] Tracks list shows active tracks with volume controls.
- [ ] Menu items and instructions are not displayed by default on mobile.

---

## Phase 3: Mobile Search Overlay (Sounds)

### Overview
Show sounds (sources) overlay when search is focused or has a query.

### Changes Required

- File: `src/layouts/MobileLayout.tsx`
  - Maintain internal `isOverlayOpen` derived from focus/`searchQuery !== ''`.
  - Render a full-screen overlay (reuse `Overlay` or custom) containing sources list.
  - Tap on a source → `mixer.load()` then close overlay.
  - Provide clear/close button and backdrop tap to dismiss; disable background scroll.
  - Reuse `ListItem` for visual consistency; avoid desktop-only hover cues.

### Success Criteria

#### Automated Verification
- [x] Build succeeds: `pnpm build`

#### Manual Verification
- [ ] Focusing/typing in search opens overlay with sources.
- [ ] Selecting a source loads it and closes the overlay.
- [ ] Overlay blocks background interaction and is scrollable.

---

## Phase 4: Shared Rendering & Polish

### Overview
Reduce duplication and finalize behavior.

### Changes Required

- File: `src/components/renderSources.tsx` (or `src/components/SourcesList.tsx`)
  - Export a component or function to render the sources list given `filteredSources`, `onSelect`, and focus utilities.
- File: `src/components/renderTracks.tsx` (or `src/components/TracksList.tsx`)
  - Export a component or function to render the tracks list given `tracks`, `mixer`, and focus utilities.
- File: `src/App.tsx`
  - Replace UA-based `isMobile` with `useResponsiveLayout()` usage.
- General
  - Ensure no regressions in desktop interactions and focus paths.

### Success Criteria

#### Automated Verification
- [ ] Build succeeds: `pnpm build`
- [ ] Prettier check passes: `pnpm check`

#### Manual Verification
- [ ] Desktop behavior unchanged.
- [ ] Mobile overlay is smooth and responsive.

---

## Phase 5: Testing Strategy & Verification

### Unit/Type/Build
- Type safety via TypeScript; rely on `vite` build.
- Formatting via Prettier.

### Manual Testing Steps
1. Desktop
   - Verify 3-column layout and interactions remain unchanged.
2. Mobile (iOS Safari, Android Chrome)
   - Search bar visible at top.
   - Tracks list renders and volume/remove controls work with touch.
   - Focusing/typing in search opens overlay with sources.
   - Selecting a source loads it and closes overlay.
   - Overlay prevents background interaction and scrolls correctly.
3. Persistence
   - Reload page; loaded tracks persist; overlay is closed initially.

---

## Performance Considerations
- Overlay list should be virtualized only if needed; initial pass can rely on native scrolling given typical list sizes.
- Avoid unnecessary re-renders by memoizing render lists.

## Migration Notes
- Remove UA-based `isMobile` and banner path once mobile layout is in place.
- No data migrations required.

## References
- Desktop layout references: `src/App.tsx:345-401`, `404-416`, `417-462`.
- Sources/tracks rendering: `src/App.tsx:212-241`, `242-282`.
- Overlay usage: `src/components/Overlay`.
- Build/format tooling: `package.json`.
