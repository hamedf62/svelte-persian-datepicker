// cypress.config.ts
import { defineConfig } from 'cypress';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

export default defineConfig({
	component: {
		specPattern: 'cypress/**/*.cy.ts',
		supportFolder: 'cypress/support',
		supportFile: 'cypress/support/component.ts',
		indexHtmlFile: 'cypress/support/index.html',
		devServer: {
			framework: 'svelte',
			bundler: 'vite',
			viteConfig: () => {
				return {
					plugins: [svelte()],
					resolve: {
						alias: {
							$lib: resolve('./src/lib')
						}
					}
				};
			}
		}
	},

	e2e: {
		supportFile: 'cypress/support/e2e.ts',
		setupNodeEvents(on, config) {
			// implement node event listeners here
		}
	}
});
