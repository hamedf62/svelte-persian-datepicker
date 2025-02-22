<script lang="ts">
	import DatePicker from '$lib/DatePicker.svelte';

	// let modelValue = /* your model value */;
	let formatProp = 'YYYY-MM-DD';
	let inputFormatProp = 'jYYYY/jMM/jDD';
	let displayFormatProp = 'YYYY-MM-DD';
</script>

<h1>Welcome to SvelteKit</h1>

<DatePicker


	{formatProp}
	{inputFormatProp}
	{displayFormatProp}
	onSelect={() => {}}
	onSubmit={() => {}}
	onClear={() => {}}

 
/>
