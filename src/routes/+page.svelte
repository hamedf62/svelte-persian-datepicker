<script lang="ts">
	import DatePicker from '$lib/DatePicker.svelte';

	// let modelValue = /* your model value */;
	let format = 'YYYY-MM-DD';
	let inputFormat = 'jYYYY/jMM/jDD HH:mm:ss';
	let displayFormat = 'YYYY-MM-DD';

	function submit(val) {
		console.log('result:', val);
	}
</script>

<DatePicker
	{format}
	{inputFormat}
	{displayFormat}
	{submit}
	clear={() => {}}

/>

<!-- locale="fa,en"
type="date"
mode="single"
column={2}
autoSubmit={true}
placeholder="تاریخ تولد" -->