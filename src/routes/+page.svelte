<script lang="ts">
	import DatePicker, { PersianDate } from '$lib/DatePicker.svelte';

	// let modelValue = /* your model value */;
	let format = 'YYYY-MM-DD';
	let inputFormat = 'HH:mm';
	let displayFormat = 'YYYY-MM-DD';

	// console.log(PersianDate)
	function submit(val) {
		console.log('result:', val);
	}


</script>

<DatePicker modelValue="20:20" mode="single" type="time" {format} {inputFormat} {displayFormat} {submit} clear={() => {}} />

