<script lang="ts">
	import DatePicker from '$lib/DatePicker.svelte';

	// let modelValue = /* your model value */;
	let formatProp = 'YYYY-MM-DD';
	let inputFormatProp = 'jYYYY/jMM/jDD HH:mm:ss';
	let displayFormatProp = 'YYYY-MM-DD';
</script>


<DatePicker


	{formatProp}
	{inputFormatProp}
	{displayFormatProp}
	onSelect={() => {}}
	onSubmit={() => {}}
	onClear={() => {}}

 typeProp="date"
 modeProp="single"
 
/>
