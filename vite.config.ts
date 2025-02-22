import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	// css: {
	// 	preprocessorOptions: {
	// 	  scss: {
	// 		api: 'modern-compiler',
	// 	  },
	// 	},
	//   },
	css: {
		preprocessorOptions: {
		  scss: {
			// Optional: Add global SCSS imports or variables
			// additionalData: `@use 'src/styles/variables.scss' as *;`
		  }
		}
	  }
});
