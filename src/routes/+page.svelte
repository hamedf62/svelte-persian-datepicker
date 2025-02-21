<script lang="ts">
	import DatePicker from '$lib/DatePicker.svelte';

	// let modelValue = /* your model value */;
	let format = 'YYYY-MM-DD';
	let inputFormat = 'YYYY-MM-DD';
	let displayFormat = 'YYYY-MM-DD';
</script>

<h1>Welcome to SvelteKit</h1>

<DatePicker
	{format}
	{inputFormat}
	{displayFormat}
	onSelect={() => {}}
	onSubmit={() => {}}
	onClear={() => {}}
	modelValue={''},
 
/>
