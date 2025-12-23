# GitHub Copilot Instructions for @hamedf/svelte-persian-datepicker

This guide helps GitHub Copilot provide better code suggestions and explanations when using the `@hamedf/svelte-persian-datepicker` package in Svelte 5 projects.

## Component Overview

The `DatePicker` is a Svelte 5 component that supports Jalali (Persian), Gregorian, and Hijri calendars. It uses Svelte 5 runes (`$state`, `$derived`, `$bindable`).

## Key Props and Usage Patterns

### 1. Model Binding (Crucial)
The `model` prop is bindable and uses Gregorian format (`YYYY-MM-DD`) regardless of the displayed calendar.
- **Single**: `string` (e.g., `'2023-10-25'`)
- **Range**: `string[]` (e.g., `['2023-10-25', '2023-10-30']`)
- **Multiple**: `string[]` (e.g., `['2023-10-25', '2023-10-27']`)

```svelte
<script>
  let myDate = $state('2023-10-25');
</script>

<DatePicker bind:model={myDate} />
```

### 2. Selection Modes (`mode`)
- `mode="single"` (default)
- `mode="range"`
- `mode="multiple"`

### 3. Picker Types (`type`)
- `type="date"` (default)
- `type="time"`
- `type="datetime"`

### 4. Date Boundaries (`from` and `to`)
Use standard JavaScript `Date` objects to set boundaries.
- `from`: Minimum selectable date.
- `to`: Maximum selectable date.

```svelte
<!-- Disable previous dates (only allow today onwards) -->
<DatePicker from={new Date()} />
```

### 5. Localization (`locale`)
- `locale="fa"` (Persian/Jalali - default)
- `locale="en"` (English/Gregorian)
- `locale="ar"` (Arabic/Hijri)
- Multiple locales: `locale="fa,en"` (allows user to toggle)

### 6. Range Selection Behavior
When `mode="range"`, the component handles the selection flow:
1. First click sets the start date.
2. Second click sets the end date.
3. If a range is already selected, the next click resets and starts a new range.
4. Dates before the start date are automatically disabled during the second step.

## Common Snippets for Copilot

### Basic Single Picker
```svelte
<DatePicker bind:model={date} color="blue" label="Select Date" />
```

### Date Range with Boundaries
```svelte
<DatePicker 
  mode="range" 
  bind:model={range} 
  from={new Date('2024-01-01')} 
  to={new Date('2024-12-31')} 
/>
```

### Datetime Picker
```svelte
<DatePicker type="datetime" bind:model={dateTime} format="YYYY-MM-DD HH:mm" />
```

## Troubleshooting for Copilot
- If the user asks why the model is in Gregorian when using Jalali, explain that the model always stores data in Gregorian for database compatibility, while `display_format` handles the UI.
- If the user wants to disable specific dates, suggest the `disable` prop which accepts an array of strings or a function: `disable={(date) => date.day() === 6}` (disables Fridays).
