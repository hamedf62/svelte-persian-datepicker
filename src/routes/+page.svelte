<script lang="ts">
	import DatePicker, { PersianDate } from '$lib/DatePicker.svelte';

	let config: {
		type: 'date' | 'time' | 'datetime';
		mode: 'single' | 'range' | 'multiple';
		color: 'blue' | 'primary' | 'red' | 'pink' | 'orange' | 'green' | 'purple' | 'gray';
		locale: string;
		column: number;
		clearable: boolean;
		auto_submit: boolean;
		dual_input: boolean;
		icon_inside: boolean;
		shortcut: boolean;
		modal: boolean;
		from: Date | undefined;
		to: Date | undefined;
		input_calendar: 'auto' | 'jalali' | 'gregorian';
	} = $state({
		type: 'date',
		mode: 'single',
		color: 'blue',
		locale: 'fa',
		column: 1,
		clearable: true,
		auto_submit: true,
		dual_input: false,
		icon_inside: false,
		shortcut: false,
		modal: false,
		from: new Date('1921-03-22'),
		to: new Date('2051-03-21'),
		input_calendar: 'auto'
	});

	let testValue: string | string[] = $state('');
	let resultLog: string[] = $state([]);

	$effect(() => {
		if (config.type === 'time') {
			config.from = undefined;
			config.to = undefined;
		} else {
			config.from = config.from ?? new Date('1921-03-22');
			config.to = config.to ?? new Date('2051-03-21');
		}
		// Clear any existing value when switching picker type to avoid format mismatches
		testValue = config.mode === 'single' ? '' : [];
		resultLog = [];
	});

	$effect(() => {
		if (config.mode === 'single') {
			testValue = '';
		} else {
			testValue = [];
		}
		resultLog = [];
	});

	$effect(() => {
		if (config.mode === 'multiple') {
			config.auto_submit = false;
		} else {
			config.auto_submit = true;
		}
	});

	function onSubmit(val: PersianDate | PersianDate[]) {
		const ts = new Date().toLocaleTimeString();
		resultLog = [
			`[${ts}] submit: ${JSON.stringify(val?.toString?.() ?? val)}`,
			...resultLog.slice(0, 9)
		];
	}

	function onSelect(date: PersianDate) {
		const ts = new Date().toLocaleTimeString();
		resultLog = [`[${ts}] select: ${date.toString()}`, ...resultLog.slice(0, 9)];
	}

	function clearValue() {
		testValue = config.mode === 'single' ? '' : [];
		resultLog = [];
	}

	function generateCode() {
		const lines = ['<DatePicker', '\tbind:model={value}'];
		if (config.type !== 'date') lines.push(`\ttype="${config.type}"`);
		if (config.mode !== 'single') lines.push(`\tmode="${config.mode}"`);
		if (config.color !== 'blue') lines.push(`\tcolor="${config.color}"`);
		if (config.locale !== 'fa') lines.push(`\tlocale="${config.locale}"`);
		if (config.column !== 1) lines.push(`\tcolumn={${config.column}}`);
		if (!config.clearable) lines.push(`\tclearable={false}`);
		if (!config.auto_submit) lines.push(`\tauto_submit={false}`);
		if (config.dual_input) lines.push(`\tdual_input={true}`);
		if (config.icon_inside) lines.push(`\ticon_inside={true}`);
		if (config.modal) lines.push(`\tmodal={true}`);
		if (config.shortcut) lines.push(`\tshortcut={true}`);
		if (config.input_calendar !== 'auto') lines.push(`\tinput_calendar="${config.input_calendar}"`);
		lines.push(`\tsubmit={(v) => console.log(v)}`);
		lines.push('/>');
		return lines.join('\n');
	}

	const colors: Array<{ value: string; bg: string }> = [
		{ value: 'blue', bg: '#3b82f6' },
		{ value: 'primary', bg: '#6366f1' },
		{ value: 'green', bg: '#22c55e' },
		{ value: 'purple', bg: '#a855f7' },
		{ value: 'orange', bg: '#f97316' },
		{ value: 'red', bg: '#ef4444' },
		{ value: 'pink', bg: '#ec4899' },
		{ value: 'gray', bg: '#6b7280' }
	];
</script>

<main>
	<header>
		<div class="header-inner">
			<div class="logo">
				<span class="logo-icon">📅</span>
				<div>
					<h1>Svelte Persian DatePicker</h1>
					<p>تقویم شمسی، میلادی و هجری — Svelte 5</p>
				</div>
			</div>
			<div class="header-links">
				<a
					href="https://github.com/hamedf62/svelte-persian-datepicker"
					target="_blank"
					rel="noreferrer"
					class="gh-btn"
				>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"
						><path
							d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"
						/></svg
					>
					GitHub
				</a>
				<a
					href="https://www.npmjs.com/package/@hamedf/svelte-persian-datepicker"
					target="_blank"
					rel="noreferrer"
					class="npm-btn"
				>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"
						><path
							d="M0 0v24h24V0H0zm19.2 19.2H4.8V4.8h14.4v14.4zM7.2 7.2h9.6v1.6H14.4v6.4h-1.6V8.8h-1.6v6.4H7.2z"
						/></svg
					>
					npm
				</a>
			</div>
		</div>
	</header>

	<div class="layout">
		<!-- Config Panel -->
		<aside class="config-panel">
			<div class="panel-header">
				<h2>تنظیمات</h2>
				<span class="panel-badge">Config</span>
			</div>

			<section class="config-section">
				<h3>حالت نمایش</h3>
				<div class="seg-control">
					{#each ['date', 'time', 'datetime'] as t}
						<button class:active={config.type === t} onclick={() => (config.type = t as any)}
							>{t}</button
						>
					{/each}
				</div>
			</section>

			<section class="config-section">
				<h3>حالت انتخاب</h3>
				<div class="seg-control">
					{#each ['single', 'range', 'multiple'] as m}
						<button class:active={config.mode === m} onclick={() => (config.mode = m as any)}
							>{m}</button
						>
					{/each}
				</div>
			</section>

			<section class="config-section">
				<h3>زبان / تقویم</h3>
				<select bind:value={config.locale} class="select-input">
					<option value="fa">فارسی (شمسی)</option>
					<option value="en">English (Gregorian)</option>
					<option value="ar">عربي (هجري)</option>
					<option value="fa,en">فارسی + میلادی</option>
					<option value="fa,ar">فارسی + هجری</option>
					<option value="fa,en,ar">همه تقویم‌ها</option>
				</select>
			</section>

			<section class="config-section">
				<h3>رنگ</h3>
				<div class="color-grid">
					{#each colors as c}
						<button
							class="color-dot"
							class:selected={config.color === c.value}
							style="--c: {c.bg}"
							onclick={() => (config.color = c.value as any)}
							title={c.value}
						></button>
					{/each}
				</div>
			</section>

			<section class="config-section">
				<h3>ستون‌ها</h3>
				<div class="seg-control">
					{#each [1, 2, 3] as n}
						<button class:active={config.column === n} onclick={() => (config.column = n)}
							>{n}</button
						>
					{/each}
				</div>
			</section>

			<section class="config-section">
				<h3>گزینه‌ها</h3>
				<div class="toggle-list">
					<label class="toggle">
						<input type="checkbox" bind:checked={config.clearable} />
						<span class="toggle-track"><span class="toggle-thumb"></span></span>
						<span>دکمه پاک‌کن</span>
					</label>
					<label class="toggle">
						<input type="checkbox" bind:checked={config.dual_input} />
						<span class="toggle-track"><span class="toggle-thumb"></span></span>
						<span>ورودی دوگانه</span>
					</label>
					<label class="toggle">
						<input type="checkbox" bind:checked={config.icon_inside} />
						<span class="toggle-track"><span class="toggle-thumb"></span></span>
						<span>آیکون داخل</span>
					</label>
					<label class="toggle">
						<input type="checkbox" bind:checked={config.modal} />
						<span class="toggle-track"><span class="toggle-thumb"></span></span>
						<span>حالت مودال</span>
					</label>
					<label class="toggle">
						<input type="checkbox" bind:checked={config.shortcut} />
						<span class="toggle-track"><span class="toggle-thumb"></span></span>
						<span>میانبرها</span>
					</label>
				</div>
			</section>

			<section class="config-section">
				<h3>تقویم ورودی</h3>
				<select bind:value={config.input_calendar} class="select-input">
					<option value="auto">خودکار (auto)</option>
					<option value="jalali">شمسی (Jalali)</option>
					<option value="gregorian">میلادی (Gregorian)</option>
				</select>
			</section>

			<button class="clear-btn" onclick={clearValue}>پاک کردن مقدار</button>
		</aside>

		<!-- Main Content -->
		<div class="content">
			<!-- Live Demo -->
			<div class="card demo-card">
				<div class="card-header">
					<span class="card-title">نمایش زنده</span>
					<span class="card-subtitle">Live Preview</span>
				</div>
				<div class="demo-area">
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
						input_calendar={config.input_calendar}
						submit={onSubmit}
						select={onSelect}
						label="انتخاب تاریخ"
					/>
				</div>
			</div>

			<!-- Value Panel -->
			<div class="two-col">
				<div class="card">
					<div class="card-header">
						<span class="card-title">مقدار خروجی</span>
						<span class="value-badge {Array.isArray(testValue) ? 'array' : 'string'}"
							>{Array.isArray(testValue) ? `array[${testValue.length}]` : 'string'}</span
						>
					</div>
					<pre class="value-pre">{JSON.stringify(testValue, null, 2)}</pre>
					<p class="value-note">مقدار همیشه در فرمت میلادی (Gregorian) ذخیره می‌شود</p>
				</div>

				<div class="card">
					<div class="card-header">
						<span class="card-title">رویدادها</span>
						{#if resultLog.length > 0}
							<button class="clear-log-btn" onclick={() => (resultLog = [])}>پاک</button>
						{/if}
					</div>
					<div class="log-area">
						{#if resultLog.length === 0}
							<p class="empty-log">هیچ رویدادی ثبت نشده...</p>
						{:else}
							{#each resultLog as entry}
								<div class="log-entry">{entry}</div>
							{/each}
						{/if}
					</div>
				</div>
			</div>

			<!-- Code Snippet -->
			<div class="card">
				<div class="card-header">
					<span class="card-title">کد تولید شده</span>
					<button
						class="copy-btn"
						onclick={(e) => {
							navigator.clipboard.writeText(generateCode());
							const btn = e.currentTarget as HTMLButtonElement;
							btn.textContent = '✓ کپی شد';
							setTimeout(() => (btn.textContent = 'کپی'), 2000);
						}}>کپی</button
					>
				</div>
				<pre class="code-pre"><code>{generateCode()}</code></pre>
			</div>

			<!-- Feature Cards -->
			<div class="features-grid">
				<div class="feature-card">
					<div class="feature-icon">🗓️</div>
					<h4>چندتقویمی</h4>
					<p>پشتیبانی از تقویم‌های شمسی، میلادی و هجری با قابلیت تغییر در زمان اجرا</p>
				</div>
				<div class="feature-card">
					<div class="feature-icon">📐</div>
					<h4>Svelte 5</h4>
					<p>طراحی‌شده با Runes‌های Svelte 5 برای حداکثر کارایی و واکنش‌پذیری</p>
				</div>
				<div class="feature-card">
					<div class="feature-icon">✨</div>
					<h4>قابل شخصی‌سازی</h4>
					<p>پشتیبانی کامل از CSS variables برای شخصی‌سازی رنگ، اندازه و ظاهر</p>
				</div>
				<div class="feature-card">
					<div class="feature-icon">🎯</div>
					<h4>TypeScript</h4>
					<p>تعریف‌های کامل TypeScript برای تجربه بهتر در محیط‌های IDE</p>
				</div>
			</div>
		</div>
	</div>
</main>

<style lang="scss">
	:global(*) {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}

	:global(body) {
		font-family:
			'Vazirmatn',
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			sans-serif;
		background: #f8fafc;
		color: #1e293b;
		line-height: 1.6;
		direction: rtl;
	}

	:global(a) {
		color: inherit;
		text-decoration: none;
	}

	// ── Header ──────────────────────────────────────────────
	header {
		background: #fff;
		border-bottom: 1px solid #e2e8f0;
		position: sticky;
		top: 0;
		z-index: 100;
		padding: 0 1.5rem;
	}

	.header-inner {
		max-width: 1280px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 64px;
		gap: 1rem;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 0.75rem;

		.logo-icon {
			font-size: 1.8rem;
			line-height: 1;
		}

		h1 {
			font-size: 1.1rem;
			font-weight: 700;
			color: #0f172a;
			white-space: nowrap;
		}

		p {
			font-size: 0.75rem;
			color: #64748b;
			margin-top: 1px;
		}
	}

	.header-links {
		display: flex;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.gh-btn,
	.npm-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.4rem 0.9rem;
		border-radius: 2em;
		font-size: 0.82rem;
		font-weight: 600;
		transition: all 0.15s;
		cursor: pointer;
	}

	.gh-btn {
		background: #0f172a;
		color: #fff;
		&:hover {
			background: #1e293b;
		}
	}

	.npm-btn {
		background: #cb3837;
		color: #fff;
		&:hover {
			background: #9b2626;
		}
	}

	// ── Layout ──────────────────────────────────────────────
	main {
		min-height: 100vh;
	}

	.layout {
		max-width: 1280px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: 280px 1fr;
		gap: 1.5rem;
		padding: 1.5rem;
		align-items: start;

		@media (max-width: 900px) {
			grid-template-columns: 1fr;
		}
	}

	// ── Config Panel ─────────────────────────────────────────
	.config-panel {
		background: #fff;
		border: 1px solid #e2e8f0;
		border-radius: 1rem;
		padding: 1.25rem;
		position: sticky;
		top: 80px;
		max-height: calc(100vh - 100px);
		overflow-y: auto;
		scroll-behavior: smooth;

		&::-webkit-scrollbar {
			width: 4px;
		}
		&::-webkit-scrollbar-thumb {
			background: #cbd5e1;
			border-radius: 2px;
		}
	}

	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.25rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid #f1f5f9;

		h2 {
			font-size: 1rem;
			font-weight: 700;
			color: #0f172a;
		}
	}

	.panel-badge {
		font-size: 0.7rem;
		font-weight: 600;
		background: #f1f5f9;
		color: #64748b;
		padding: 0.15em 0.6em;
		border-radius: 1em;
		letter-spacing: 0.05em;
	}

	.config-section {
		margin-bottom: 1.1rem;

		h3 {
			font-size: 0.78rem;
			font-weight: 600;
			color: #94a3b8;
			text-transform: uppercase;
			letter-spacing: 0.06em;
			margin-bottom: 0.5rem;
		}
	}

	.seg-control {
		display: flex;
		background: #f1f5f9;
		border-radius: 0.5rem;
		padding: 2px;
		gap: 2px;

		button {
			flex: 1;
			padding: 0.35em 0.5em;
			border: none;
			background: none;
			border-radius: 0.4rem;
			font-size: 0.82rem;
			font-family: inherit;
			cursor: pointer;
			color: #64748b;
			transition: all 0.15s;
			font-weight: 500;

			&.active {
				background: #fff;
				color: #0f172a;
				box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
				font-weight: 600;
			}
		}
	}

	.select-input {
		width: 100%;
		padding: 0.45em 0.7em;
		border: 1.5px solid #e2e8f0;
		border-radius: 0.5rem;
		font-size: 0.85rem;
		font-family: inherit;
		background: #fff;
		color: #1e293b;
		cursor: pointer;
		transition: border-color 0.15s;

		&:focus {
			outline: none;
			border-color: #3b82f6;
		}
	}

	.color-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.color-dot {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: var(--c);
		border: 2.5px solid transparent;
		cursor: pointer;
		transition: all 0.15s;
		position: relative;

		&.selected {
			border-color: var(--c);
			box-shadow:
				0 0 0 2px #fff,
				0 0 0 4px var(--c);
		}

		&:hover:not(.selected) {
			transform: scale(1.1);
		}
	}

	.toggle-list {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.toggle {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		cursor: pointer;

		input {
			display: none;
		}

		.toggle-track {
			width: 36px;
			height: 20px;
			background: #cbd5e1;
			border-radius: 10px;
			position: relative;
			transition: background 0.2s;
			flex-shrink: 0;
		}

		.toggle-thumb {
			position: absolute;
			top: 2px;
			right: 2px;
			width: 16px;
			height: 16px;
			background: #fff;
			border-radius: 50%;
			transition: transform 0.2s;
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
		}

		input:checked + .toggle-track {
			background: #3b82f6;

			.toggle-thumb {
				transform: translateX(-16px);
			}
		}

		span:last-child {
			font-size: 0.85rem;
			color: #374151;
		}
	}

	.clear-btn {
		width: 100%;
		padding: 0.6em 1em;
		border: 1.5px solid #e2e8f0;
		border-radius: 0.5rem;
		background: #fff;
		color: #64748b;
		font-size: 0.85rem;
		font-family: inherit;
		font-weight: 500;
		cursor: pointer;
		margin-top: 0.5rem;
		transition: all 0.15s;

		&:hover {
			border-color: #ef4444;
			color: #ef4444;
			background: #fef2f2;
		}
	}

	// ── Content ──────────────────────────────────────────────
	.content {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.card {
		background: #fff;
		border: 1px solid #e2e8f0;
		border-radius: 1rem;
		overflow: hidden;
	}

	.card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.9rem 1.25rem;
		border-bottom: 1px solid #f1f5f9;
	}

	.card-title {
		font-size: 0.95rem;
		font-weight: 600;
		color: #0f172a;
	}

	.card-subtitle {
		font-size: 0.78rem;
		color: #94a3b8;
		font-weight: 500;
	}

	.demo-card .demo-area {
		padding: 2.5rem 1.5rem;
		display: flex;
		justify-content: center;
		background: repeating-conic-gradient(#f8fafc 0% 25%, #fff 0% 50%) 0 0 / 24px 24px;

		:global(.pdp) {
			min-width: 280px;
			max-width: 420px;
			width: 100%;
		}
	}

	.two-col {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.25rem;

		@media (max-width: 640px) {
			grid-template-columns: 1fr;
		}
	}

	.value-pre {
		padding: 1rem 1.25rem;
		font-family: 'Fira Code', 'Menlo', 'Monaco', monospace;
		font-size: 0.82rem;
		color: #0f172a;
		background: #f8fafc;
		border: none;
		min-height: 80px;
		white-space: pre-wrap;
		direction: ltr;
	}

	.value-note {
		padding: 0.6rem 1.25rem;
		font-size: 0.78rem;
		color: #64748b;
		background: #fffbeb;
		border-top: 1px solid #fed7aa;
	}

	.value-badge {
		font-size: 0.72rem;
		font-weight: 600;
		padding: 0.15em 0.65em;
		border-radius: 1em;

		&.string {
			background: #dcfce7;
			color: #15803d;
		}

		&.array {
			background: #dbeafe;
			color: #1d4ed8;
		}
	}

	.log-area {
		padding: 0.75rem 1.25rem;
		min-height: 100px;
		max-height: 220px;
		overflow-y: auto;
		font-family: 'Fira Code', 'Menlo', 'Monaco', monospace;
		font-size: 0.78rem;
		direction: ltr;

		&::-webkit-scrollbar {
			width: 4px;
		}
		&::-webkit-scrollbar-thumb {
			background: #cbd5e1;
			border-radius: 2px;
		}
	}

	.empty-log {
		color: #94a3b8;
		text-align: center;
		padding: 1.5rem;
		font-size: 0.85rem;
		direction: rtl;
		font-family: inherit;
	}

	.log-entry {
		padding: 0.25rem 0;
		border-bottom: 1px solid #f1f5f9;
		color: #334155;

		&:last-child {
			border-bottom: none;
		}
	}

	.clear-log-btn {
		font-size: 0.75rem;
		font-family: inherit;
		padding: 0.2em 0.7em;
		border: 1.5px solid #e2e8f0;
		border-radius: 1em;
		background: #fff;
		color: #64748b;
		cursor: pointer;
		transition: all 0.15s;

		&:hover {
			border-color: #ef4444;
			color: #ef4444;
		}
	}

	.code-pre {
		padding: 1.25rem;
		background: #0f172a;
		color: #e2e8f0;
		font-family: 'Fira Code', 'Menlo', 'Monaco', monospace;
		font-size: 0.82rem;
		line-height: 1.7;
		overflow-x: auto;
		direction: ltr;

		code {
			background: none;
			padding: 0;
			color: inherit;
			font-family: inherit;
		}
	}

	.copy-btn {
		font-size: 0.78rem;
		font-family: inherit;
		padding: 0.3em 0.9em;
		border: none;
		border-radius: 1em;
		background: #3b82f6;
		color: #fff;
		cursor: pointer;
		font-weight: 600;
		transition: all 0.15s;

		&:hover {
			background: #2563eb;
		}
		&:active {
			transform: scale(0.97);
		}
	}

	// ── Features ─────────────────────────────────────────────
	.features-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1rem;

		@media (max-width: 900px) {
			grid-template-columns: repeat(2, 1fr);
		}

		@media (max-width: 480px) {
			grid-template-columns: 1fr;
		}
	}

	.feature-card {
		background: #fff;
		border: 1px solid #e2e8f0;
		border-radius: 1rem;
		padding: 1.25rem;
		text-align: center;

		.feature-icon {
			font-size: 2rem;
			margin-bottom: 0.75rem;
		}

		h4 {
			font-size: 0.9rem;
			font-weight: 700;
			color: #0f172a;
			margin-bottom: 0.4rem;
		}

		p {
			font-size: 0.8rem;
			color: #64748b;
			line-height: 1.6;
		}
	}
</style>
