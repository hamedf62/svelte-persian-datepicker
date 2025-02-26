# Persian DatePicker Component (Svelte5)

A highly customizable date picker component built with Svelte 5, supporting Persian (Jalali), Gregorian, and Arabic calendars. This component is inspired by and converted from [Alireza's Vue3 Persian DatePicker](https://github.com/alireza-ab/vue3-persian-datepicker).

## Features

- **Multiple Types**: Use the date, time, or datetime modes.
- **Localization**: Supports multiple locales (e.g. `fa`, `en`, `ar`).
- **Customization**: Customize display formats, input formats, colors, and styles.
- **Shortcuts**: Predefined shortcuts for quick selections (e.g. yesterday, tomorrow, this week).
- **Clearable Input**: Option to clear the selected date(s).

## Documentation

this project obligate ALireza-ab Datepicker attributes as may find in [Documentations from Alireza-ab](https://alireza-ab.ir/datepicker)

## Project Structure

- **Component**: The main datepicker is implemented in [src/lib/DatePicker.svelte](src/lib/DatePicker.svelte).
- **Core Logic**: Helper functions and shortcut definitions can be found in [src/lib/modules/core.ts](src/lib/modules/core.ts).
- **Testing**: Component tests are written with Cypress and are located in [cypress/component/datepicker.cy.ts](cypress/component/datepicker.cy.ts).
- **Styles**: The component styling is managed in the SASS/CSS files under [src/lib/assets/sass/app.scss](src/lib/assets/sass/app.scss) and [src/lib/assets/sass/app.css](src/lib/assets/sass/app.css).

## Installation

Ensure that you have [pnpm](https://pnpm.io/) installed. Then run:

```sh
pnpm i @hamedf/svelte-persian-datepicker
```
