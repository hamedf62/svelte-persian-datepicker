# Persian DatePicker Component (Svelte 5)

A highly customizable and feature-rich date picker component built with Svelte 5, supporting Persian (Jalali), Gregorian, and Arabic calendars. This component is inspired by and converted from [Alireza's Vue3 Persian DatePicker](https://github.com/alireza-ab/vue3-persian-datepicker).

## ✨ Features

### 📅 Selection Modes
- **Single Date**: Select one date
- **Date Range**: Select from one date to another
- **Multiple Dates**: Select multiple individual dates (click to toggle)
- **Time Only**: Select time without date
- **DateTime**: Select both date and time
- **DateTime Range**: Select from one datetime to another datetime

### 🌍 Localization & Calendar Support
- **Persian (Jalali)**: Full support for Persian calendar
- **Gregorian**: Standard international calendar
- **Arabic**: Arabic calendar support
- **RTL/LTR**: Automatic direction support based on locale

### 🎨 Customization
- **Colors**: Multiple color themes (blue, red, pink, orange, green, purple, gray)
- **Formats**: Customizable display formats, input formats
- **Styles**: Full CSS customization support
- **Icons**: Custom icon support
- **Shortcuts**: Predefined shortcuts for quick selections

### 💡 User Experience
- **Clearable Input**: Option to clear selected dates
- **Auto Submit**: Automatic submission on selection
- **Keyboard Navigation**: Full keyboard support
- **Modal Mode**: Can be displayed as modal
- **Dual Input**: Separate inputs for range selection
- **Validation**: Built-in date validation and disable rules

## 🚀 Installation

```bash
npm install @hamedf/svelte-persian-datepicker
# or
pnpm install @hamedf/svelte-persian-datepicker
# or
yarn add @hamedf/svelte-persian-datepicker
```

## 📖 Basic Usage

```svelte
<script>
  import DatePicker from '@hamedf/svelte-persian-datepicker';
  
  let selectedDate = '';
  
  function handleSubmit(date) {
    console.log('Selected date:', date);
  }
</script>

<DatePicker
  bind:model={selectedDate}
  mode="single"
  type="date"
  submit={handleSubmit}
  color="blue"
  clearable={true}
/>
```

## 🎯 Usage Examples

### Single Date Selection
```svelte
<DatePicker
  bind:model={singleDate}
  mode="single"
  type="date"
  submit={handleSingleDate}
  color="blue"
/>
```

### Date Range Selection
```svelte
<DatePicker
  bind:model={dateRange}
  mode="range"
  type="date"
  submit={handleDateRange}
  color="green"
/>
```

### Multiple Date Selection
```svelte
<DatePicker
  bind:model={multipleDates}
  mode="multiple"
  type="date"
  submit={handleMultipleDates}
  color="purple"
  auto_submit={false}
/>
```

### Time Selection
```svelte
<DatePicker
  bind:model={selectedTime}
  mode="single"
  type="time"
  input_format="HH:mm"
  submit={handleTime}
  color="orange"
/>
```

### DateTime Selection
```svelte
<DatePicker
  bind:model={selectedDateTime}
  mode="single"
  type="datetime"
  input_format="YYYY-MM-DD HH:mm"
  submit={handleDateTime}
  color="red"
/>
```

### DateTime Range Selection
```svelte
<DatePicker
  bind:model={dateTimeRange}
  mode="range"
  type="datetime"
  input_format="YYYY-MM-DD HH:mm"
  submit={handleDateTimeRange}
  color="pink"
/>
```

## ⚙️ Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `model` | `string \| string[] \| PersianDate \| PersianDate[]` | `undefined` | The selected value(s) |
| `mode` | `'single' \| 'range' \| 'multiple'` | `'single'` | Selection mode |
| `type` | `'date' \| 'time' \| 'datetime'` | `'date'` | Type of picker |
| `format` | `string` | `undefined` | Output format |
| `input_format` | `string` | `undefined` | Input format |
| `display_format` | `string` | `undefined` | Display format |
| `color` | `'blue' \| 'red' \| 'pink' \| 'orange' \| 'green' \| 'purple' \| 'gray'` | `undefined` | Color theme |
| `locale` | `string` | `'fa'` | Locale (fa, en, ar) |
| `clearable` | `boolean` | `true` | Show clear button |
| `auto_submit` | `boolean` | `true` | Auto submit on selection |
| `modal` | `boolean` | `false` | Display as modal |
| `dual_input` | `boolean` | `false` | Separate inputs for range |
| `shortcut` | `boolean \| object` | `false` | Enable shortcuts |
| `column` | `number \| object` | `1` | Number of calendar columns |
| `from` | `string` | `'1300'` | Minimum date/time |
| `to` | `string` | `'1430'` | Maximum date/time |
| `disable` | `object` | `undefined` | Disable rules |

## 🎨 Events

| Event | Parameters | Description |
|-------|------------|-------------|
| `submit` | `date: PersianDate \| PersianDate[]` | Fired when date is submitted |
| `select` | `date: PersianDate` | Fired when date is selected |
| `clear` | `none` | Fired when picker is cleared |
| `open` | `none` | Fired when picker opens |
| `close` | `none` | Fired when picker closes |

## 🎨 Styling

The component supports full CSS customization. You can override the default styles by targeting the component classes:

```css
/* Custom styling for multiple selection */
:global(.pdp-multiple .pdp-day.selected) {
  background-color: #8b5cf6 !important;
  color: white !important;
  border-radius: 4px;
  font-weight: 600;
}

/* Custom range styling */
:global(.pdp-range .pdp-day.start-range) {
  background-color: your-color;
}
```

## 🔧 Development

### Prerequisites
- Node.js 18+
- pnpm

### Setup
```bash
# Clone the repository
git clone https://github.com/hamedf62/svelte-persian-datepicker

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

## 📂 Project Structure

```
src/
├── lib/
│   ├── DatePicker.svelte          # Main component
│   ├── components/                # Sub-components
│   │   ├── PDPArrow.svelte
│   │   ├── PDPIcon.svelte
│   │   └── PDPAlt.svelte
│   ├── modules/
│   │   ├── core.ts               # Core logic
│   │   └── types.ts              # TypeScript types
│   └── assets/sass/              # Styles
└── routes/
    └── +page.svelte              # Demo page
```

## 🧪 Testing

The component includes comprehensive tests using Cypress:

```bash
# Run component tests
pnpm test:component

# Run e2e tests
pnpm test:e2e

# Open Cypress UI
pnpm cypress:open
```

## 📄 Documentation

For detailed documentation and API reference, visit [Alireza's Documentation](https://alireza-ab.ir/datepicker) as this component maintains compatibility with the original Vue3 version.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Alireza-ab](https://github.com/alireza-ab) for the original Vue3 Persian DatePicker
- Persian calendar calculations and localization support
- Svelte community for the amazing framework

## 📊 Features Comparison

| Feature | Single | Range | Multiple | Time | DateTime | DateTime Range |
|---------|--------|-------|----------|------|----------|---------------|
| Select one date | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Select date range | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Select multiple dates | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Time selection | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Persian calendar | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Keyboard navigation | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Custom validation | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
