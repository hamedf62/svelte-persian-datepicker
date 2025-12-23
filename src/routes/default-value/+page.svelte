<script lang="ts">
	import DatePicker from '$lib/DatePicker.svelte';

	let singleValue = $state('2023-10-25');
	let rangeValue = $state(['2023-10-25', '2023-10-30']);
	let multipleValue = $state(['2023-10-25', '2023-10-27', '2023-10-29']);
	let datetimeValue = $state('2023-10-25 14:30');

	let asyncValue = $state('');
	let disabledPrevValue = $state('');
	const today = new Date();

	let logs = $state<string[]>([]);

	function addLog(msg: string) {
		logs = [msg, ...logs.slice(0, 9)];
	}

	// Simulate async data loading
	setTimeout(() => {
		asyncValue = '2024-01-01';
		addLog('Async value loaded: 2024-01-01');
	}, 2000);
</script>

<div class="container">
	<h1>DatePicker Default Values Demo</h1>
	<p>This page demonstrates the DatePicker component with various default values.</p>

	<div class="grid">
		<section>
			<h2>Single Date</h2>
			<p>Default: <code>2023-10-25</code></p>
			<DatePicker
				bind:model={singleValue}
				mode="single"
				submit={(d) => addLog(`Single submitted: ${d}`)}
			/>
			<div class="value-box">
				<strong>Current Model:</strong> <code>{JSON.stringify(singleValue)}</code>
			</div>
		</section>

		<section>
			<h2>Range Selection</h2>
			<p>Default: <code>['2023-10-25', '2023-10-30']</code></p>
			<DatePicker
				bind:model={rangeValue}
				mode="range"
				submit={(d) => addLog(`Range submitted: ${JSON.stringify(d)}`)}
			/>
			<div class="value-box">
				<strong>Current Model:</strong> <code>{JSON.stringify(rangeValue)}</code>
			</div>
		</section>

		<section>
			<h2>Multiple Selection</h2>
			<p>Default: <code>['2023-10-25', '2023-10-27', '2023-10-29']</code></p>
			<DatePicker
				bind:model={multipleValue}
				mode="multiple"
				submit={(d) => addLog(`Multiple submitted: ${JSON.stringify(d)}`)}
			/>
			<div class="value-box">
				<strong>Current Model:</strong> <code>{JSON.stringify(multipleValue)}</code>
			</div>
		</section>

		<section>
			<h2>Datetime</h2>
			<p>Default: <code>2023-10-25 14:30</code></p>
			<DatePicker
				bind:model={datetimeValue}
				type="datetime"
				submit={(d) => addLog(`Datetime submitted: ${d}`)}
			/>
			<div class="value-box">
				<strong>Current Model:</strong> <code>{JSON.stringify(datetimeValue)}</code>
			</div>
		</section>

		<section>
			<h2>Async Default Value</h2>
			<p>Loads after 2 seconds. Current: <code>{asyncValue || 'Loading...'}</code></p>
			<DatePicker
				bind:model={asyncValue}
				mode="single"
				submit={(d) => addLog(`Async submitted: ${d}`)}
			/>
			<div class="value-box">
				<strong>Current Model:</strong> <code>{JSON.stringify(asyncValue)}</code>
			</div>
		</section>

		<section>
			<h2>Disable Previous Dates</h2>
			<p>Selectable from today (<code>{today.toISOString().split('T')[0]}</code>) onwards.</p>
			<DatePicker
				bind:model={disabledPrevValue}
				mode="single"
				from={today}
				submit={(d) => addLog(`Disabled prev submitted: ${d}`)}
			/>
			<div class="value-box">
				<strong>Current Model:</strong> <code>{JSON.stringify(disabledPrevValue)}</code>
			</div>
		</section>
	</div>

	<section class="logs">
		<h2>Event Logs (Last 10)</h2>
		<ul>
			{#each logs as log}
				<li>{log}</li>
			{/each}
		</ul>
	</section>
</div>

<style>
	.container {
		max-width: 1000px;
		margin: 0 auto;
		padding: 2rem;
		font-family: sans-serif;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
		gap: 2rem;
		margin-top: 2rem;
	}
	section {
		border: 1px solid #eee;
		padding: 1.5rem;
		border-radius: 8px;
		background: #f9f9f9;
	}
	h2 {
		margin-top: 0;
		color: #333;
		border-bottom: 2px solid #333;
		padding-bottom: 0.5rem;
	}
	.value-box {
		margin-top: 1rem;
		padding: 0.5rem;
		background: #fff;
		border: 1px dashed #ccc;
		font-size: 0.9rem;
	}
	code {
		background: #eee;
		padding: 0.2rem 0.4rem;
		border-radius: 4px;
	}
	.logs {
		margin-top: 3rem;
		background: #333;
		color: #fff;
	}
	.logs h2 {
		color: #fff;
		border-color: #fff;
	}
	ul {
		list-style: none;
		padding: 0;
	}
	li {
		padding: 0.25rem 0;
		border-bottom: 1px solid #444;
		font-family: monospace;
	}
</style>
