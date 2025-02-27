<script lang="ts">
	import DatePicker, { PersianDate } from '$lib/DatePicker.svelte';

	// let modelValue = /* your model value */;
	let format = 'YYYY-MM-DD';
	let inputFormat = 'YYYY-MM-DD';
	let displayFormat = 'YYYY-MM-DD';

	// console.log(PersianDate)
	function submit(val) {
		console.log('result:', val);
	}
	const init = 'Mon Feb 17 2025 07:50:58 GMT+0330 (Iran Standard Time)';

	function preSubmit() {
		console.log('fomr submited.');
	}
</script>

<form class="flex flex-col gap-4 mx-auto px-4" onsubmit={() => preSubmit()}>
	<input required type="name" />
	{new Date(init).toISOString().split('T')[0]}
	<DatePicker
		readonly
		modelValue={new Date(init).toISOString().split('T')[0]}
		mode="single"
		type="datetime"
		{format}
		{inputFormat}
		{displayFormat}
		{submit}
		clear={() => {}}
	/>
</form>
