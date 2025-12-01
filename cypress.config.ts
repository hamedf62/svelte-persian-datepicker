// cypress.config.ts
import { defineConfig } from "cypress";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { resolve } from "path";

export default defineConfig({
  component: {
    // devServer: {
    //   framework: 'svelte',
    //   bundler: 'vite',
    //   viteConfig: {
    //     plugins: [svelte()], // Process Svelte files
    //     resolve: {
    //       alias: {
    //         $lib: resolve('./src/lib'), // Resolve $lib alias

    //       },
    //     },
    //   },
    // },
    // setupNodeEvents(on, config) {
    //   return Object.assign({}, config);
    // },
    specPattern: 'cypress/**/*.cy.ts',
    supportFolder: 'cypress/support',
    supportFile: 'cypress/support/component.ts',
    indexHtmlFile: 'cypress/support/index.html',

    devServer: {
      framework: "svelte",
      bundler: "vite",
      viteConfig: () => {
        return {
          plugins: [svelte()],
          resolve: {
            alias: {
              $lib: resolve("./src/lib"), // Resolve $lib alias
            },
          },
        };
      },
    },
    // specPattern: 'cypress/support/**/*.cy.{js,ts}', // Match your test files
    // specPattern: 'cypress/support/**/*.{cy,unit}.{js,jsx,ts,tsx}',
    // specPattern: "cypress/*/*.cy.ts",
    // specPattern: "cypress/*/*.ts",
  },

  e2e: {
    supportFile: 'cypress/support/e2e.ts',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
