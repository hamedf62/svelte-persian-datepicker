# NPM Package Publishing Troubleshooting Guide

## The Problem

When you install the package in another project, old files remain and new files don't update in node_modules.

## Root Causes & Solutions

### 1. **Version Not Properly Bumped**

```bash
# Always bump version before publishing
pnpm version patch  # 1.0.8 -> 1.0.9
# or
pnpm version minor  # 1.0.8 -> 1.1.0
# or
pnpm version major  # 1.0.8 -> 2.0.0
```

### 2. **Cache Issues in Target Project**

In the project where you're installing:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or force reinstall specific package
npm uninstall @hamedf/svelte-persian-datepicker
npm install @hamedf/svelte-persian-datepicker@latest
```

### 3. **Build Process Issues**

```bash
# Complete clean rebuild and publish
rm -rf dist
pnpm run package
pnpm version patch
npm publish --access public
git push && git push --tags
```

### 4. **Package.json Files Configuration**

Make sure your `files` array includes everything needed:

```json
{
	"files": ["dist", "README.md", "CHANGELOG.md", "!dist/**/*.test.*", "!dist/**/*.spec.*"]
}
```

## Complete Publishing Workflow

### Step 1: Clean Build

```bash
cd /path/to/your/package
rm -rf dist
rm -rf node_modules
pnpm install
pnpm run package
```

### Step 2: Verify Build Contents

```bash
ls -la dist/
# Should show all your built files
```

### Step 3: Version Bump & Publish

```bash
pnpm version patch
npm publish --access public
git push && git push --tags
```

### Step 4: Verify Publication

```bash
# Check on npmjs.com
open "https://www.npmjs.com/package/@hamedf/svelte-persian-datepicker"

# Or check with npm view
npm view @hamedf/svelte-persian-datepicker
```

### Step 5: Test Installation in Target Project

```bash
cd /path/to/target/project

# Clear everything first
rm -rf node_modules package-lock.json pnpm-lock.yaml

# Install fresh
npm install @hamedf/svelte-persian-datepicker@latest
# or
pnpm add @hamedf/svelte-persian-datepicker@latest
```

## Common Issues & Fixes

### Issue: "Old files still there"

**Solution**: The target project is using cached/old version

```bash
# In target project
rm -rf node_modules
npm cache clean --force
npm install
```

### Issue: "New files not showing"

**Solution**: Version wasn't bumped or package wasn't rebuilt

```bash
# In source project
pnpm version patch
pnpm run package
npm publish --access public
```

### Issue: "Import errors"

**Solution**: Check exports in package.json match actual file structure

```json
{
	"exports": {
		".": {
			"types": "./dist/DatePicker.svelte.d.ts",
			"svelte": "./dist/DatePicker.svelte",
			"default": "./dist/DatePicker.svelte"
		},
		"./ai-guide": {
			"types": "./dist/ai-guide.d.ts",
			"import": "./dist/ai-guide.js"
		}
	}
}
```

## Debugging Commands

```bash
# Check what files npm would publish
npm pack --dry-run

# Check actual published package contents
npm view @hamedf/svelte-persian-datepicker files

# Check installed package contents
ls -la node_modules/@hamedf/svelte-persian-datepicker/

# Check package version in target project
npm list @hamedf/svelte-persian-datepicker
```
