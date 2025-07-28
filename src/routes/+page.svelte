<script lang="ts">
	import DatePicker, { PersianDate } from '$lib/DatePicker.svelte';

	// Different types of values for different modes
	let singleValue: string = $state(
		new Date('Mon Feb 17 2025 07:50:58 GMT+0330 (Iran Standard Time)').toISOString().split('T')[0]
	);
	let rangeValue: string[] = $state([]);
	let multipleValue: string[] = $state([]);
	let timeValue: string = $state('14:30');
	let datetimeValue: string = $state(
		new Date('Mon Feb 17 2025 14:30:00 GMT+0330 (Iran Standard Time)').toISOString()
	);

	// Configuration
	let format = 'YYYY-MM-DD';
	let inputFormat = 'YYYY-MM-DD';
	let displayFormat = 'YYYY-MM-DD';

	function submitSingle(val: PersianDate | PersianDate[]) {
		console.log('Single date result:', val);
	}

	function submitRange(val: PersianDate | PersianDate[]) {
		console.log('Range result:', val);
	}

	function submitMultiple(val: PersianDate | PersianDate[]) {
		console.log('Multiple dates result:', val);
	}

	function submitTime(val: PersianDate | PersianDate[]) {
		console.log('Time result:', val);
	}

	function submitDateTime(val: PersianDate | PersianDate[]) {
		console.log('DateTime result:', val);
	}

	function preSubmit() {
		console.log('Form submitted.');
	}
</script>

<main class="container">
	<div class="card">
		<h1 class="title">Persian DatePicker Demo</h1>
		<p class="subtitle">Comprehensive date, time, and datetime selection with multiple modes</p>

		<form onsubmit={() => preSubmit()}>
			<div class="grid">
				<!-- Single Date Selection -->
				<div class="demo-section">
					<h2 class="section-title">Single Date Selection</h2>
					<div class="form-group">
						<span class="label">Selected Value:</span>
						<div class="value-display">
							{singleValue || 'No date selected'}
						</div>
					</div>
					<div class="form-group">
						<DatePicker
							bind:model={singleValue}
							mode="single"
							type="date"
							input_format={inputFormat}
							submit={submitSingle}
							color="blue"
							clearable={true}
							auto_submit={true}
						/>
					</div>
				</div>

				<!-- Range Date Selection -->
				<div class="demo-section">
					<h2 class="section-title">Date Range Selection</h2>
					<div class="form-group">
						<span class="label">Selected Range:</span>
						<div class="value-display">
							{rangeValue.length > 0 ? rangeValue.join(' → ') : 'No range selected'}
						</div>
					</div>
					<div class="form-group">
						<DatePicker
							bind:model={rangeValue}
							mode="range"
							type="date"
							input_format={inputFormat}
							submit={submitRange}
							color="green"
							clearable={true}
							auto_submit={true}
						/>
					</div>
					<button
						onclick={() => console.log('Current rangeValue:', rangeValue)}
						style="margin-top: 10px; padding: 5px 10px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer;"
					>
						Log Current Value
					</button>
				</div>

				<!-- Multiple Date Selection -->
				<div class="demo-section">
					<h2 class="section-title">Multiple Date Selection</h2>
					<div class="form-group">
						<span class="label">Selected Dates:</span>
						<div class="value-display">
							{multipleValue.length > 0 ? multipleValue.join(', ') : 'No dates selected'}
						</div>
					</div>
					<div class="form-group">
						<DatePicker
							bind:model={multipleValue}
							mode="multiple"
							type="date"
							input_format={inputFormat}
							submit={submitMultiple}
							color="purple"
							clearable={true}
							auto_submit={true}
						/>
					</div>
					<button
						onclick={() => console.log('Current multipleValue:', multipleValue)}
						style="margin-top: 10px; padding: 5px 10px; background: #8b5cf6; color: white; border: none; border-radius: 4px; cursor: pointer;"
					>
						Log Current Value
					</button>
				</div>

				<!-- Time Selection -->
				<div class="demo-section">
					<h2 class="section-title">Time Selection</h2>
					<div class="form-group">
						<span class="label">Selected Time:</span>
						<div class="value-display">
							{timeValue || 'No time selected'}
						</div>
					</div>
					<div class="form-group">
						<DatePicker
							bind:model={timeValue}
							mode="single"
							type="time"
							input_format="HH:mm"
							submit={submitTime}
							color="orange"
							clearable={true}
							auto_submit={true}
						/>
					</div>
				</div>

				<!-- DateTime Selection -->
				<div class="demo-section">
					<h2 class="section-title">DateTime Selection</h2>
					<div class="form-group">
						<span class="label">Selected DateTime:</span>
						<div class="value-display">
							{datetimeValue || 'No datetime selected'}
						</div>
					</div>
					<div class="form-group">
						<DatePicker
							bind:model={datetimeValue}
							mode="single"
							type="datetime"
							input_format="YYYY-MM-DD HH:mm"
							submit={submitDateTime}
							color="red"
							clearable={true}
							auto_submit={true}
						/>
					</div>
				</div>

				<!-- DateTime Range Selection -->
				<div class="demo-section">
					<h2 class="section-title">DateTime Range Selection</h2>
					<div class="form-group">
						<span class="label">Selected DateTime Range:</span>
						<div class="value-display">Example: Select from one datetime to another</div>
					</div>
					<div class="form-group">
						<DatePicker
							mode="range"
							type="datetime"
							input_format="YYYY-MM-DD HH:mm"
							submit={(val) => console.log('DateTime range:', val)}
							color="pink"
							clearable={true}
							auto_submit={true}
						/>
					</div>
				</div>

				<!-- Calendar Display Demo -->
				<div class="demo-section">
					<h2 class="section-title">Input Calendar Display Options</h2>
					<div class="form-group">
						<span class="label">Auto (follows locale - Persian):</span>
						<DatePicker
							mode="single"
							type="date"
							locale="fa"
							input_calendar="auto"
							color="blue"
							clearable={true}
							auto_submit={false}
						/>
					</div>
					<div class="form-group">
						<span class="label">Force Jalali/Persian Calendar:</span>
						<DatePicker
							mode="single"
							type="date"
							locale="en"
							input_calendar="jalali"
							color="green"
							clearable={true}
							auto_submit={false}
						/>
					</div>
					<div class="form-group">
						<span class="label">Force Gregorian Calendar:</span>
						<DatePicker
							mode="single"
							type="date"
							locale="fa"
							input_calendar="gregorian"
							color="orange"
							clearable={true}
							auto_submit={false}
						/>
					</div>
				</div>
			</div>

			<!-- Configuration Info -->
			<div class="config-section">
				<h2 class="section-title">Configuration</h2>
				<div class="config-grid">
					<div class="config-item">
						<span class="label">Format:</span>
						<div class="config-value">{format}</div>
					</div>
					<div class="config-item">
						<span class="label">Input Format:</span>
						<div class="config-value">{inputFormat}</div>
					</div>
					<div class="config-item">
						<span class="label">Display Format:</span>
						<div class="config-value">{displayFormat}</div>
					</div>
				</div>
			</div>

			<button type="submit" class="submit-btn">Submit All Values</button>
		</form>

		<!-- Feature Overview -->
		<div class="features-section">
			<h2 class="section-title">Features Overview</h2>
			<ul class="features-list">
				<li><strong>Single Date:</strong> Select one date</li>
				<li><strong>Date Range:</strong> Select from one date to another</li>
				<li><strong>Multiple Dates:</strong> Select multiple individual dates (click to toggle)</li>
				<li><strong>Time Only:</strong> Select time without date</li>
				<li><strong>DateTime:</strong> Select both date and time</li>
				<li><strong>DateTime Range:</strong> Select from one datetime to another datetime</li>
				<li><strong>Persian Calendar:</strong> Full support for Persian/Jalali calendar</li>
				<li><strong>Customizable:</strong> Colors, formats, validation, and more</li>
			</ul>
		</div>
	</div>
</main>

<style>
	:global(body) {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		min-height: 100vh;
		margin: 0;
		font-family:
			'Inter',
			system-ui,
			-apple-system,
			sans-serif;
	}

	.container {
		padding-top: 2rem;
		padding-bottom: 2rem;
		max-width: 1400px;
		margin: 0 auto;
		padding-left: 2rem;
		padding-right: 2rem;
	}

	.card {
		background: white;
		border-radius: 12px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
		padding: 2rem;
	}

	.title {
		font-size: 2.5rem;
		font-weight: bold;
		color: #374151;
		margin-bottom: 0.5rem;
		text-align: center;
	}

	.subtitle {
		font-size: 1.1rem;
		color: #6b7280;
		text-align: center;
		margin-bottom: 2rem;
	}

	.grid {
		display: grid;
		gap: 2rem;
		margin-bottom: 2rem;
	}

	@media (min-width: 768px) {
		.grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1200px) {
		.grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.demo-section {
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 1.5rem;
		background: #f9fafb;
	}

	.section-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: #374151;
		border-bottom: 2px solid #e5e7eb;
		padding-bottom: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.label {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		color: #6b7280;
		margin-bottom: 0.5rem;
	}

	.value-display {
		background: white;
		padding: 0.75rem;
		border-radius: 6px;
		border: 1px solid #e5e7eb;
		font-size: 0.875rem;
		font-family: monospace;
		min-height: 1.2rem;
		color: #374151;
	}

	.config-section {
		background: #f3f4f6;
		border-radius: 8px;
		padding: 1.5rem;
		margin-bottom: 2rem;
	}

	.config-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.config-item {
		display: flex;
		flex-direction: column;
	}

	.config-value {
		font-size: 0.875rem;
		color: #374151;
		font-family: monospace;
		background: white;
		padding: 0.5rem;
		border-radius: 4px;
		border: 1px solid #e5e7eb;
	}

	.submit-btn {
		width: 100%;
		background: #2563eb;
		color: white;
		font-weight: 500;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		border: none;
		cursor: pointer;
		transition: background-color 0.2s;
		margin-bottom: 2rem;
		font-size: 1rem;
	}

	.submit-btn:hover {
		background: #1d4ed8;
	}

	.features-section {
		background: #f8fafc;
		border-radius: 8px;
		padding: 1.5rem;
		border-left: 4px solid #2563eb;
	}

	.features-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.features-list li {
		padding: 0.5rem 0;
		border-bottom: 1px solid #e5e7eb;
		color: #374151;
	}

	.features-list li:last-child {
		border-bottom: none;
	}

	.features-list strong {
		color: #2563eb;
	}

	/* Custom styles for multiple selection */
	:global(.pdp-multiple .pdp-day.selected) {
		background-color: #8b5cf6 !important;
		color: white !important;
		border-radius: 4px;
		font-weight: 600;
	}

	:global(.pdp-multiple .pdp-day.selected:hover) {
		background-color: #7c3aed !important;
	}
</style>
