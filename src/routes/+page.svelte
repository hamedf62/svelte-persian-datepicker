<script lang="ts">
	import DatePicker from '$lib/DatePicker.svelte';

	// let modelValue = /* your model value */;
	let formatProp = 'YYYY-MM-DD';
	let inputFormatProp = 'jYYYY/jMM/jDD HH:mm:ss';
	let displayFormatProp = 'YYYY-MM-DD';

	function onSubmit(val) {
		console.log('result:', val);
	}
</script>

<DatePicker
	{formatProp}
	{inputFormatProp}
	{displayFormatProp}
	onSelect={() => {}}
	{onSubmit}
	onClear={() => {}}
	localeProp="fa,en"
	typeProp="date"
	modeProp="single"
	columnProp={2}
	autoSubmitProp={false}
/>
