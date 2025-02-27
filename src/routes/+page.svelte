<script lang="ts">
	import DatePicker, { PersianDate } from '$lib/DatePicker.svelte';
	// let defaultValue :PersianDate = $state(new Date('Mon Feb 17 2025 07:50:58 GMT+0330 (Iran Standard Time)').toISOString().split('T')[0])
	let defaultValue: string = $state(
		new Date('Mon Feb 17 2025 07:50:58 GMT+0330 (Iran Standard Time)').toISOString().split('T')[0]
	);

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
	<!-- {new Date(init).toISOString().split('T')[0]} -->
	<br />
	model:: {defaultValue}
	<DatePicker
		readonly
		bind:model={defaultValue}
		mode="single"
		type="datetime"
		input_format={inputFormat}
		{submit}
		clear={() => {}}
	/>
</form>
