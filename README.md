# DatePicker Component

Thanks to [Alireza great PersianDate and DatePicker package](https://github.com/alireza-ab/vue3-persian-datepicker)! its originally converted from his VUE3 component to svelte5.

This project provides a customizable datepicker component built with Svelte. It supports various modes (single, range, time, datetime), locale configurations (e.g. Persian, Gregorian, Arabic), and custom styling options.

## Features

- **Multiple Types**: Use the date, time, or datetime modes.
- **Localization**: Supports multiple locales (e.g. `fa`, `en`, `ar`).
- **Customization**: Customize display formats, input formats, colors, and styles.
- **Shortcuts**: Predefined shortcuts for quick selections (e.g. yesterday, tomorrow, this week).
- **Clearable Input**: Option to clear the selected date(s).

## Project Structure

- **Component**: The main datepicker is implemented in [src/lib/DatePicker.svelte](src/lib/DatePicker.svelte).
- **Core Logic**: Helper functions and shortcut definitions can be found in [src/lib/modules/core.ts](src/lib/modules/core.ts).
- **Testing**: Component tests are written with Cypress and are located in [cypress/component/datepicker.cy.ts](cypress/component/datepicker.cy.ts).
- **Styles**: The component styling is managed in the SASS/CSS files under [src/lib/assets/sass/app.scss](src/lib/assets/sass/app.scss) and [src/lib/assets/sass/app.css](src/lib/assets/sass/app.css).

## Installation

Ensure that you have [pnpm](https://pnpm.io/) installed. Then run:

```sh
pnpm i svelte-persian-datepicker
```
