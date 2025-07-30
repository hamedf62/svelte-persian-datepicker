# GitHub Pages Deployment Guide

## What we've set up:

### 1. **GitHub Actions Workflow** (`.github/workflows/deploy-pages.yml`)
- Automatically builds and deploys to GitHub Pages on every push to `main` branch
- Uses pnpm for dependency management
- Configures base path for GitHub Pages subdirectory deployment

### 2. **SvelteKit Configuration** (`svelte.config.js`)
- Updated for static site generation with proper base path handling
- Configured to output to `build` directory for GitHub Pages

### 3. **Build Scripts** (`package.json`)
- Added `build:gh-pages` script for local testing
- Updated build process for GitHub Pages deployment

### 4. **Prerendering** (`src/routes/+layout.ts`)
- Enabled prerendering for all routes to generate static files

### 5. **GitHub Pages Assets** (`static/.nojekyll`)
- Added `.nojekyll` file to prevent Jekyll processing

### 6. **Updated README.md**
- Added prominent demo link at the top

## Next Steps:

### Enable GitHub Pages:
1. Go to your repository settings: https://github.com/hamedf62/svelte-persian-datepicker/settings/pages
2. Under "Source", select "GitHub Actions"
3. Save the settings

### Deploy:
1. Commit all the changes we made
2. Push to the `main` branch
3. GitHub Actions will automatically build and deploy
4. Your demo will be available at: https://hamedf62.github.io/svelte-persian-datepicker/

## Local Testing:
- Run `pnpm run build:gh-pages` to test the build locally
- Run `pnpm run preview` to preview the built site

## Features Available in Demo:
- Interactive testing interface for all DatePicker configurations
- Live preview of all component features
- Code snippet generation
- Comprehensive testing instructions
- Multiple calendar support (Persian, Gregorian, Hijri)
- All selection modes (single, range, multiple)
- Various customization options
