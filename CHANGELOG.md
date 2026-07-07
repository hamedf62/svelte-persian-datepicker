# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.4.0] - 2026-07-08

### Changed

- **BREAKING SSR FIX**: Migrated from SCSS to pre-compiled plain CSS in distributed component.
  - SCSS is now compiled to CSS at build time and inlined directly into the `<style>` block
  - Eliminates SCSS preprocessing requirement for consuming projects
  - Fixes `[css is not a function]` error during SvelteKit SSR CSS extraction
- The `./styles` export now points to compiled CSS (`./dist/assets/app.css`) instead of SCSS
- Added comprehensive SSR safety guards (`browser` flag) around all browser API usage
- Added `build:css` script for CSS compilation
- Package build now automatically compiles SCSS before running `svelte-package`

### Fixed

- SvelteKit SSR incompatibility: Component no longer requires SCSS preprocessing on consumer side
- `$effect` blocks guarded against server-side execution with `browser` flag
- `document.removeEventListener` calls now guarded against SSR
- Year selection scroll effect now safely handles missing DOM elements
- Root element style/color manipulations now guarded for SSR safety
- Old SCSS files are cleaned from dist after packaging

## [1.3.0] - 2025-07-05

### Added

- Proper TypeScript type exports via `./types` subpath export in package.json
- SCSS styles export via `./styles` subpath export for easier theming
- Comprehensive WAI-ARIA accessibility attributes:
  - Calendar grid: `role="grid"`, `role="row"`, `role="gridcell"`, `role="columnheader"`
  - Day cells: `aria-selected`, `aria-disabled`, `aria-current="date"` for today
  - Descriptive `aria-label` with month name and day number on each day cell
  - `aria-live="polite"` region for month/year change announcements
  - `aria-label` on navigation buttons, calendar icon, and clear button

### Changed

- Day cell role changed from `role="button"` to `role="gridcell"` for proper semantics
- Day cell `tabindex` is now conditional (0 for interactive, -1 for disabled/empty)

### Fixed

- Day cell `onkeydown` handler now only responds to Enter/Space keys (previously triggered on any key press)

## [1.2.0] - 2025-07-05

### Added

- CHANGELOG.md for proper version tracking
- GitHub Actions CI/CD workflows for automated testing and publishing
- Updated .gitignore to exclude temporary test files and playwright artifacts

### Changed

- Updated all dependencies to latest versions:
  - Svelte 5.46.0 → 5.56.4
  - @sveltejs/kit 2.49.2 → 2.69.1
  - @sveltejs/adapter-auto 4.0.0 → 7.0.1
  - @sveltejs/vite-plugin-svelte 5.1.1 → 7.1.2
  - @sveltejs/package 2.5.7 → 2.5.8
  - vite 6.4.1 → 8.1.3
  - typescript 5.9.3 → 6.0.3
  - cypress 14.5.4 → 15.18.0
  - @playwright/test 1.57.0 → 1.61.1
  - prettier 3.7.4 → 3.9.4
  - sass 1.97.1 → 1.101.0
  - prettier-plugin-svelte 3.4.1 → 4.1.1
- Updated pnpm version requirement from 8 to 10 in CI workflows

### Fixed

- Removed commented code in Cypress config
- Cleaned up temporary test files (test-endof.js, test-persian-date.js)
- Removed .playwright-mcp directory with test artifacts
- Applied Prettier formatting to all project files

## [1.1.0] - 2024-12-23

### Fixed

- Fixed position:fixed picker issue
- Fixed infinite loop bug
- Fixed datetime/time switching bug

## [1.0.19] - 2024-12-xx

### Fixed

- Improved date boundary initialization using endOf('date')

## [1.0.18] - 2024-12-xx

### Fixed

- Corrected default value setting for different scenarios

## [1.0.17] - 2024-12-xx

### Fixed

- Fixed locale persistence in DatePicker component

## [1.0.16] - 2024-12-xx

### Fixed

- Fixed package.json warnings

## [1.0.15] - 2024-12-xx

### Fixed

- Resolved test issues
- Migrated to component testing

### Previous Versions

- 1.0.14: Corrected default value for different scenarios
- 1.0.13: Minor updates and improvements
- 1.0.12: Package.json updates

## [1.0.0] - 2024-xx-xx

### Added

- Initial release of Svelte 5 Persian Date Picker
- Support for single, range, and multiple date selection modes
- Support for date, time, and datetime picker types
- Multi-calendar support (Jalali, Gregorian, Hijri)
- RTL/LTR automatic direction support
- Keyboard navigation
- Custom color themes
- Disable rules and date boundaries
- Modal and dual input modes
