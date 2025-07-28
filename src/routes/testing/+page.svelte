<script lang="ts">
	import DatePicker, { PersianDate } from '$lib/DatePicker.svelte';

	// Configuration state for testing
	let config = $state({
		type: 'date' as 'date' | 'time' | 'datetime',
		mode: 'single' as 'single' | 'range' | 'multiple',
		color: 'blue' as 'blue' | 'red' | 'pink' | 'orange' | 'green' | 'purple' | 'gray',
		locale: 'fa',
		column: 1,
		clearable: true,
		auto_submit: true,
		dual_input: false,
		icon_inside: false,
		shortcut: false,
		modal: false,
		from: '1300',
		to: '1430',
		format: 'YYYY-MM-DD',
		input_format: 'YYYY-MM-DD',
		display_format: 'YYYY-MM-DD',
		input_calendar: 'auto' as 'auto' | 'jalali' | 'gregorian'
	});

	// Values for different modes
	let testValue: string | string[] = $state('');
	let resultLog: string[] = $state([]);

	// Dynamic format updates based on type
	$effect(() => {
		if (config.type === 'time') {
			config.format = 'HH:mm';
			config.input_format = 'HH:mm';
			config.display_format = 'HH:mm';
			config.from = '00:00';
			config.to = '23:59';
		} else if (config.type === 'datetime') {
			config.format = 'YYYY-MM-DD HH:mm';
			config.input_format = 'YYYY-MM-DD HH:mm';
			config.display_format = 'YYYY-MM-DD HH:mm';
			config.from = '1300';
			config.to = '1430';
		} else {
			config.format = 'YYYY-MM-DD';
			config.input_format = 'YYYY-MM-DD';
			config.display_format = 'YYYY-MM-DD';
			config.from = '1300';
			config.to = '1430';
		}
	});

	// Reset value when mode or type changes
	$effect(() => {
		if (config.mode === 'single') {
			testValue = '';
		} else {
			testValue = [];
		}
		resultLog = [];
	});

	// Automatically adjust auto_submit behavior based on mode for better UX
	$effect(() => {
		// For multiple selection, we want to disable auto_submit to allow multiple selections
		// before confirming, but keep it enabled for single/range for immediate feedback
		if (config.mode === 'multiple') {
			config.auto_submit = false;
		} else {
			config.auto_submit = true;
		}
	});

	function onSubmit(val: PersianDate | PersianDate[]) {
		const timestamp = new Date().toLocaleTimeString();
		const logEntry = `[${timestamp}] ${config.mode} ${config.type} submitted: ${JSON.stringify(val)}`;
		resultLog = [logEntry, ...resultLog.slice(0, 9)]; // Keep last 10 entries
		console.log('DatePicker submitted:', val);
	}

	function onSelect(date: PersianDate) {
		const timestamp = new Date().toLocaleTimeString();
		const logEntry = `[${timestamp}] Date selected: ${date.toString()}`;
		resultLog = [logEntry, ...resultLog.slice(0, 9)];
		console.log('Date selected:', date);
	}

	function clearValue() {
		if (config.mode === 'single') {
			testValue = '';
		} else {
			testValue = [];
		}
		resultLog = [];
	}

	function logCurrentValue() {
		const timestamp = new Date().toLocaleTimeString();
		const logEntry = `[${timestamp}] Current value: ${JSON.stringify(testValue)}`;
		resultLog = [logEntry, ...resultLog.slice(0, 9)];
		console.log('Current value:', testValue);
	}
</script>

<main class="testing-container">
	<div class="testing-header">
		<h1>Persian DatePicker Testing Interface</h1>
		<p>Interactive testing tool to explore all DatePicker features and configurations</p>
	</div>

	<div class="testing-layout">
		<!-- Configuration Panel -->
		<div class="config-panel">
			<h2>Configuration</h2>

			<!-- Basic Configuration -->
			<div class="config-section">
				<h3>Basic Settings</h3>

				<div class="config-item">
					<label for="type">Type:</label>
					<select bind:value={config.type} id="type">
						<option value="date">Date</option>
						<option value="time">Time</option>
						<option value="datetime">DateTime</option>
					</select>
				</div>

				<div class="config-item">
					<label for="mode">Selection Mode:</label>
					<select bind:value={config.mode} id="mode">
						<option value="single">Single</option>
						<option value="range">Range</option>
						<option value="multiple">Multiple</option>
					</select>
				</div>

				<div class="config-item">
					<label for="color">Color Theme:</label>
					<select bind:value={config.color} id="color">
						<option value="blue">Blue</option>
						<option value="red">Red</option>
						<option value="pink">Pink</option>
						<option value="orange">Orange</option>
						<option value="green">Green</option>
						<option value="purple">Purple</option>
						<option value="gray">Gray</option>
					</select>
				</div>

				<div class="config-item">
					<label for="locale">Locale:</label>
					<select bind:value={config.locale} id="locale">
						<option value="fa">Persian (فارسی)</option>
						<option value="en">English</option>
						<option value="ar">Hijri (هجري)</option>
						<option value="fa,en">Persian + English Toggle</option>
						<option value="fa,ar">Persian + Hijri Toggle</option>
						<option value="en,ar">English + Hijri Toggle</option>
						<option value="fa,en,ar">All Calendars Toggle</option>
					</select>
				</div>
			</div>

			<!-- Layout Configuration -->
			<div class="config-section">
				<h3>Layout & Display</h3>

				<div class="config-item">
					<label for="column">Column Count:</label>
					<select bind:value={config.column} id="column">
						<option value={1}>1 Month</option>
						<option value={2}>2 Months</option>
						<option value={3}>3 Months</option>
						<option value={4}>4 Months</option>
					</select>
				</div>

				<div class="config-item">
					<label>
						<input type="checkbox" bind:checked={config.dual_input} />
						Dual Input (Range Mode)
					</label>
				</div>

				<div class="config-item">
					<label>
						<input type="checkbox" bind:checked={config.icon_inside} />
						Icon Inside Input
					</label>
				</div>

				<div class="config-item">
					<label>
						<input type="checkbox" bind:checked={config.modal} />
						Modal Mode
					</label>
				</div>

				<div class="config-item">
					<label>
						<input type="checkbox" bind:checked={config.shortcut} />
						Show Shortcuts
					</label>
				</div>
			</div>

			<!-- Behavior Configuration -->
			<div class="config-section">
				<h3>Behavior</h3>

				<div class="config-item">
					<label>
						<input type="checkbox" bind:checked={config.clearable} />
						Clearable
					</label>
				</div>

				<div class="config-item">
					<label>
						<input type="checkbox" bind:checked={config.auto_submit} />
						Auto Submit
					</label>
				</div>
			</div>

			<!-- Date Range Configuration -->
			{#if config.type !== 'time'}
				<div class="config-section">
					<h3>Date Range</h3>

					<div class="config-item">
						<label for="from">From Year/Date:</label>
						<input type="text" bind:value={config.from} id="from" placeholder="e.g., 1300" />
					</div>

					<div class="config-item">
						<label for="to">To Year/Date:</label>
						<input type="text" bind:value={config.to} id="to" placeholder="e.g., 1430" />
					</div>
				</div>
			{/if}

			<!-- Format Configuration -->
			<div class="config-section">
				<h3>Format Settings</h3>

				<div class="config-item">
					<label for="format">Model Format:</label>
					<input type="text" bind:value={config.format} id="format" placeholder="YYYY-MM-DD" />
				</div>

				<div class="config-item">
					<label for="input_format">Input Format:</label>
					<input
						type="text"
						bind:value={config.input_format}
						id="input_format"
						placeholder="YYYY-MM-DD"
					/>
				</div>

				<div class="config-item">
					<label for="display_format">Display Format:</label>
					<input
						type="text"
						bind:value={config.display_format}
						id="display_format"
						placeholder="YYYY-MM-DD"
					/>
				</div>

				<div class="config-item">
					<label for="input_calendar">Input Calendar:</label>
					<select bind:value={config.input_calendar} id="input_calendar">
						<option value="auto">Auto (follows locale)</option>
						<option value="jalali">Persian (Jalali)</option>
						<option value="gregorian">Gregorian</option>
					</select>
				</div>
			</div>

			<!-- Actions -->
			<div class="config-actions">
				<button class="btn btn-secondary" onclick={clearValue}> Clear Value </button>
				<button class="btn btn-info" onclick={logCurrentValue}> Log Current Value </button>
			</div>
		</div>

		<!-- Testing Area -->
		<div class="testing-area">
			<h2>Live Testing</h2>

			<!-- Current Configuration Display -->
			<div class="current-config">
				<h3>Current Configuration</h3>
				<div class="config-display">
					<span class="config-tag">Type: {config.type}</span>
					<span class="config-tag">Mode: {config.mode}</span>
					<span class="config-tag">Color: {config.color}</span>
					<span class="config-tag">Columns: {config.column}</span>
					<span class="config-tag">Input Calendar: {config.input_calendar}</span>
					{#if config.dual_input}<span class="config-tag">Dual Input</span>{/if}
					{#if config.auto_submit}<span class="config-tag">Auto Submit</span>{/if}
					{#if config.clearable}<span class="config-tag">Clearable</span>{/if}
					{#if config.shortcut}<span class="config-tag">Shortcuts</span>{/if}
				</div>
			</div>

			<!-- DatePicker Instance -->
			<div class="datepicker-container">
				<h3>DatePicker Component</h3>
				<div class="picker-wrapper">
					<DatePicker
						bind:model={testValue}
						type={config.type}
						mode={config.mode}
						color={config.color}
						locale={config.locale}
						column={config.column}
						clearable={config.clearable}
						auto_submit={config.auto_submit}
						dual_input={config.dual_input}
						icon_inside={config.icon_inside}
						modal={config.modal}
						shortcut={config.shortcut}
						from={config.from}
						to={config.to}
						format={config.format}
						input_format={config.input_format}
						display_format={config.display_format}
						input_calendar={config.input_calendar}
						submit={onSubmit}
						select={onSelect}
						label="Test DatePicker"
					/>
				</div>
			</div>

			<!-- Current Value Display -->
			<div class="value-display">
				<h3>Current Value</h3>
				<div class="value-explanation">
					<p>
						<strong>Display Format:</strong> Shows dates in selected calendar format (Persian, Gregorian,
						or Hijri)
					</p>
					<p>
						<strong>Model Format:</strong> Always stored in Gregorian format for consistent data handling
					</p>
				</div>
				<div class="value-content">
					<pre>{JSON.stringify(testValue, null, 2)}</pre>
				</div>
				<div class="value-type">
					Type: {Array.isArray(testValue) ? 'Array' : typeof testValue}
					{#if Array.isArray(testValue)}
						| Length: {testValue.length}
					{/if}
				</div>
				<div class="value-note">
					<strong>Note:</strong> The value above is always in Gregorian format (YYYY-MM-DD), regardless
					of the selected calendar display format.
				</div>
			</div>

			<!-- Event Log -->
			<div class="event-log">
				<h3>Event Log</h3>
				<div class="log-content">
					{#if resultLog.length === 0}
						<p class="no-events">No events yet. Interact with the DatePicker to see logs.</p>
					{:else}
						{#each resultLog as log}
							<div class="log-entry">{log}</div>
						{/each}
					{/if}
				</div>
			</div>

			<!-- Testing Instructions -->
			<div class="instructions">
				<h3>Testing Instructions</h3>
				<div class="instruction-content">
					<h4>Multiple Selection Testing:</h4>
					<ul>
						<li>Set mode to "Multiple" and type to "Date"</li>
						<li>Click on different dates to select multiple dates</li>
						<li><strong>Modal stays open</strong> while you select multiple dates</li>
						<li>Navigate between months using arrows to select dates across months</li>
						<li>
							For example: Select 15th of current month, then navigate to next month and select 10th
						</li>
						<li>Selected dates will be highlighted and accumulated</li>
						<li><strong>Click "Confirm" button</strong> to finalize selection and close modal</li>
						<li>Or click "Cancel" to close modal without saving changes</li>
					</ul>

					<h4>Cross-Month Selection:</h4>
					<ul>
						<li>Use column count 2+ to see multiple months at once</li>
						<li>Or use single column and navigate with arrows</li>
						<li>In multiple mode, selections persist across month navigation</li>
						<li>Perfect for selecting dates like "15 June to 10 September"</li>
						<li>The footer shows count of selected dates</li>
					</ul>

					<h4>Best Practices for Multiple Selection:</h4>
					<ul>
						<li>Auto-submit is automatically disabled for multiple mode</li>
						<li>Modal remains open until user confirms or cancels</li>
						<li>Clear visual feedback shows selected dates with checkmarks</li>
						<li>Footer displays selection count and control buttons</li>
					</ul>

					<h4>Calendar Display vs Model Value:</h4>
					<ul>
						<li>
							<strong>Display Format:</strong> Input box shows dates in selected calendar format
						</li>
						<li><strong>Persian (fa):</strong> Shows "1403/07/28" format</li>
						<li><strong>Gregorian (en):</strong> Shows "2025-01-28" format</li>
						<li><strong>Hijri (ar):</strong> Shows Islamic calendar format with Arabic months</li>
						<li>
							<strong>Model Value:</strong> Always stored as Gregorian (YYYY-MM-DD) for data consistency
						</li>
					</ul>

					<h4>Advanced Testing:</h4>
					<ul>
						<li>Try different column counts (1-4 months visible)</li>
						<li>Test dual input mode with range selection</li>
						<li>Experiment with different color themes</li>
						<li>Test locale switching (Persian/English/Hijri)</li>
						<li>
							<strong>Hijri Calendar Testing:</strong> Select "Hijri" locale to see lunar dates in input
							box
						</li>
						<li>Try multi-calendar toggle options (Persian + Hijri, etc.)</li>
						<li>Try modal mode for overlay display</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</main>

<style lang="scss">
	.testing-container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 20px;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.testing-header {
		text-align: center;
		margin-bottom: 30px;

		h1 {
			color: #1f2937;
			margin-bottom: 10px;
			font-size: 2.5rem;
			font-weight: 700;
		}

		p {
			color: #6b7280;
			font-size: 1.1rem;
		}
	}

	.testing-layout {
		display: grid;
		grid-template-columns: 350px 1fr;
		gap: 30px;
		align-items: start;

		@media (max-width: 1024px) {
			grid-template-columns: 1fr;
			gap: 20px;
		}
	}

	.config-panel {
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 24px;
		position: sticky;
		top: 20px;
		max-height: calc(100vh - 40px);
		overflow-y: auto;

		h2 {
			color: #1f2937;
			margin-bottom: 20px;
			font-size: 1.5rem;
			font-weight: 600;
		}
	}

	.config-section {
		margin-bottom: 24px;

		h3 {
			color: #374151;
			margin-bottom: 12px;
			font-size: 1.1rem;
			font-weight: 600;
			border-bottom: 1px solid #e5e7eb;
			padding-bottom: 8px;
		}
	}

	.config-item {
		margin-bottom: 12px;

		label {
			display: block;
			color: #4b5563;
			font-weight: 500;
			margin-bottom: 4px;
			font-size: 0.9rem;
		}

		select,
		input[type='text'] {
			width: 100%;
			padding: 8px 12px;
			border: 1px solid #d1d5db;
			border-radius: 6px;
			font-size: 0.9rem;
			background: white;

			&:focus {
				outline: none;
				border-color: #3b82f6;
				box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
			}
		}

		input[type='checkbox'] {
			margin-right: 8px;
		}

		label:has(input[type='checkbox']) {
			display: flex;
			align-items: center;
			cursor: pointer;
		}
	}

	.config-actions {
		display: flex;
		gap: 8px;
		margin-top: 20px;
	}

	.btn {
		padding: 8px 16px;
		border: none;
		border-radius: 6px;
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;

		&.btn-secondary {
			background: #6b7280;
			color: white;

			&:hover {
				background: #4b5563;
			}
		}

		&.btn-info {
			background: #3b82f6;
			color: white;

			&:hover {
				background: #2563eb;
			}
		}
	}

	.testing-area {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 24px;

		h2 {
			color: #1f2937;
			margin-bottom: 24px;
			font-size: 1.5rem;
			font-weight: 600;
		}

		h3 {
			color: #374151;
			margin-bottom: 16px;
			font-size: 1.2rem;
			font-weight: 600;
		}
	}

	.current-config {
		margin-bottom: 24px;
		padding: 16px;
		background: #f3f4f6;
		border-radius: 8px;
	}

	.config-display {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.config-tag {
		background: #3b82f6;
		color: white;
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 0.8rem;
		font-weight: 500;
	}

	.datepicker-container {
		margin-bottom: 24px;
		padding: 20px;
		border: 2px dashed #d1d5db;
		border-radius: 8px;
		background: #fafafa;
	}

	.picker-wrapper {
		display: flex;
		justify-content: center;
		padding: 20px 0;
	}

	.value-display {
		margin-bottom: 24px;
		padding: 16px;
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
	}

	.value-explanation {
		margin-bottom: 12px;
		padding: 12px;
		background: #eff6ff;
		border: 1px solid #bfdbfe;
		border-radius: 6px;

		p {
			margin: 4px 0;
			font-size: 0.9rem;
			color: #1e40af;
		}
	}

	.value-content {
		background: #1f2937;
		color: #f9fafb;
		padding: 12px;
		border-radius: 4px;
		font-family: 'Monaco', 'Consolas', monospace;
		font-size: 0.9rem;
		overflow-x: auto;

		pre {
			margin: 0;
			white-space: pre-wrap;
		}
	}

	.value-type {
		margin-top: 8px;
		font-size: 0.8rem;
		color: #6b7280;
		font-weight: 500;
	}

	.value-note {
		margin-top: 12px;
		padding: 8px;
		background: #fef3c7;
		border: 1px solid #f59e0b;
		border-radius: 4px;
		font-size: 0.85rem;
		color: #92400e;
	}
	.event-log {
		margin-bottom: 24px;
		padding: 16px;
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		max-height: 300px;
		overflow-y: auto;
	}

	.log-content {
		font-family: 'Monaco', 'Consolas', monospace;
		font-size: 0.85rem;
	}

	.no-events {
		color: #9ca3af;
		font-style: italic;
		text-align: center;
		padding: 20px;
	}

	.log-entry {
		padding: 4px 0;
		border-bottom: 1px solid #e5e7eb;
		color: #374151;

		&:last-child {
			border-bottom: none;
		}
	}

	.instructions {
		padding: 20px;
		background: #eff6ff;
		border: 1px solid #bfdbfe;
		border-radius: 8px;
	}

	.instruction-content {
		h4 {
			color: #1e40af;
			margin: 16px 0 8px 0;
			font-size: 1rem;
			font-weight: 600;

			&:first-child {
				margin-top: 0;
			}
		}

		ul {
			margin: 0 0 16px 0;
			padding-left: 20px;

			li {
				color: #374151;
				margin-bottom: 4px;
				line-height: 1.5;
			}
		}
	}

	/* Custom styles for multiple selection visual feedback */
	:global(.pdp-multiple .pdp-day.selected) {
		background-color: var(--primary-color, #3b82f6) !important;
		color: white !important;
		border-radius: 4px;
		font-weight: 600;
		position: relative;
	}

	:global(.pdp-multiple .pdp-day.selected:hover) {
		opacity: 0.9;
	}

	:global(.pdp-multiple .pdp-day.selected::after) {
		content: '✓';
		position: absolute;
		top: 2px;
		right: 2px;
		font-size: 10px;
		font-weight: bold;
	}

	/* Enhanced range selection styling */
	:global(.pdp-range .pdp-day.start-range) {
		border-radius: 4px 0 0 4px;
	}

	:global(.pdp-range .pdp-day.end-range) {
		border-radius: 0 4px 4px 0;
	}

	:global(.pdp-range .pdp-day.start-range.end-range) {
		border-radius: 4px;
	}
</style>
