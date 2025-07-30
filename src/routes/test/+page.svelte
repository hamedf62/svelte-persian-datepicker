<script lang="ts">
	import DatePicker, { PersianDate } from '$lib/DatePicker.svelte';
	let testValue = $state<string[]>([]);

	// Convert Persian dates to JavaScript Date objects
	// 1405/01/01 ≈ March 21, 2026
	const fromDate = new Date('2025');
	// 1407/12/29 ≈ March 19, 2029
	const toDate = new Date('2025-08-19');

	// Test different scenarios
	// let testValue2 = $state<string[]>([]);
	// let testValue3 = $state<string[]>([]);

	// Time picker test - Date objects for time should only affect the time part
	// const fromTime = new Date('2024-01-01T09:00:00');
	// const toTime = new Date('2024-01-01T18:00:00');
</script>

<div>
	<h1>Test Page</h1>

	<h2>Date Range Picker with Date Objects</h2>
	<DatePicker
		bind:model={testValue}
		type="date"
		mode="range"
		color="primary"
		locale="fa"
		from={fromDate}
		to={toDate}
	/>
	<p>Selected Date: {testValue && testValue.length ? testValue.join(' to ') : 'None'}</p>
	<p>
		From Date Object: {fromDate.toISOString().split('T')[0]} (Persian: {new PersianDate(
			fromDate
		).toString()})
	</p>
	<!-- <p>
		To Date Object: {toDate.toISOString().split('T')[0]} (Persian: {new PersianDate(
			toDate
		).toString()})
	</p>

	<hr />

	<h2>Single Date Picker without bounds</h2>
	<DatePicker bind:model={testValue2} type="date" mode="single" color="primary" locale="fa" />
	<p>Selected Date: {testValue2 && testValue2.length ? testValue2[0] : 'None'}</p>

	<hr />

	<h2>Time Picker with Date Object bounds</h2>
	<DatePicker
		bind:model={testValue3}
		type="time"
		mode="single"
		color="primary"
		locale="fa"
		from={fromTime}
		to={toTime}
	/>
	<p>Selected Time: {testValue3 && testValue3.length ? testValue3[0] : 'None'}</p>
	<p>
		Time bounds: {fromTime.toTimeString().substring(0, 5)} to {toTime
			.toTimeString()
			.substring(0, 5)}
	</p> -->
</div>

<style>
	hr {
		margin: 2rem 0;
		border: 1px solid #ddd;
	}
	h2 {
		color: #333;
		margin-top: 1rem;
	}
	p {
		margin: 0.5rem 0;
		font-size: 0.9rem;
	}
</style>
