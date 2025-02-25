import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
  // Tell Vite to treat your static directory as a public directory
  publicDir: 'static',
	css: {
		preprocessorOptions: {
		  scss: {
			// Optional: Add global SCSS imports or variables
			// additionalData: `@use 'src/styles/variables.scss' as *;`
		  }
		}
	  },
	 // Configure asset handling
	 build: {
		assetsInlineLimit: 0, // Don't inline any assets
		rollupOptions: {
		  // Explicitly exclude font files from being processed
		  external: [
			// This pattern will match font files in the static/fonts directory
			/^\/static\/fonts\/.+\.(woff|woff2|eot|ttf|otf)$/
		  ]
		}
	  }
});
