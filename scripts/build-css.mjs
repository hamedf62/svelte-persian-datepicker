/**
 * Build script: Compiles SCSS to CSS and inlines it into DatePicker.svelte.
 * 
 * This script:
 * 1. Compiles src/lib/assets/sass/app.scss → src/lib/assets/app.css
 * 2. Replaces the CSS placeholder in DatePicker.svelte with the compiled CSS
 * 
 * This eliminates the SCSS dependency for consumers and ensures
 * the component works in all environments including SvelteKit SSR.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { compileStringAsync } from 'sass';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const scssFile = join(root, 'src/lib/assets/sass/app.scss');
const cssOutputFile = join(root, 'src/lib/assets/app.css');
const datePickerFile = join(root, 'src/lib/DatePicker.svelte');
const datePickerBackupFile = join(root, 'src/lib/DatePicker.svelte.bak');

async function buildCSS() {
	console.log('🔧 Building CSS from SCSS...');
	
	// Compile SCSS to CSS
	const scssContent = readFileSync(scssFile, 'utf-8');
	const result = await compileStringAsync(scssContent, {
		loadPaths: [join(root, 'src/lib/assets/sass')],
		style: 'expanded'
	});
	
	// Write compiled CSS
	const cssDir = dirname(cssOutputFile);
	if (!existsSync(cssDir)) {
		mkdirSync(cssDir, { recursive: true });
	}
	writeFileSync(cssOutputFile, result.css, 'utf-8');
	console.log(`✅ Compiled CSS written to: ${cssOutputFile}`);
	
	// Read the DatePicker.svelte source
	let svelteContent = readFileSync(datePickerFile, 'utf-8');
	
	// Check if it uses SCSS (needs migration)
	if (svelteContent.includes('lang="scss"')) {
		console.log('📝 Migrating DatePicker.svelte from SCSS to plain CSS...');
		
		// Backup original
		writeFileSync(datePickerBackupFile, svelteContent, 'utf-8');
		console.log(`   Backup saved to: ${datePickerBackupFile}`);
		
		// Replace the SCSS style block with compiled CSS
		// Pattern: <style lang="scss"> ... @use ... </style>
		const styleRegex = /<style\s+lang="scss">[\s\S]*?<\/style>/;
		const compiledCSS = `<style>\n${result.css}\n</style>`;
		
		svelteContent = svelteContent.replace(styleRegex, compiledCSS);
		
		writeFileSync(datePickerFile, svelteContent, 'utf-8');
		console.log('✅ DatePicker.svelte migrated to plain CSS');
	} else if (svelteContent.includes('/* CSS_COMPILED_AUTOMATICALLY */')) {
		// Already migrated - just update the CSS
		console.log('🔄 Updating compiled CSS in DatePicker.svelte...');
		
		const styleRegex = /<style>[\s\S]*?<\/style>/;
		const compiledCSS = `<style>\n${result.css}\n</style>`;
		
		svelteContent = svelteContent.replace(styleRegex, compiledCSS);
		
		writeFileSync(datePickerFile, svelteContent, 'utf-8');
		console.log('✅ DatePicker.svelte CSS updated');
	} else {
		console.log('⚠️  DatePicker.svelte already has plain CSS, replacing style block...');
		
		const styleRegex = /<style>[\s\S]*?<\/style>/;
		const compiledCSS = `<style>\n${result.css}\n</style>`;
		
		if (styleRegex.test(svelteContent)) {
			svelteContent = svelteContent.replace(styleRegex, compiledCSS);
			writeFileSync(datePickerFile, svelteContent, 'utf-8');
			console.log('✅ DatePicker.svelte CSS updated');
		} else {
			console.log('❌ Could not find style block in DatePicker.svelte');
		}
	}
	
	console.log('🎉 Build CSS complete!');

	// Copy compiled CSS to dist for direct import
	const distCssDir = join(root, 'dist/assets');
	if (!existsSync(distCssDir)) {
		mkdirSync(distCssDir, { recursive: true });
	}
	const distCssFile = join(distCssDir, 'app.css');
	writeFileSync(distCssFile, result.css, 'utf-8');
	console.log(`📋 Compiled CSS also copied to: ${distCssFile}`);
}

buildCSS().catch(err => {
	console.error('❌ Build CSS failed:', err);
	process.exit(1);
});
