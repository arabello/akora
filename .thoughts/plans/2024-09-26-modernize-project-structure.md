# Night Focus Project Structure Modernization Plan

## Overview

Modernize the Night Focus project by eliminating the monorepo structure, consolidating the keybinding package into the main application, and migrating from Yarn + Turborepo + React Scripts to pnpm + Vite. This will simplify development, reduce build complexity, and improve developer experience while maintaining all existing functionality.

## Current State Analysis

**Existing Structure:**
- Yarn workspaces monorepo with 2 packages: `@night-focus/app` and `keybinding`
- Turborepo for build orchestration 
- React Scripts (Create React App) for main app bundling
- tsup for keybinding package compilation
- Jest/React Testing Library setup (unused)
- GitHub Actions deployment using Yarn

**Key Discoveries:**
- `keybinding` package is small (5 TypeScript files) and only used internally
- No actual test files exist despite test infrastructure
- Current build output: `packages/app/build/` → GitHub Pages
- App imports: `{ KB, useKeyBinding, useKeyPress }` from `keybinding`
- Both packages share identical dev dependencies (Prettier, TypeScript)

## Desired End State

**Simplified Structure:**
- Single package.json at project root
- All keybinding code moved to `src/keybinding/` directory
- Vite for development and building
- pnpm for package management
- Streamlined GitHub Actions workflow
- Removal of unused testing infrastructure

### Success Verification:
- Development server starts with `pnpm dev`
- Production build creates optimized static assets
- All keyboard shortcuts work identically to current version
- GitHub Pages deployment continues working
- No workspace or monorepo configuration remains

## What We're NOT Doing

- Changing the application's functionality or UI
- Modifying the audio mixing logic or keybinding behavior  
- Altering the deployment target (still GitHub Pages)
- Adding new features or dependencies
- Changing the TypeScript configuration significantly

## Implementation Approach

Incremental migration approach to minimize risk:
1. **Structure Preparation**: Set up new single-package structure
2. **Code Consolidation**: Move keybinding code into main app
3. **Build System Migration**: Replace React Scripts with Vite
4. **Package Manager Migration**: Switch from Yarn to pnpm
5. **CI/CD Update**: Update GitHub Actions workflow
6. **Cleanup**: Remove all monorepo artifacts

## Phase 1: Project Structure Consolidation

### Overview
Flatten the monorepo structure and move keybinding code into the main application source tree.

### Changes Required:

#### 1. Create New Root Package Structure
**File**: `package.json` (root)
**Changes**: Replace workspace configuration with single package

```json
{
  "name": "night-focus",
  "version": "0.1.0",
  "private": true,
  "homepage": "https://www.matteopellegrino.dev/night-focus",
  "author": "Matteo Pellegrino <matteo.pelle.pellegrino@gmail.com> (https://matteopellegrino.dev)",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "prestart": "node makeSourcesIndex.js sources > src/sourcesIndex.json",
    "prebuild": "node makeSourcesIndex.js sources > src/sourcesIndex.json",
    "prettier-write": "prettier --write src",
    "prettier-check": "prettier --check src"
  }
}
```

#### 2. Move Application Files
**Source**: `packages/app/src/` → `src/`
**Source**: `packages/app/public/` → `public/`
**Source**: `packages/app/makeSourcesIndex.js` → `makeSourcesIndex.js`

#### 3. Integrate Keybinding Code
**Source**: `packages/keybinding/src/` → `src/keybinding/`
**Changes**: Update import paths from `"keybinding"` to `"./keybinding"`

```typescript
// In src/App.tsx
import { KB, useKeyBinding, useKeyPress } from "./keybinding";
```

#### 4. Create Keybinding Index
**File**: `src/keybinding/index.ts`
**Changes**: Export all keybinding functionality

```typescript
export * from "./keybinding";
export * from "./useKeyBinding";
export * from "./useKeyPress";
```

### Success Criteria:

#### Automated Verification:
- [ ] Project structure is flattened: no `packages/` directory exists
- [ ] All source files are in `src/` directory
- [ ] TypeScript compilation succeeds: `npx tsc --noEmit`
- [ ] No broken import statements remain

#### Manual Verification:
- [ ] All keybinding functionality works in development mode
- [ ] No console errors related to missing modules
- [ ] File structure is clean and logical

---

## Phase 2: Build System Migration to Vite

### Overview
Replace React Scripts with Vite for faster development and modern build tooling.

### Changes Required:

#### 1. Install Vite and Dependencies
**File**: `package.json`
**Changes**: Replace React Scripts dependencies with Vite ecosystem

```json
{
  "dependencies": {
    "@buildo/bento-design-system": "0.18.0",
    "@react-aria/focus": "^3.11.0",
    "buffer": "^6.0.3",
    "fuse.js": "^6.6.2",
    "howler": "^2.2.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/howler": "^2.2.7",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0",
    "vite": "^4.0.0"
  }
}
```

#### 2. Create Vite Configuration
**File**: `vite.config.ts`
**Changes**: Configure Vite for React development

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/night-focus/',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 3000,
    open: true,
  },
})
```

#### 3. Update HTML Entry Point
**File**: `public/index.html` → `index.html`
**Changes**: Move to root and update for Vite

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Night Focus - Ambient sound mixer" />
    <link rel="apple-touch-icon" href="/logo192.png" />
    <link rel="manifest" href="/manifest.json" />
    <title>Night Focus</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <script type="module" src="/src/index.tsx"></script>
  </body>
</html>
```

#### 4. Update TypeScript Configuration
**File**: `tsconfig.json`
**Changes**: Optimize for Vite and modern React

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": false,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src", "makeSourcesIndex.js"],
  "exclude": ["dist", "node_modules"]
}
```

#### 5. Remove React Scripts Configuration
**Files to Delete**:
- Remove `eslintConfig` from package.json
- Remove `browserslist` from package.json
- Delete `src/setupTests.ts`
- Delete `src/react-app-env.d.ts`

### Success Criteria:

#### Automated Verification:
- [ ] Development server starts successfully: `pnpm dev`
- [ ] Production build completes: `pnpm build`
- [ ] Build output exists in `dist/` directory
- [ ] TypeScript compilation passes: `npx tsc --noEmit`
- [ ] No React Scripts references remain in package.json

#### Manual Verification:
- [ ] Hot reload works during development
- [ ] All application features work identically
- [ ] Build output is optimized (smaller bundle sizes)
- [ ] Source maps are generated for debugging

---

## Phase 3: Package Manager Migration to pnpm

### Overview
Replace Yarn with pnpm for faster installs and better dependency management.

### Changes Required:

#### 1. Remove Yarn Files
**Files to Delete**:
- `yarn.lock` (root)
- `packages/app/yarn.lock`
- `.yarnrc.yml` (if exists)

#### 2. Install pnpm and Dependencies
**Commands to Run**:
```bash
npm install -g pnpm
pnpm install
```

#### 3. Update Package Scripts
**File**: `package.json`
**Changes**: Ensure all scripts work with pnpm

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "prestart": "node makeSourcesIndex.js sources > src/sourcesIndex.json",
    "prebuild": "node makeSourcesIndex.js sources > src/sourcesIndex.json",
    "prettier-write": "prettier --write src",
    "prettier-check": "prettier --check src"
  }
}
```

#### 4. Create pnpm Configuration
**File**: `.npmrc`
**Changes**: Configure pnpm behavior

```ini
auto-install-peers=true
strict-peer-dependencies=false
```

### Success Criteria:

#### Automated Verification:
- [ ] `pnpm-lock.yaml` file is generated
- [ ] All dependencies install successfully: `pnpm install`
- [ ] No yarn.lock files exist in project
- [ ] Development server starts: `pnpm dev`
- [ ] Build process works: `pnpm build`

#### Manual Verification:
- [ ] Installation is faster than previous Yarn setup
- [ ] All application functionality remains identical
- [ ] No dependency-related warnings or errors

---

## Phase 4: GitHub Actions Workflow Update

### Overview
Update the deployment workflow to use pnpm and the new build structure.

### Changes Required:

#### 1. Update GitHub Actions Workflow
**File**: `.github/workflows/deploy.yaml`
**Changes**: Replace Yarn with pnpm and update build paths

```yaml
name: Deploy to Github Pages

on:
  push:
    branches:
      - main

jobs:
  deployment:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "lts/*"

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Get pnpm store directory
        shell: bash
        run: |
          echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV

      - name: Setup pnpm cache
        uses: actions/cache@v3
        with:
          path: ${{ env.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: dist
```

### Success Criteria:

#### Automated Verification:
- [ ] Workflow syntax is valid (GitHub Actions validates)
- [ ] pnpm installation step works in CI
- [ ] Build step produces output in `dist/` directory
- [ ] Deployment step publishes to GitHub Pages

#### Manual Verification:
- [ ] Deployed site works identically to current version
- [ ] All assets load correctly from GitHub Pages
- [ ] Build time is reasonable (should be faster than current)

---

## Phase 5: Final Cleanup and Validation

### Overview
Remove all remaining monorepo artifacts and validate the complete migration.

### Changes Required:

#### 1. Remove Monorepo Files
**Files to Delete**:
- `turbo.json`
- `packages/` directory (entire folder)
- Any remaining workspace configuration

#### 2. Update Documentation
**File**: `README.md`
**Changes**: Update development instructions

```markdown
# Night Focus

A modern ambient sound mixer for focus and productivity.

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Deployment

The app automatically deploys to GitHub Pages when code is pushed to the `main` branch.

## Sounds Credits
[... existing credits table ...]
```

## Success Criteria

### Automated Verification:
**Files to Check**:
- No references to workspaces in any configuration
- No turbo or yarn references anywhere
- All imports resolve correctly
- Build output matches expected structure

- [ ] No `packages/` directory exists
- [ ] No `turbo.json` file exists  
- [ ] No `yarn.lock` files exist anywhere
- [ ] `pnpm install` works from clean state
- [ ] `pnpm build` creates production assets
- [ ] All TypeScript files compile without errors: `npx tsc --noEmit`
- [ ] No broken imports or missing dependencies
- [ ] Development server starts successfully: `pnpm dev`
- [ ] Production build completes: `pnpm build`
- [ ] Build output exists in `dist/` directory
- [ ] `pnpm-lock.yaml` file is generated
- [ ] Workflow syntax is valid (GitHub Actions validates)
- [ ] pnpm installation step works in CI
- [ ] Build step produces output in `dist/` directory
- [ ] Deployment step publishes to GitHub Pages

### Manual Verification:
- [ ] Application starts and works identically to original
- [ ] All keyboard shortcuts function correctly
- [ ] Audio mixing works without issues
- [ ] Search functionality operates normally
- [ ] Focus management works as expected
- [ ] Mobile detection and messaging work
- [ ] All modals and UI components render correctly
- [ ] Hot reload works during development
- [ ] Build output is optimized (smaller bundle sizes)
- [ ] Source maps are generated for debugging
- [ ] Installation is faster than previous Yarn setup
- [ ] No dependency-related warnings or errors
- [ ] Deployed site works identically to current version
- [ ] All assets load correctly from GitHub Pages
- [ ] Build time is reasonable (should be faster than current)

---

## Comprehensive Manual Testing Checklist

### Audio System Testing:
- [ ] Load multiple audio sources (test with 3-4 different tracks)
- [ ] Adjust volume controls using arrow keys (◀ ▶)
- [ ] Test precise volume adjustment with Shift + arrows (⇧ + ◀ ▶)
- [ ] Test mute/unmute functionality (⇧ + M)
- [ ] Verify audio loops correctly without gaps
- [ ] Test audio mixing with multiple simultaneous tracks
- [ ] Verify volume persistence between sessions

### Keyboard Navigation Testing:
- [ ] **⌘ + K**: Focus search bar
- [ ] **▲ ▼**: Navigate tracks and sources
- [ ] **⏎**: Load focused source into tracks pool
- [ ] **X**: Remove focused track from pool
- [ ] **◀ ▶**: Control focused track volume
- [ ] **⇧ + ◀ ▶**: Precise volume adjustment
- [ ] **⇧ + M**: Mute/unmute all tracks
- [ ] **⇧ + /**: Toggle shortcuts modal
- [ ] **Escape**: Clear search, focus, close modals
- [ ] Verify focus management works correctly between search and tracks
- [ ] Test keyboard navigation wrapping (top to bottom, bottom to top)

### UI Component Testing:
- [ ] Test About modal (IconInfo button)
- [ ] Test Shortcuts modal (⇧ + /)
- [ ] Verify search bar functionality with various queries
- [ ] Test progress bars and volume controls
- [ ] Verify track list updates correctly
- [ ] Test source list filtering during search
- [ ] Verify mobile device detection message displays correctly
- [ ] Test responsive design on different screen sizes

### Search Functionality Testing:
- [ ] Search with partial names (e.g., "rain" should find "Rain Moderate", "Rain Storm")
- [ ] Search with full names
- [ ] Search with case variations
- [ ] Test fuzzy search capabilities
- [ ] Verify search results update in real-time
- [ ] Test clearing search with Escape key
- [ ] Verify navigation works correctly in filtered results

### Session Persistence Testing:
- [ ] Load tracks and adjust volumes
- [ ] Refresh browser - verify tracks and volumes persist
- [ ] Close and reopen browser - verify session restoration
- [ ] Test with multiple tracks loaded
- [ ] Verify overlay shows on session restore

### Development Experience Testing:
- [ ] Start development server: `pnpm dev`
- [ ] Verify hot reload works when editing components
- [ ] Test TypeScript error reporting
- [ ] Verify Prettier formatting works
- [ ] Test build process: `pnpm build`
- [ ] Test preview: `pnpm preview`

### Production Build Testing:
- [ ] Build creates optimized assets in `dist/`
- [ ] Bundle sizes are reasonable (smaller than current if possible)
- [ ] Source maps are generated
- [ ] All assets load correctly from build
- [ ] No console errors in production build
- [ ] Performance is acceptable (no regression from current version)

### GitHub Pages Deployment Testing:
- [ ] Push to main branch triggers deployment
- [ ] Build completes successfully in GitHub Actions
- [ ] Site deploys to GitHub Pages
- [ ] All assets load correctly from GitHub Pages URL
- [ ] Audio files load and play correctly from GitHub Pages
- [ ] No CORS issues with audio files
- [ ] Manifest.json and PWA features work correctly

## Performance Considerations

**Expected Improvements**:
- Faster development server startup with Vite
- Faster dependency installation with pnpm
- Smaller bundle sizes with modern build tools
- Better tree-shaking and code splitting

**Monitoring Points**:
- Bundle size should be smaller or equivalent
- Development server should start faster
- Hot reload should be more responsive

## Migration Notes

**Dependency Changes**:
- React Scripts → Vite: Modern build tooling
- Yarn → pnpm: Faster, more efficient package management
- tsup → Vite: Unified build system (no separate keybinding build)

**File Structure Changes**:
- `packages/app/src/` → `src/`
- `packages/keybinding/src/` → `src/keybinding/`
- `packages/app/build/` → `dist/`

**Import Path Changes**:
- `"keybinding"` → `"./keybinding"` (only in App.tsx)

## References

- Original research: `research.md`
- Current monorepo structure analysis
- Vite documentation: https://vitejs.dev/
- pnpm documentation: https://pnpm.io/
