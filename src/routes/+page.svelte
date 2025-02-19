<script lang="ts">
	import DatePicker from '$lib/DatePicker.svelte';

	// let modelValue = /* your model value */;
	let format = 'YYYY-MM-DD';
	let inputFormat = 'YYYY-MM-DD';
	let displayFormat = 'YYYY-MM-DD';
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
<DatePicker
	{format}
	{inputFormat}
	{displayFormat}
	onSelect={() => {}}
	onSubmit={() => {}}
	onClear={() => {}}
	modelValue={''},
  locale={'fa'}
/>
