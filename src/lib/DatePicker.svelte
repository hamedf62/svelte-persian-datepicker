<script lang="ts" module>
	import { PersianDate, Core } from './modules/core';
	export { PersianDate };
</script>

<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { onMount, onDestroy, tick } from 'svelte';
	import type {
		Obj,
		Attrs,
		Langs,
		RecursivePartial,
		Styles,
		Inputs,
		PickerPlace,
		TypePart,
		CalendarPart,
		Disable,
		Formats,
		MonthDays,
		Months,
		Shortcuts,
		DefaultDate
	} from './modules/types';
	import PDPArrow from './components/PDPArrow.svelte';
	import PDPIcon from './components/PDPIcon.svelte';
	import PDPAlt from './components/PDPAlt.svelte';

	function safePersianDate(date: Date | string | number | PersianDate): PersianDate {
		if (date instanceof Date) {
			return new PersianDate([
				date.getFullYear(),
				date.getMonth() + 1,
				date.getDate(),
				date.getHours(),
				date.getMinutes(),
				date.getSeconds()
			]);
		}
		return new PersianDate(date);
	}

	/**
	 * Props interface for the Persian DatePicker component
	 * This component supports Jalali (Persian), Gregorian, and Hijri calendars
	 * with various selection modes and customization options.
	 */
	export interface DatePickerProps {
		/**
		 * Callback fired when a date is selected (but not necessarily submitted)
		 * @example <DatePicker select={(date) => console.log('Selected:', date.toString())} />
		 */
		select?: (date: PersianDate) => void;

		/**
		 * Callback fired when date selection is submitted/confirmed
		 * @example <DatePicker submit={(dates) => console.log('Submitted:', dates)} />
		 */
		submit?: (date: PersianDate | PersianDate[]) => void;

		/**
		 * Callback fired when the input is cleared
		 * @example <DatePicker clear={() => console.log('Input cleared')} />
		 */
		clear?: () => void;

		/**
		 * Callback fired when the datepicker opens
		 * @example <DatePicker open={() => setIsOpen(true)} />
		 */
		open?: () => void;

		/**
		 * Callback fired when the datepicker closes
		 * @example <DatePicker close={() => setIsOpen(false)} />
		 */
		close?: () => void;

		/**
		 * The datepicker model value - bindable prop that holds selected date(s)
		 * @bindable - This prop is bindable and will update parent component
		 * @example
		 * // Single date
		 * <DatePicker bind:model={selectedDate} />
		 * // Multiple dates
		 * <DatePicker mode="multiple" bind:model={selectedDates} />
		 */
		model?: PersianDate | PersianDate[] | string | string[];

		/**
		 * Date format for the model value (always stored in Gregorian)
		 * @default 'YYYY-MM-DD' for date, 'YYYY-MM-DD HH:mm' for datetime, 'HH:mm' for time
		 * @example format="YYYY/MM/DD"
		 */
		format?: string;

		/**
		 * Format for user input parsing - determined by input_calendar setting
		 * @default Auto-determined based on input_calendar and locale
		 * @example input_format="jYYYY/jMM/jDD" for Jalali calendar
		 */
		input_format?: string;

		/**
		 * Format for displaying dates in the UI
		 * @default Auto-determined based on locale and calendar
		 * @example display_format="?jD ?jMMMM ?jYYYY" for Persian display
		 */
		display_format?: string;

		/**
		 * Calendar system to use for input display and parsing
		 * @default 'auto' - uses locale's default calendar
		 * - 'auto': Automatically determined by locale
		 * - 'jalali': Persian/Jalali calendar
		 * - 'gregorian': Gregorian calendar
		 */
		input_calendar?: 'auto' | 'jalali' | 'gregorian';

		/**
		 * Type of date/time picker to display
		 * @default 'date'
		 * - 'date': Date selection only
		 * - 'time': Time selection only
		 * - 'datetime': Both date and time selection
		 */
		type?: 'date' | 'time' | 'datetime';

		/**
		 * Minimum selectable date/time
		 * @default new Date() set to year 1921 for date/datetime, undefined for time
		 * @example from={new Date('2024-01-01')} or leave undefined for time
		 */
		from?: Date;

		/**
		 * Maximum selectable date/time
		 * @default new Date() set to year 2051 for date/datetime, undefined for time
		 * @example to={new Date('2030-12-31')} or leave undefined for time
		 */
		to?: Date;

		/**
		 * Controls whether the datepicker is initially visible
		 * @default false
		 */
		show?: boolean;

		/**
		 * Defines which elements can trigger the datepicker to open
		 * @default 'all'
		 * - 'all': Click on input or icon
		 * - 'input': Click only on input field
		 * - 'icon': Click only on calendar icon
		 * - 'none': No click interaction (programmatic only)
		 */
		click_on?: 'all' | 'input' | 'icon' | 'none';

		/**
		 * Whether to show datepicker as a modal overlay
		 * @default false
		 */
		modal?: boolean;

		/**
		 * Label text to display above the input
		 * @example label="Select Date"
		 */
		label?: string;

		/**
		 * Number of calendar columns to display or responsive breakpoints
		 * @default 1
		 * @example column={2} or column={{768: 1, 1024: 2}} for responsive
		 */
		column?: number | Record<number, number>;

		/**
		 * Whether to automatically submit when selection is complete
		 * @default true
		 * - true: Auto-submit on single/range completion
		 * - false: Requires manual submit button click
		 */
		auto_submit?: boolean;

		/**
		 * Date selection mode
		 * @default 'single'
		 * - 'single': Select one date
		 * - 'range': Select a date range (start and end)
		 * - 'multiple': Select multiple individual dates
		 */
		mode?: 'single' | 'range' | 'multiple';

		/**
		 * Locale for language and calendar system
		 * @default 'fa' (Persian/Farsi)
		 * @example locale="en" for English, locale="ar" for Arabic
		 * Multiple locales: locale="fa,en" (user can toggle)
		 */
		locale?: string;

		/**
		 * Whether to show a clear button for the input
		 * @default true
		 */
		clearable?: boolean;

		/**
		 * Disable specific dates, date ranges, or patterns
		 * @example
		 * // Disable specific dates
		 * disable={['1403/01/01', '1403/01/02']}
		 * // Disable with function
		 * disable={(date) => date.day() === 6} // Disable Fridays
		 */
		disable?: Disable;

		/**
		 * Custom locale configuration to override defaults
		 * @example locale_config={{fa: {months: ['Jan', 'Feb', ...]}}}
		 */
		locale_config?: RecursivePartial<Langs>;

		/**
		 * Custom CSS styles to apply to the component
		 * @example styles={{input: {backgroundColor: '#f0f0f0'}}}
		 */
		styles?: Styles;

		/**
		 * Pre-defined color theme for the datepicker
		 * @default undefined (uses default theme)
		 */
		color?: 'primary' | 'blue' | 'red' | 'pink' | 'orange' | 'green' | 'purple' | 'gray';

		/**
		 * Use separate input fields for range selection (from/to inputs)
		 * @default false
		 * Only applicable when mode="range"
		 */
		dual_input?: boolean;

		/**
		 * Position the calendar icon inside the input field
		 * @default false
		 */
		icon_inside?: boolean;

		/**
		 * Enable shortcut buttons for quick date selection
		 * @default false
		 * @example
		 * shortcut={true} // Use default shortcuts
		 * shortcut={{'Today': [new PersianDate()], 'Yesterday': [new PersianDate().subDay()]}}
		 */
		shortcut?: boolean | Shortcuts;
	}

	// Type alias for internal use - this helps TypeScript understand the component's props
	type Props = DatePickerProps;
	type $$Props = Props;

	let {
		select: onSelect = () => {},
		submit: onSubmit = () => {},
		clear: onClear = () => {},
		open: onOpen = () => {},
		close: onClose = () => {},
		model: modelValueProp = $bindable(),
		format: formatProp,
		input_format: inputFormatProp,
		display_format: displayFormatProp,
		input_calendar: inputCalendarProp = 'auto',
		type: typeProp = 'date',
		from: fromProp = typeProp === 'time' ? undefined : new Date('1921-03-22'), // Persian year 1300
		to: toProp = typeProp === 'time' ? undefined : new Date('2051-03-21'), // Persian year 1430
		show: showProp = false,
		click_on: clickOnProp = 'all',
		modal: modalProp = false,
		label: labelProp = '',
		column: columnProp = 1,
		auto_submit: autoSubmitProp = true,
		mode: modeProp = 'single',
		locale: localeProp = 'fa',
		clearable: clearableProp = true,
		disable: disableProp,
		locale_config: localeConfigProp,
		styles: stylesProp,
		color: colorProp,
		dual_input: dualInputProp = false,
		icon_inside: iconInsideProp = false,
		shortcut: shortcutProp = false,
		...restAttrs
	}: Props & HTMLInputAttributes = $props();

	// ====================================================================
	// REACTIVE STATE VARIABLES
	// Core component state that drives the datepicker behavior
	// ====================================================================

	/** Core PersianDate instance for calendar operations and current time */
	let coreState = $state(new PersianDate());

	/** Currently displayed month/year in the calendar view */
	let onDisplayState: PersianDate | undefined = $state();

	/** Array of selected dates (handles single, range, and multiple modes) */
	let selectedDatesState: PersianDate[] = $state([]);

	/** Currently hovered date for range selection preview */
	let hoveredDateState: PersianDate | undefined = $state();

	/** Array of selected times (for datetime and time types) */
	let selectedTimesState: PersianDate[] = $state([]);

	/** Controls visibility of the datepicker popup */
	let showDatePickerState = $state(false);

	$effect(() => {
		if (!showDatePickerState) {
			hoveredDateState = undefined;
		}
	});

	/** Controls visibility of year selection dropdown */
	let showYearSelectState = $state(false);

	/** Controls visibility of month selection dropdown */
	let showMonthSelectState = $state(false);

	/** Display values for input fields (formatted strings) */
	let displayValueState: string[] = $state([]);

	/** Currently focused input field ('firstInput' | 'secondInput') */
	let inputNameState: Inputs = $state('firstInput');

	/** Position calculations for datepicker popup placement */
	let pickerPlaceState: PickerPlace = $state({} as PickerPlace);

	/** Fixed pixel coordinates for the picker popup — escapes ancestor stacking contexts */
	let pickerFixedPos: { top: number; left: number } = $state({ top: 0, left: 0 });

	/** Current window width for responsive column calculations */
	let documentWidthState = $state(typeof window !== 'undefined' ? window.innerWidth : Infinity);

	/** Current active locale from the comma-separated locale prop */
	let currentLocaleState = $state('fa');

	/** SSR-safe browser detection flag */
	const browser = typeof window !== 'undefined';

	$effect(() => {
		const localeArray = localeProp.split(',');
		const index = localeArray.indexOf(currentLocaleState);
		// If current locale is in the new array, keep it; otherwise use first locale
		currentLocaleState = (index >= 0 ? localeArray[index] : localeArray[0]) || 'fa';
	});

	/** Copy of selected dates that have been submitted/confirmed */
	let submitedValueState: PersianDate[] = $state([]);

	// ====================================================================
	// COMPONENT REFERENCES AND INTERVALS
	// DOM references and timer management for the component
	// ====================================================================

	/** Core language configuration object from the Persian date library */
	let langs = Core.langs;

	/** Interval reference for time picker increment/decrement operations */
	let interval: ReturnType<typeof setInterval> | null = $state(null);

	/** Reference to the main datepicker popup element */
	let pdpPicker: HTMLElement | undefined = $state();

	/** Reference to the main calendar container element */
	let pdpMain = $state();

	/** Reference to the year selection dropdown element */
	let pdpSelectYear: HTMLElement | undefined = $state();

	/** Array of input element references (for single or dual input modes) */
	let inputsElement: (HTMLInputElement | undefined)[] = $state([]);

	/** Reference to the root component element */
	let rootElement: HTMLElement;

	// ====================================================================
	// DERIVED REACTIVE VALUES
	// Computed values that update automatically based on state changes
	// ====================================================================

	/** Current language configuration based on active locale */
	let lang: Langs[string] = $derived(langs[currentLocaleState]);

	/**
	 * Determines which calendar system to use for input display and parsing
	 * Based on input_calendar prop - 'auto' uses the language's default calendar
	 */
	let inputDisplayCalendar = $derived.by((): string => {
		if (inputCalendarProp === 'auto') {
			return lang.calendar;
		}
		return inputCalendarProp;
	});

	/** Array of input field names - single input or dual inputs for range mode */
	let inputs: Inputs[] = $derived(dualInputProp ? ['firstInput', 'secondInput'] : ['firstInput']);

	/**
	 * Default date range configuration for validation and boundaries
	 * Handles both Date objects and undefined values for time type
	 */
	let defaultDate = $derived({
		from:
			typeProp === 'time'
				? fromProp
					? safePersianDate(fromProp).toString('HH:mm')
					: '00:00'
				: fromProp
					? safePersianDate(fromProp)
					: new PersianDate().parse('1300/01/01'),
		to:
			typeProp === 'time'
				? toProp
					? safePersianDate(toProp).toString('HH:mm')
					: '23:59'
				: toProp
					? safePersianDate(toProp)
					: new PersianDate().parse('1430/01/01')
	});

	/** Minimum selectable date/time boundary */
	let fromDateState: PersianDate = $state(new PersianDate());

	/** Maximum selectable date/time boundary */
	let toDateState: PersianDate = $state(new PersianDate());

	/**
	 * Initialize date boundaries based on from/to props and current core state
	 * Updates whenever defaultDate, lang, or related dependencies change
	 */
	$effect(() => {
		if (typeProp === 'time') {
			// For time type, use current date with time boundaries
			const currentDate = coreState.toString('jYYYY/jMM/jDD');
			fromDateState = coreState
				.clone()
				.parse(currentDate + ' ' + defaultDate.from)
				.calendar(lang.calendar);
			toDateState = coreState
				.clone()
				.parse(currentDate + ' ' + defaultDate.to)
				.calendar(lang.calendar);
		} else {
			// For date/datetime type, use the PersianDate objects directly
			fromDateState = (
				defaultDate.from instanceof PersianDate ? defaultDate.from.clone() : coreState.clone()
			).calendar(lang.calendar);
			toDateState = (
				defaultDate.to instanceof PersianDate ? defaultDate.to.clone() : coreState.clone()
			)
				.endOf('date') // Default to end of day for Date objects
				.calendar(lang.calendar);
		}
	});

	// ====================================================================
	// COMPONENT INITIALIZATION
	// Setup and initialization logic when component mounts
	// ====================================================================

	onMount(() => {
		if (!browser) return;

		// Apply theme colors and custom styles to root element
		Core.setColor(colorProp, rootElement as HTMLElement);
		Core.setStyles(stylesProp, rootElement as HTMLElement);

		// Initialize component with model value if provided
		const val = modelValueProp as string | string[];
		if (val && (typeof val === 'string' || (Array.isArray(val) && val.length > 0))) {
			setDate(val);
		} else {
			// Set default display to today if no model value provided or empty array
			const today = () => coreState.clone();
			if (typeProp == 'date') today().startOf('date');
			if (checkDate(today(), 'date')) {
				onDisplayState = today();
			} else {
				// If today is not valid, use nearest valid date
				onDisplayState = nearestDate(today()).startOf('date');
			}
		}

		// Setup responsive window resize listener for column calculations
		window.addEventListener('resize', () => {
			documentWidthState = window.innerWidth;
		});

		// For time-based pickers, sync display with current time
		if (typeProp != 'date') {
			onDisplayState!.time(coreState as PersianDate);
		}
	});

	// ====================================================================
	// ATTRIBUTE CONFIGURATION
	// Dynamic attribute generation for different UI elements
	// ====================================================================

	/**
	 * Generates dynamic attributes for various UI elements (inputs, labels, etc.)
	 * Processes custom attributes passed via props and applies styling classes
	 */
	let attrs = $derived.by((): Attrs => {
		const attrsLocal: Attrs = {
			div: { class: 'pdp-group' },
			label: { class: 'pdp-label' },
			alt: {},
			picker: { class: 'pdp-picker' },
			firstInput: { class: 'pdp-input' },
			secondInput: { class: 'pdp-input' }
		};

		// Process custom attributes with prefixes (e.g., div-class, input-placeholder)
		for (const [key, value] of Object.entries(restAttrs)) {
			const match = key.match(/(div|label|alt|picker|firstInput|secondInput)-(.*)/);
			if (match) {
				const [, group, attr] = match as [string, keyof Attrs, string];
				if (attr === 'class' && attrsLocal[group][attr]) {
					attrsLocal[group][attr] += ` ${value}`;
				} else {
					attrsLocal[group][attr] = value as string;
				}
			} else {
				// Default attributes go to firstInput
				if (key === 'class' && attrsLocal.firstInput.class) {
					// Don't append to firstInput class if it's the main class prop
					// as it's already handled on the root div
				} else {
					attrsLocal.firstInput[key] = value as string;
				}
			}
		}

		// Apply picker positioning and direction classes
		const pickerClasses = ['pdp-picker'];
		if (pickerPlaceState.top) pickerClasses.push('pdp-top');
		if (pickerPlaceState.left) pickerClasses.push('pdp-left');
		if (pickerPlaceState.right) pickerClasses.push('pdp-right');
		pickerClasses.push(lang.dir.picker);
		attrsLocal.picker.class = pickerClasses.join(' ');

		// Apply fixed-position coordinates so the picker escapes any parent stacking context
		if (!modalProp) {
			const existingStyle = (attrsLocal.picker.style as string) || '';
			const posStyle = `top: ${pickerFixedPos.top}px; left: ${pickerFixedPos.left}px;`;
			attrsLocal.picker.style = existingStyle ? `${existingStyle} ${posStyle}` : posStyle;
		}

		// For single mode with dual input, disable second input
		if (modeProp == 'single' && dualInputProp) {
			attrsLocal['secondInput'].disabled = 'disabled';
		}

		// Add focus class to active input when picker is open
		if (showDatePickerState) {
			attrsLocal[inputNameState].class += ' pdp-focus';
		}

		return attrsLocal;
	});

	// ====================================================================
	// DATE FORMAT CONFIGURATION
	// Handles different date formats for model, input, and display
	// ====================================================================

	/**
	 * Configures date formats for different purposes:
	 * - model: Always Gregorian for consistent data storage
	 * - input: Calendar-specific for user input parsing
	 * - display: Calendar-specific for UI presentation
	 * - alt: For alternative/hidden inputs
	 */
	const formats = $derived.by((): Formats => {
		// Default display formats for different picker types
		const displayFormatLocal: Obj<string, TypePart | 'datetime'> = {
			date: '?D ?MMMM',
			datetime: '?D ?MMMM HH:mm',
			time: 'HH:mm'
		};

		// Model format is always Gregorian for consistent data handling
		const gregorianFormatLocal: Obj<string, TypePart | 'datetime'> = {
			date: 'YYYY-MM-DD',
			datetime: 'YYYY-MM-DD HH:mm',
			time: 'HH:mm'
		};

		// Input format changes based on calendar type for display purposes
		let inputFormat: string;
		let displayFormat = displayFormatProp || lang.displayFormat || displayFormatLocal[typeProp];

		// Always determine input format based on inputDisplayCalendar unless explicitly overridden
		if (inputFormatProp) {
			// If explicitly provided, use it as-is
			inputFormat = inputFormatProp;
		} else {
			// Determine format based on the calendar we want to display
			if (currentLocaleState === 'ar') {
				// Arabic locale uses Hijri-style display but jalali calendar internally
				const hijriInputFormatLocal: Obj<string, TypePart | 'datetime'> = {
					date: 'jYYYY/jMM/jDD',
					datetime: 'jYYYY/jMM/jDD HH:mm',
					time: 'HH:mm'
				};
				inputFormat = hijriInputFormatLocal[typeProp];
			} else if (inputDisplayCalendar === 'jalali') {
				// Persian calendar input format
				const jalaliInputFormatLocal: Obj<string, TypePart | 'datetime'> = {
					date: 'jYYYY/jMM/jDD',
					datetime: 'jYYYY/jMM/jDD HH:mm',
					time: 'HH:mm'
				};
				inputFormat = jalaliInputFormatLocal[typeProp];
			} else {
				// Gregorian calendar input format
				inputFormat = gregorianFormatLocal[typeProp];
			}
		}

		// Set calendar-specific display formats if not explicitly provided
		if (!displayFormat) {
			if (currentLocaleState === 'ar') {
				const hijriDisplayFormatLocal: Obj<string, TypePart | 'datetime'> = {
					date: '?jD ?MMMM ?jYYYY',
					datetime: '?jD ?MMMM ?jYYYY HH:mm',
					time: 'HH:mm'
				};
				displayFormat = hijriDisplayFormatLocal[typeProp];
			} else if (lang.calendar === 'jalali') {
				const jalaliDisplayFormatLocal: Obj<string, TypePart | 'datetime'> = {
					date: '?jD ?jMMMM ?jYYYY',
					datetime: '?jD ?jMMMM ?jYYYY HH:mm',
					time: 'HH:mm'
				};
				displayFormat = jalaliDisplayFormatLocal[typeProp];
			} else {
				displayFormat = displayFormatLocal[typeProp];
			}
		}

		return {
			model: formatProp || gregorianFormatLocal[typeProp], // Always Gregorian for model
			input: inputFormat, // Calendar-specific for display
			display: displayFormat, // Calendar-specific for display
			alt: (attrs.alt.format as string) || formatProp || gregorianFormatLocal[typeProp]
		};
	});

	const years = $derived.by((): number[] => {
		let start: number = fromDateState!.year();
		const end: number = toDateState!.year();
		return Array(end - start + 1)
			.fill(null)
			.map(() => start++);
	});

	let columnCountDerived = $derived.by((): number => {
		let columnLocal = 2;
		if (Core.isNumber(columnProp)) {
			columnLocal = columnProp as number;
		} else {
			const breakpoint = Object.keys(columnProp)
				.sort((a, b) => +a - +b)
				.find((bp) => documentWidthState <= +bp);
			if (breakpoint) columnLocal = (columnProp as Obj)[breakpoint] as number;
		}
		if (typeProp.includes('time')) {
			const scale = columnLocal / (modeProp == 'range' ? 2 : 1);
			if (browser && rootElement) {
				(rootElement as HTMLElement).style.setProperty(
					'--time-scale',
					(scale > 1 ? scale : 1) + ''
				);
			}
		}
		return columnLocal;
	});

	let monthDays = $derived.by((): MonthDays[][] => {
		if (!onDisplayState) return [];
		const monthsLocal: MonthDays[][] = [];
		for (let i = 0; i < columnCountDerived; i++) {
			let emptyCells;
			const selectedYear = onDisplayState!.clone().addMonth(i).year();
			const selectedMonth = onDisplayState!.clone().addMonth(i).month();
			emptyCells = +onDisplayState!.clone().parse(selectedYear, selectedMonth, 1).toString('?d');
			let daysOfMonthNumber = onDisplayState!.getDaysInMonth(selectedYear, selectedMonth);
			const numberOfWeek = Math.ceil((daysOfMonthNumber + emptyCells) / 7);
			const monthLocal: MonthDays[] = [];
			let showDay = 1;
			for (let week = 0; week < numberOfWeek; week++) {
				monthLocal[week] = [];
				for (let day = 0; day < 7; day++) {
					if (emptyCells) {
						monthLocal[week][day] = { empty: true };
						--emptyCells;
					} else if (daysOfMonthNumber) {
						monthLocal[week][day] = {
							friday: day == 6,
							raw: onDisplayState!.clone().addMonth(i).date(showDay),
							startRange:
								selectedDatesState[0] &&
								selectedDatesState[0].isSame(selectedYear, selectedMonth, showDay),
							endRange:
								(selectedDatesState[1] &&
									selectedDatesState[1].isSame(selectedYear, selectedMonth, showDay)) ||
								(modeProp === 'range' &&
									selectedDatesState.length === 1 &&
									hoveredDateState &&
									hoveredDateState.isSame(selectedYear, selectedMonth, showDay)),
							inRange:
								(selectedDatesState.length == 2 &&
									coreState
										.clone()
										.parse(selectedYear, selectedMonth, showDay)
										.isBetween(
											...(selectedDatesState.map((date) => date.toString()) as [string, string])
										)) ||
								(modeProp === 'range' &&
									selectedDatesState.length === 1 &&
									hoveredDateState &&
									coreState
										.clone()
										.parse(selectedYear, selectedMonth, showDay)
										.isBetween(selectedDatesState[0].toString(), hoveredDateState.toString())),
							selected:
								modeProp === 'multiple' &&
								selectedDatesState.some((date) =>
									date.isSame(selectedYear, selectedMonth, showDay)
								),
							disabled:
								!checkDate(onDisplayState!.clone().addMonth(i).date(showDay), 'date') ||
								isInDisable(onDisplayState!.clone().addMonth(i).date(showDay)) ||
								(modeProp === 'range' &&
									selectedDatesState.length === 1 &&
									onDisplayState!
										.clone()
										.addMonth(i)
										.date(showDay)
										.isBefore(selectedDatesState[0])),
							today: coreState.clone().isSame(selectedYear, selectedMonth, showDay),
							val: showDay++
						};
						--daysOfMonthNumber;
					} else monthLocal[week][day] = { empty: true };
				}
			}
			monthsLocal.push(monthLocal);
		}
		return monthsLocal;
	});

	let months = $derived.by((): Months => {
		if (!onDisplayState) return {};
		const monthsLocal: Months = {};
		for (let i = 1; i <= 12; i++) {
			monthsLocal[i] = {
				label: lang.months[i - 1],
				selected: onDisplayState!.month() == i,
				disabled: !checkDate(onDisplayState!.clone().month(i), 'month')
			};
		}
		return monthsLocal;
	});

	let tabIndex = $derived.by((): number | undefined => {
		return +(attrs.secondInput.tabindex || attrs.firstInput.tabindex) + 1 || undefined;
	});

	let shortcuts = $derived.by((): Shortcuts | false => {
		if (!shortcutProp) {
			return false;
		}
		const shortcuts: Shortcuts = {};
		const part = typeProp.includes('date') ? 'date' : 'time';
		let d = coreState.clone().now();
		if (part == 'time' && !validate(d, part)) d = toDateState!.clone().subDay().now();

		const checkDate = (dates: PersianDate[]) => {
			return modeProp === 'single'
				? validate(dates[0], part)
				: dates.some((d) => validate(d, part)) &&
						!isDisableBetween(...(dates as [PersianDate, PersianDate]));
		};
		const setShortcut = (obj: Shortcuts, fromProps = false) => {
			for (const phrase in obj) {
				const dates = fromProps
					? obj[phrase].map((date: PersianDate) =>
							part == 'date' ? d.clone().fromJalali(date) : d.clone().time(date)
						)
					: obj[phrase];
				if (checkDate(dates)) {
					shortcuts[phrase] =
						typeProp == 'date' ? dates.map((d: PersianDate) => d.startOf('date')) : dates;
				}
			}
		};

		if (shortcutProp === true) {
			setShortcut(Core.getShortcuts(d, `${part}-${modeProp}`, lang.translations)!);
		} else {
			setShortcut(shortcutProp, true);
		}
		return shortcuts;
	});

	let nextLocale = $derived.by((): string => {
		const locales = localeProp.split(',');
		const index = locales.indexOf(currentLocaleState);
		const locale = locales[index + 1] || locales[0];
		return langs[locale].translations.label;
	});

	$effect(() => {
		if (browser && showYearSelectState) {
			tick().then(() => {
				const selectedEl = (pdpSelectYear as HTMLElement)?.querySelector('li.selected') as HTMLLIElement | null;
				if (selectedEl && pdpSelectYear) {
					(pdpSelectYear as HTMLElement).scroll({
						top: selectedEl.offsetTop,
						behavior: 'smooth'
					});
				}
			});
		}
	});

	$effect(() => {
		if (showDatePickerState) {
			onOpen(); // Call the onOpen callback prop
		} else {
			if (browser && !modalProp) {
				document.removeEventListener('scroll', locate, true);
			}
			onClose(); // Call the onClose callback prop
		}
	});

	$effect(() => {
		if (modeProp === 'single' && selectedDatesState.length === 2) {
			selectedDatesState.pop();
		}
	});

	$effect(() => {
		const oldLocaleArray = localeProp.split(','); // Simulate oldVal with current value
		const index = oldLocaleArray.indexOf(currentLocaleState);
		currentLocaleState = localeProp.split(',')[index];
	});

	$effect(() => {
		langs = Core.mergeObject(langs, localeConfigProp) as Record<string, any>;
	});

	$effect(() => {
		if (browser && rootElement) {
			Core.setStyles(stylesProp, rootElement);
		}
	});

	$effect(() => {
		if (browser && rootElement) {
			Core.setColor(colorProp, rootElement);
		}
	});

	/**
	 * Reacts to external changes in the model prop
	 * This ensures that if the parent component updates the model value,
	 * the datepicker's internal state is synchronized.
	 */
	$effect(() => {
		if (modelValueProp !== undefined) {
			const currentModel = selectedDatesState.map((el) => {
				const gregorianDate = el.clone().calendar('gregorian');
				return gregorianDate.toString(formats.model);
			});

			// Treat empty string / empty array as equivalent to no selection
			const modelIsEmpty =
				!modelValueProp || (Array.isArray(modelValueProp) && modelValueProp.length === 0);
			const currentIsEmpty = currentModel.length === 0;

			const isSame =
				modelIsEmpty && currentIsEmpty
					? true
					: Array.isArray(modelValueProp)
						? JSON.stringify(modelValueProp) === JSON.stringify(currentModel)
						: modelValueProp === currentModel[0];

			if (!isSame) {
				setDate(modelValueProp as string | string[]);
			}
		}
	});

	// ====================================================================
	// REACTIVE EFFECTS
	// Side effects that respond to state changes
	// ====================================================================

	/**
	 * Updates input display values when selected dates or display calendar changes
	 * Formats dates according to the configured input display calendar
	 */
	$effect(() => {
		if (selectedDatesState.length > 0) {
			const displayDate = selectedDatesState.map((el) => {
				// Use the configured input display calendar
				const calendarDate = el.clone().calendar(inputDisplayCalendar as 'jalali' | 'gregorian');
				return calendarDate.toString(formats.input);
			});
			if (dualInputProp) {
				displayValueState = displayDate;
			} else {
				if (modeProp === 'multiple') {
					displayValueState[0] = displayDate.join(', ');
				} else {
					displayValueState[0] = displayDate.join(' - ');
				}
			}
		}
	});

	// ====================================================================
	// MODEL AND VALUE MANAGEMENT FUNCTIONS
	// Functions that handle data binding and model updates
	// ====================================================================

	/**
	 * Updates the bindable model value with new date(s)
	 * @param date - The new date value(s) to set
	 */
	function updateValue(date: PersianDate | PersianDate[] | string | string[]) {
		modelValueProp = date; // Update the prop directly
	}

	// ====================================================================
	// CALENDAR NAVIGATION FUNCTIONS
	// Functions for navigating between months, years, and calendar views
	// ====================================================================

	/**
	 * Shows/toggles different calendar parts (month/year selection)
	 * @param part - Which calendar part to show ('month' | 'year')
	 */
	function showPart(part: CalendarPart) {
		if (part === 'year') {
			showMonthSelectState = false;
			showYearSelectState = !showYearSelectState;
		} else if (part === 'month') {
			showYearSelectState = false;
			showMonthSelectState = !showMonthSelectState;
		}
	}

	/**
	 * Changes the currently displayed month in the calendar
	 * @param month - Month to navigate to ('add'|'sub' for relative, number for absolute)
	 */
	function changeSelectedMonth(month: 'add' | 'sub' | number): void {
		if (month == 'add') {
			onDisplayState = onDisplayState?.clone().addMonth();
		} else if (month == 'sub') {
			onDisplayState = onDisplayState?.clone().subMonth();
		} else {
			onDisplayState = onDisplayState?.clone().month(month);
		}

		if (checkDate(onDisplayState, 'month')) {
			showMonthSelectState = false;
			// onDisplayState = onDisplayState?.clone();
		}
		//  else onDisplayState = onDisplayState?.clone();
	}

	/**
	 * Changes the currently displayed year in the calendar
	 * @param year - Year to navigate to (absolute value)
	 */
	function changeSelectedYear(year: number): void {
		const cloneLocal = onDisplayState!.clone();
		cloneLocal.year(year);

		if (!checkDate(onDisplayState, 'date'))
			onDisplayState = nearestDate(onDisplayState as PersianDate);
		showYearSelectState = false;
		onDisplayState = cloneLocal;
	}

	// ====================================================================
	// DATE VALIDATION AND CHECKING FUNCTIONS
	// Functions for validating dates against constraints and boundaries
	// ====================================================================

	/**
	 * Validates if a date is selectable (within bounds and not disabled)
	 * @param date - Date to validate
	 * @param part - Type of validation ('date' | 'time' | 'month' | 'year')
	 * @returns true if date is valid and selectable
	 */
	function validate(date: PersianDate, part: TypePart): boolean {
		if (!checkDate(date, part) || isInDisable(date)) return false;
		return true;
	}

	/**
	 * Checks if any dates between two dates are disabled (for range selection)
	 * @param first - Start date of range
	 * @param second - End date of range
	 * @returns true if any date in range is disabled
	 */
	function isDisableBetween(first: PersianDate, second: PersianDate): boolean {
		if (!disableProp) return false;
		if (typeProp != 'datetime' && Core.isString(disableProp)) {
			const date = typeProp == 'time' ? second.clone().time(disableProp as string) : disableProp;
			return coreState
				.clone()
				.parse(date as PersianDate | string)
				.isBetween(first.toString(), second.toString());
		} else if (
			typeProp != 'datetime' &&
			Array.isArray(disableProp) &&
			disableProp.some((date) => Core.isString(date))
		) {
			return disableProp.some((date) => {
				if (typeProp == 'time')
					date = second
						.clone()
						.time(date as string)
						.toString();
				return coreState
					.clone()
					.parse(date as string)
					.isBetween(first, second);
			});
		} else if (typeProp != 'time') {
			const inRangeDate = second.clone().startOf('date').subDay();
			while (!inRangeDate.isSameOrBefore(first)) {
				if (isInDisable(inRangeDate)) return true;
				inRangeDate.subDay();
			}
		}
		return false;
	}
	function selectDate(date: PersianDate, part: TypePart): number {
		let isValid = validate(date, part);
		if (!isValid) {
			return -1;
		} else if (modeProp == 'range' && selectedDatesState.length == 1) {
			isValid = !isDisableBetween(selectedDatesState[0] as PersianDate, date);
			if (!isValid) {
				return -2;
			}
		}
		if (typeProp == 'date') {
			date.startOf('date');
		}
		if (modeProp == 'single') {
			selectedDatesState = [date];
		} else if (modeProp == 'range') {
			if (selectedDatesState.length === 2) {
				selectedDatesState = [date];
				inputNameState = 'secondInput';
			} else if (selectedDatesState.length === 0) {
				selectedDatesState[0] = date;
				inputNameState = 'secondInput';
			} else if (inputNameState === 'secondInput') {
				inputNameState = 'firstInput';
				if (!date.isBefore(selectedDatesState[0] as PersianDate)) {
					selectedDatesState[1] = date;
				} else {
					selectedDatesState.unshift(date);
				}
			} else {
				selectedDatesState = [date];
				inputNameState = 'secondInput';
			}
			if (selectedDatesState.length == 2) {
				hoveredDateState = undefined;
			}
		} else if (modeProp == 'multiple') {
			// Check if date is already selected
			const existingIndex = selectedDatesState.findIndex((selectedDate) =>
				selectedDate.isSame(date, 'date')
			);

			if (existingIndex >= 0) {
				// Date is already selected, remove it (toggle off)
				selectedDatesState = selectedDatesState.filter((_, index) => index !== existingIndex);
			} else {
				// Date is not selected, add it
				selectedDatesState = [...selectedDatesState, date];
			}
		}

		if (typeProp == 'datetime') {
			selectedDatesState = selectedDatesState.map((d, i) => {
				if (selectedTimesState[i]) {
					d.time(selectedTimesState[i] as PersianDate);
				}
				selectedTimesState[i] = d;
				return d;
			});
		}

		onSelect!(date);
		if (
			autoSubmitProp &&
			(modeProp === 'single' || (modeProp === 'range' && selectedDatesState.length == 2))
		) {
			submitDate();
			return 1;
		}
		// For multiple selection or partial range selection, update the model but don't close the modal
		// The displayValueState is automatically updated by the $effect
		if (modeProp === 'multiple' || (modeProp === 'range' && selectedDatesState.length === 1)) {
			setModel();
		}
		return 0;
	}

	function setModel(date?: PersianDate | PersianDate[] | string | string[]): void {
		if (date === undefined) {
			date = selectedDatesState.map((el) => {
				// Always convert to Gregorian calendar for model value
				const gregorianDate = el.clone().calendar('gregorian');
				return gregorianDate.toString(formats.model);
			});
			if (modeProp == 'single') date = date[0];
		}
		updateValue(date);
	}

	function goToToday(): void {
		showMonthSelectState = showYearSelectState = false;
		onDisplayState = coreState.now().clone();
		if (typeProp.includes('time') && selectedDatesState.length) {
			const lastIndex = selectedDatesState.length - 1;
			const time = selectedDatesState[lastIndex];
			time.time(onDisplayState as PersianDate);
			if (selectedTimesState[lastIndex]) {
				selectedTimesState[lastIndex] = time.clone();
			}
			if (autoSubmitProp && checkDate(time, 'time') && !isInDisable(time as PersianDate))
				submitDate(false);
		}

		if (typeProp.includes('date'))
			tick().then(() => {
				document.querySelector('.pdp-day.today')!.classList.add('tada');
				setTimeout(() => {
					document.querySelector('.pdp-day.today')!.classList.remove('tada');
				}, 1000);
			});
	}

	function checkDate(date: unknown, part: CalendarPart | TypePart): boolean {
		let from, to;
		if (!Core.isPersianDate(date)) date = coreState.clone().parse(date as PersianDate);
		switch (part) {
			case 'year':
				from = fromDateState!.toString('?YYYY');
				to = toDateState!.toString('?YYYY');
				break;
			case 'month':
				from = fromDateState!.toString('?YYYY/?MM');
				to = toDateState!.toString('?YYYY/?MM');
				break;
			case 'date':
				from = fromDateState!.toString();
				to = toDateState!.toString();
				break;
			case 'time':
				from = fromDateState!.toString(typeProp.includes('time') ? 'datetime' : 'date');
				to = toDateState!.toString(typeProp.includes('time') ? 'datetime' : 'date');
				break;
		}
		return (date as PersianDate).isBetween(from, to, '[]');
	}

	function isInDisable(date: PersianDate, disable?: Disable): boolean {
		if (!disableProp) return false;
		disable = disable || disableProp;
		date = Core.isPersianDate(date) ? date.clone() : coreState.clone().parse(date);
		if (Core.isString(disable)) {
			if (typeProp == 'time') disable = date.toString() + ' ' + disable;
			return date.calendar('jalali').isSame(disable as string);
		} else if (disable instanceof RegExp) {
			const format = {
				date: 'jYYYY/jM/jD',
				datetime: 'jYYYY/jM/jD H:m',
				time: 'H:m'
			};
			return disable.test(date.toString(format[typeProp]));
		} else if (Core.isFunction(disable)) {
			return (disable as (date: PersianDate) => boolean)(date);
		} else if (Array.isArray(disable)) {
			return disable.some((val) => {
				if (Core.isString(val)) {
					if (typeProp == 'time') val = date.toString() + ' ' + val;
					return date.calendar('jalali').isSame(val as string);
				} else if (val instanceof RegExp) {
					const format = {
						date: 'jYYYY/jM/jD',
						datetime: 'jYYYY/jM/jD H:m',
						time: 'H:m'
					};
					return val.test(date.toString(format[typeProp]));
				}
			});
		} else {
			return false;
		}
	}

	function showPicker(el: 'icon' | 'input', index: 0 | 1): void {
		if (clickOnProp == 'all' || clickOnProp == el) {
			const inputName = inputs[index];
			if (dualInputProp) inputNameState = inputName;

			(inputsElement as HTMLElement[])[index].focus();

			showDatePickerState = true;
			if (!modalProp) {
				tick().then(() => {
					locate();
				});
				// capture:true catches scroll on any ancestor container, not just document
				document.addEventListener('scroll', locate, true);
			}
		}
	}

	async function selectWithArrow(e: KeyboardEvent): Promise<void> {
		const fakeOnDisplayState = onDisplayState!.clone();
		if (['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].includes(e.key)) {
			const arrow = {
				ArrowLeft: 1, // for left arrow must one day add in rtl picker
				ArrowUp: -7, // for up arrow must seven day subtract in rtl picker
				ArrowRight: -1, // for right arrow must one day subtract in rtl picker
				ArrowDown: 7 // for down arrow must seven day add in rtl picker
			};
			let numberOfDay = arrow[e.key as keyof typeof arrow];
			if (lang.dir.picker == 'ltr' && ['ArrowLeft', 'ArrowRight'].includes(e.key))
				numberOfDay = -numberOfDay;

			let focusedDay: HTMLElement | NodeListOf<HTMLElement> =
				document.querySelectorAll('.pdp .pdp-day.hover');
			if (!focusedDay.length) {
				focusedDay = document.querySelectorAll('.pdp .pdp-day.start-range,.pdp .pdp-day.end-range');
			}
			focusedDay = focusedDay[focusedDay.length - 1];
			if (focusedDay) {
				let column = getColumn(focusedDay);
				focusedDay.classList.remove('hover');
				const firstColumnMonth = fakeOnDisplayState!.toString();
				const focusedMonth = fakeOnDisplayState!.clone().addMonth(column);
				let nextElementValue: PersianDate | number = focusedMonth
					.date(focusedDay.innerText)
					.addDay(numberOfDay);

				if (!checkDate(nextElementValue, 'date')) return focusedDay.classList.add('hover');
				nextElementValue = (nextElementValue as PersianDate).date();

				column = focusedMonth.diff(firstColumnMonth, 'month');
				if (column < 0) {
					fakeOnDisplayState!.subMonth(columnCountDerived);
					column = columnCountDerived - 1;
				} else if (column >= columnCountDerived) {
					fakeOnDisplayState!.addMonth(columnCountDerived);
					column = 0;
				}
				onDisplayState = fakeOnDisplayState;
				await tick();

				focusedDay = document.querySelector(
					`.pdp .pdp-main .pdp-column[data-column='${column}'] .pdp-day[data-value='${nextElementValue}']`
				) as HTMLElement;
				focusedDay.classList.add('hover');
			} else {
				focusedDay = document.querySelector(
					'.pdp .pdp-day:not(.empty):not(.disabled)'
				) as HTMLElement;
				if (focusedDay) focusedDay.classList.add('hover');
				else {
					focusedDay = document.querySelector(
						`.pdp .pdp-main .pdp-column[data-column="0"] .pdp-day[data-value="${fromDateState!.date()}"]`
					) as HTMLElement;
					focusedDay.classList.add('hover');
				}
			}
			if (modeProp === 'range' && selectedDatesState.length == 1) {
				const column = getColumn(focusedDay);
				hoveredDateState = onDisplayState!
					.clone()
					.startOf('date')
					.addMonth(column as number)
					.date(focusedDay.innerText);
			}
		} else if (e.key == 'Enter') {
			// 13 is key code of Enter key
			e.preventDefault();
			const focusedDay = document.querySelector('.pdp .pdp-day.hover') as HTMLElement;

			if (focusedDay) {
				selectDate(
					onDisplayState!
						.clone()
						.addMonth(getColumn(focusedDay) || 0)
						.date(focusedDay.innerText),
					'date'
				);
			} else {
				let onDisplay;
				displayValueState.forEach((value, index) => {
					if (!value) return false;
					if (typeProp == 'time') {
						const time = value.split(/[/ -.,:\\]/);
						if (checkDate(coreState.clone(), 'time')) onDisplay = coreState.clone();
						else onDisplay = fromDateState!.clone();
						onDisplay.time(time as [string]);
					} else {
						// Parse the user input considering the input display calendar
						onDisplay = coreState
							.clone()
							.calendar(inputDisplayCalendar as 'jalali' | 'gregorian')
							.parse(value);
					}
					if (selectDate(onDisplay, 'time') === 0) {
						const diff = onDisplay.diff(onDisplayState as PersianDate, 'month');
						if (diff < 0 || diff >= columnCountDerived) onDisplayState = onDisplay.clone();
						displayValueState[index] = '';
					}
				});
			}
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function submitDate(close = true): void {
		// The displayValueState is now updated automatically by the $effect above
		// when selectedDatesState or inputDisplayCalendar changes

		submitedValueState = selectedDatesState.slice();
		setModel();

		onSubmit?.(modeProp === 'single' ? selectedDatesState[0] : selectedDatesState);

		if (close) {
			showDatePickerState = false;
		}
	}

	function getColumn({ parentNode }: HTMLElement): number | string {
		return (parentNode!.parentNode!.parentNode as HTMLElement).dataset.column!;
	}

	function nearestDate(date: PersianDate): PersianDate {
		return Math.abs(date.diff(fromDateState as PersianDate)) <=
			Math.abs(date.diff(toDateState as PersianDate))
			? fromDateState!.clone()
			: toDateState!.clone();
	}

	function locate(): void {
		pickerPlaceState = { top: false, left: false, right: false };
		tick().then(() => {
			const input = (inputsElement as HTMLElement[])[0];
			const picker = pdpPicker as HTMLElement;
			if (!input || !picker) return;

			const inputRect = input.getBoundingClientRect();
			const pickerRect = picker.getBoundingClientRect();
			const gap = 8;
			const margin = 8;

			// Vertical: prefer below, flip above only when there is not enough space below
			const spaceBelow = window.innerHeight - inputRect.bottom;
			const showAbove =
				spaceBelow < pickerRect.height + gap && inputRect.top > pickerRect.height + gap;

			let top = showAbove ? inputRect.top - pickerRect.height - gap : inputRect.bottom + gap;

			// Horizontal: align right edge for RTL, left edge for LTR
			let left = lang.dir.input === 'rtl' ? inputRect.right - pickerRect.width : inputRect.left;

			// Clamp to viewport
			left = Math.max(margin, Math.min(left, window.innerWidth - pickerRect.width - margin));
			top = Math.max(margin, Math.min(top, window.innerHeight - pickerRect.height - margin));

			pickerFixedPos = { top, left };
			pickerPlaceState = {
				top: showAbove,
				left: left <= margin,
				right: left + pickerRect.width >= window.innerWidth - margin
			};
		});
	}

	function changeLocale(): void {
		const locales = localeProp.split(',');
		const index = locales.indexOf(currentLocaleState);
		currentLocaleState = locales[index + 1] || locales[0];
		const calendar = lang.calendar;

		coreState = coreState.clone().calendar(calendar);
		fromDateState = fromDateState.clone().calendar(calendar);
		toDateState = toDateState.clone().calendar(calendar);
		onDisplayState = onDisplayState?.clone().calendar(calendar);

		for (const date of selectedDatesState) {
			date.calendar(calendar);
		}
		submitDate(false);
	}

	function clear(inputName: Inputs): void {
		const inputIndex = inputName === 'firstInput' ? 0 : 1;

		displayValueState[inputIndex] = '';
		onClear!();

		if (dualInputProp) {
			const values = (restAttrs as any).value;
			if (values && Array.isArray(values))
				return setModel(values.map((val, i) => (i == inputIndex ? null : val)));
		}
		setModel('');
	}

	function startChangeTime(timeIndex: number, unit: 'minute' | 'hour', operator: 'add' | 'sub') {
		let time = selectedTimesState[timeIndex];
		if (!time) {
			time = coreState.clone();
			if (!checkDate(time, 'time')) {
				time = toDateState!
					.clone()
					.subDay()
					.time(coreState as PersianDate);
			}
			if (timeIndex == 1 && !selectedTimesState.length) selectedTimesState.push(time.clone());
			selectedTimesState.push(time);
		}
		stopChangeTime();

		// extra for svelte
		const fakeselectedTimesState = selectedTimesState.map((t) => t.clone());

		const maxAmount = unit == 'hour' ? 23 : 59;
		let currentAmount = time[unit]();

		const changeTime = () => {
			if (operator == 'add') {
				currentAmount++;
				if (currentAmount > maxAmount) currentAmount = 0;
			} else {
				currentAmount--;
				if (currentAmount < 0) currentAmount = maxAmount;
			}

			// Clone time and apply the change
			const newTime = time.clone();
			newTime[unit](currentAmount);

			if (!checkDate(newTime, 'time')) {
				newTime.parse(
					newTime.isSameOrAfter(toDateState!.clone())
						? toDateState!.clone()
						: fromDateState!.clone()
				);
			} else if (
				selectedTimesState.length == 2 &&
				selectedTimesState[0].isAfter(selectedTimesState[1] as PersianDate)
			) {
				newTime.parse(
					(timeIndex == 0 ? selectedTimesState[1] : selectedTimesState[0]) as PersianDate
				);
			}
			// Assign the new time to trigger reactivity
			selectedTimesState[timeIndex] = newTime;

			if (!isInDisable(newTime as PersianDate)) {
				if (typeProp == 'time') {
					selectedDatesState[timeIndex] = newTime;
				} else if (selectedDatesState[timeIndex]) {
					selectedDatesState[timeIndex] = selectedDatesState[timeIndex].time(
						newTime as PersianDate
					);
				}

				onSelect?.(newTime);
				if (
					autoSubmitProp &&
					!selectedTimesState.some((sTime) => isInDisable(sTime as PersianDate))
				)
					submitDate(false);
			}
		};
		changeTime();
		interval = setInterval(changeTime, 200);
	}

	function stopChangeTime() {
		clearInterval(interval!);
	}

	function selectShorcut(dates: PersianDate[]) {
		selectedDatesState = dates.map((date, i) => {
			if (i == 0) onDisplayState = date.clone();

			onSelect?.(date);
			return date.clone();
		});
		if (autoSubmitProp) {
			submitDate();
		}
	}

	function setDate(dates: string | string[]) {
		if (dates === undefined || dates === null) return;

		// Empty string or empty array — clear all internal state
		if (!dates || (Array.isArray(dates) && dates.length === 0)) {
			selectedDatesState = selectedTimesState = submitedValueState = [];
			displayValueState = inputs.map(() => '');
			return;
		}

		// Ensure dates is an array for processing
		let datesArray: string[];
		if (typeof dates === 'string') {
			datesArray = [dates];
		} else if (Array.isArray(dates)) {
			datesArray = dates;
		} else {
			// If it's not a string or array, it's invalid data for the model
			console.warn('DatePicker: Invalid model value provided. Expected string or string[].', dates);
			return;
		}

		selectedDatesState = [];

		datesArray.some((d, index) => {
			if (typeof d !== 'string') return false;
			const date = coreState
				.clone()
				.fromGregorian((typeProp == 'time' ? coreState.toString('YYYY-MM-DD') + ' ' : '') + d);

			if (Core.isPersianDate(date)) {
				selectedDatesState.push(date.clone());
				selectedTimesState.push(date.clone());
				if (index == 0) onDisplayState = date.clone();
			} else {
				selectedDatesState = selectedTimesState = [];
				return true;
			}
		});

		// Update the model and submitted state, displayValueState will be updated by the reactive effect
		if (selectedDatesState.length) {
			submitedValueState = selectedDatesState.slice();
			setModel();
		}
	}
</script>

<div
	bind:this={rootElement}
	class="pdp {lang.dir.input} {modeProp === 'range' ? 'pdp-range' : ''} {modeProp === 'multiple'
		? 'pdp-multiple'
		: ''} {modalProp ? 'pdp-modal' : ''} {dualInputProp ? 'pdp-dual' : ''}"
>
	{#if labelProp}
		<label for={attrs.firstInput.id} {...attrs.label}>
			{labelProp}
		</label>
	{/if}

	<div {...attrs.div}>
		{#each inputs as input, index}
			<div
				role="button"
				tabindex="0"
				class="pdp-icon"
				class:pdp-pointer={['all', 'icon'].includes(clickOnProp)}
				class:pdp-inside={iconInsideProp}
				aria-label={lang.translations.selectDates}
				onclick={() => showPicker('icon', index as 0 | 1)}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						showPicker('icon', index as 0 | 1);
					}
				}}
			>
				<PDPIcon icon={typeProp} width="1em" height="1em" />
			</div>

			<input
				bind:this={inputsElement[index]}
				bind:value={displayValueState[index]}
				type="text"
				autocomplete="off"
				{...attrs[input]}
				onfocus={() => showPicker('input', index as 0 | 1)}
				onclick={() => showPicker('input', index as 0 | 1)}
				onkeydown={selectWithArrow}
			/>

			{#if clearableProp}
				<button
					class="pdp-clear"
					type="button"
					onclick={() => clear(input)}
					aria-label="Clear date"
				>
					<PDPIcon icon="clear" />
				</button>
			{/if}
		{/each}
	</div>

	{#if attrs.alt.name}
		<PDPAlt name={attrs.alt.name} format={formats.alt} dates={submitedValueState} />
	{/if}

	{#if showDatePickerState}
		<div>
			<button
				type="button"
				class="pdp-overlay"
				aria-label="Close datepicker"
				onclick={() => (showDatePickerState = false)}
			></button>
			<div {...attrs.picker} bind:this={pdpPicker}>
				<div class="pdp-auto">
					{#if typeProp.includes('date')}
						{#if showMonthSelectState}
							<ul class="pdp-select-month">
								{#each Object.values(months) as month, index}
									<li class:selected={month.selected} class:disabled={month.disabled}>
										<button onclick={() => changeSelectedMonth(index + 1)}>
											{month.label}
										</button>
									</li>
								{/each}
							</ul>
						{/if}

						{#if showYearSelectState}
							<ul class="pdp-select-year" bind:this={pdpSelectYear}>
								{#each years as year}
									<li
										class:selected={onDisplayState!.year() === year}
										class:disabled={!checkDate(year, 'year')}
									>
										<button
											type="button"
											onclick={() => changeSelectedYear(year)}
											aria-label={`Select year ${year}`}
										>
											{year}
										</button>
									</li>
								{/each}
							</ul>
						{/if}
					{/if}

					{#if typeProp.includes('date')}
						<div class="pdp-header">
							{#if localeProp.includes(',')}
								<div class="top">
									<div>{lang.translations.text}</div>
									<button type="button" tabindex={tabIndex} onclick={changeLocale}>
										{nextLocale}
									</button>
								</div>
							{/if}

							<div class="bottom">
								<button
									class="pdp-arrow"
									class:disabled={!checkDate(onDisplayState!.clone().subMonth(), 'month')}
									title={lang.translations.prevMonth}
									aria-label={lang.translations.prevMonth}
									onclick={() => changeSelectedMonth('sub')}
								>
									<PDPArrow
										direction="right"
										inverse={lang.dir.picker === 'ltr'}
										width={10}
										height={10}
									/>
								</button>

								<div aria-live="polite" aria-atomic="true">
									{#each Array(columnCountDerived) as _, i}
										<div>
											<button
												class="pdp-month"
												type="button"
												onclick={() => showPart('month')}
												tabindex="-1"
												aria-label={lang.translations.text +
													': ' +
													months[onDisplayState!.clone().addMonth(i).month()].label}
											>
												{months[onDisplayState!.clone().addMonth(i).month()].label}
											</button>
											<button
												class="pdp-year"
												type="button"
												onclick={() => showPart('year')}
												tabindex="-1"
												aria-label={`${lang.translations.text}: year ${onDisplayState!.clone().addMonth(i).year()}`}
											>
												{onDisplayState!.clone().addMonth(i).year()}
											</button>
										</div>
									{/each}
								</div>

								<button
									class="pdp-arrow"
									class:disabled={!checkDate(onDisplayState!.clone().addMonth(), 'month')}
									title={lang.translations.nextMonth}
									aria-label={lang.translations.nextMonth}
									onclick={() => changeSelectedMonth('add')}
								>
									<PDPArrow direction="left" inverse={lang.dir.picker === 'ltr'} />
								</button>
							</div>
						</div>
					{/if}

					<div class="pdp-main" bind:this={pdpMain}>
						{#if typeProp.includes('date')}
							<div class="pdp-date">
								{#each Array(columnCountDerived) as _, i}
									<div class="pdp-column" data-column={i}>
										<div class="pdp-week" role="row">
											<!-- week days above -->
											{#each lang.weekdays as weekday}
												<div class="pdp-weekday" role="columnheader" aria-label={weekday}>
													{weekday}
												</div>
											{/each}
										</div>

										<div class="pdp-days" role="grid" aria-label={lang.translations.text}>
											{#each monthDays[i] as week, wIndex}
												<div role="row">
													{#each week as any[] as day, dIndex}
														{#if day}
															<div
																class="pdp-day"
																role="gridcell"
																tabindex={!day.empty && !day.disabled ? 0 : -1}
																class:tada={null}
																class:empty={day.empty}
																class:friday={day.friday}
																class:today={day.today}
																class:start-range={day.startRange}
																class:end-range={day.endRange}
																class:selected={day.selected}
																class:disabled={day.disabled}
																class:in-range={day.inRange}
																class:hover={day.hover}
																onclick={() =>
																	!day.empty &&
																	!day.disabled &&
																	day.raw &&
																	selectDate(day.raw, 'date')}
																onkeydown={(e) => {
																	if (
																		(e.key === 'Enter' || e.key === ' ') &&
																		!day.empty &&
																		!day.disabled &&
																		day.raw
																	) {
																		e.preventDefault();
																		selectDate(day.raw, 'date');
																	}
																}}
																onmouseenter={() =>
																	!day.empty &&
																	!day.disabled &&
																	day.raw &&
																	(hoveredDateState = day.raw)}
																onmouseleave={() => (hoveredDateState = undefined)}
																aria-selected={day.selected ? 'true' : undefined}
																aria-disabled={day.disabled || day.empty ? 'true' : undefined}
																aria-current={day.today ? 'date' : undefined}
																aria-label={day.val
																	? `${months[onDisplayState!.clone().addMonth(i).month()].label} ${day.val}`
																	: 'Empty'}
																data-value={day.val}
															>
																{day.val}
															</div>
														{/if}
													{/each}
												</div>
											{/each}
										</div>
									</div>
								{/each}
							</div>
						{/if}

						{#if typeProp.includes('time')}
							<div class="pdp-time inline">
								<div
									class="pdp-moment"
									class:column-direction={modeProp === 'range' && columnCountDerived === 1}
								>
									{#each Array(modeProp === 'range' ? 2 : 1) as _, i}
										<div
											class:disabled={selectedTimesState[i] &&
												(!checkDate(selectedTimesState[i], 'time') ||
													isInDisable(selectedTimesState[i]))}
										>
											<div class="hour">
												<button
													type="button"
													ontouchstart={(e) => {
														e.preventDefault();
														startChangeTime(i, 'hour', 'add');
													}}
													onmousedown={(e) => {
														e.preventDefault();
														startChangeTime(i, 'hour', 'add');
													}}
													onkeydown={(e) => {
														e.preventDefault();
														startChangeTime(i, 'hour', 'add');
													}}
													ontouchend={stopChangeTime}
													onmouseup={stopChangeTime}
													onkeyup={stopChangeTime}
												>
													<PDPArrow />
												</button>
												{selectedTimesState[i]
													? selectedTimesState[i].hour('HH')
													: coreState.hour('HH')}
												<button
													type="button"
													ontouchstart={(e) => {
														e.preventDefault();
														startChangeTime(i, 'hour', 'sub');
													}}
													onmousedown={(e) => {
														e.preventDefault();
														startChangeTime(i, 'hour', 'sub');
													}}
													onkeydown={(e) => {
														e.preventDefault();
														startChangeTime(i, 'hour', 'sub');
													}}
													ontouchend={stopChangeTime}
													onmouseup={stopChangeTime}
													onkeyup={stopChangeTime}
												>
													<PDPArrow direction="down" />
												</button>
											</div>
											:
											<div class="minute">
												<button
													type="button"
													ontouchstart={(e) => {
														e.preventDefault();
														startChangeTime(i, 'minute', 'add');
													}}
													onmousedown={(e) => {
														e.preventDefault();
														startChangeTime(i, 'minute', 'add');
													}}
													onkeydown={(e) => {
														e.preventDefault();
														startChangeTime(i, 'minute', 'add');
													}}
													ontouchend={stopChangeTime}
													onmouseup={stopChangeTime}
													onkeyup={stopChangeTime}
												>
													<PDPArrow />
												</button>
												{selectedTimesState[i]
													? selectedTimesState[i].minute('mm')
													: coreState.minute('mm')}
												<button
													type="button"
													ontouchstart={(e) => {
														e.preventDefault();
														startChangeTime(i, 'minute', 'sub');
													}}
													onmousedown={(e) => {
														e.preventDefault();
														startChangeTime(i, 'minute', 'sub');
													}}
													onkeydown={(e) => {
														e.preventDefault();
														startChangeTime(i, 'minute', 'sub');
													}}
													ontouchend={stopChangeTime}
													onmouseup={stopChangeTime}
													onkeyup={stopChangeTime}
												>
													<PDPArrow direction="down" />
												</button>
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>

					<div class="pdp-footer">
						<div>
							{#if modeProp === 'multiple'}
								{#if selectedDatesState.length > 0}
									<small
										>{selectedDatesState.length}
										{lang.translations.daysSelected || 'days selected'}</small
									>
								{:else}
									<small>{lang.translations.selectDates || 'Select dates'}</small>
								{/if}
							{:else}
								{#if selectedDatesState[0]}
									<small>{selectedDatesState[0].toString(formats.display)}</small>
								{/if}
								{#if selectedDatesState.length === 2}
									<small> - {selectedDatesState[1].toString(formats.display)}</small>
								{/if}
							{/if}
						</div>
						<div>
							{#if checkDate(coreState, 'date')}
								<button class="pdp-today" tabindex={tabIndex} onclick={goToToday}>
									{lang.translations.now}
								</button>
							{/if}
							{#if modeProp === 'multiple'}
								{#if selectedDatesState.length > 0}
									<button class="pdp-submit" tabindex={tabIndex} onclick={() => submitDate()}>
										{lang.translations.confirm || 'Confirm'} ({selectedDatesState.length})
									</button>
								{/if}
								<button
									class="pdp-cancel"
									tabindex={tabIndex}
									onclick={() => (showDatePickerState = false)}
								>
									{lang.translations.cancel || 'Cancel'}
								</button>
							{:else if !autoSubmitProp && !selectedDatesState.some((date) => isInDisable(date))}
								<button class="pdp-submit" tabindex={tabIndex} onclick={() => submitDate()}>
									{lang.translations.submit}
								</button>
							{/if}
						</div>
					</div>
				</div>

				{#if shortcuts && Object.keys(shortcuts).length > 0}
					<ul class="pdp-shortcut">
						{#each Object.entries(shortcuts) as [name, dates]}
							<li
								class:selected={!dates.some(
									(date: PersianDate, i: number) =>
										!date.isSame(selectedDatesState[i]?.toString('datetime'))
								)}
							>
								<button
									type="button"
									onclick={() => selectShorcut(dates)}
									onkeydown={() => selectShorcut(dates)}
								>
									{name}
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
.pdp {
  --primary-color: #3b82f6;
  --secondary-color: #93c5fd;
  --in-range-background: #dbeafe;
  --radius: 0.5rem;
  --text-color: #374151;
  --hover-color: #111827;
  --background: #ffffff;
  --border-color: #e5e7eb;
  --z-index: 9999;
  --disabled-opacity: 0.38;
  --icon-background: #f3f4f6;
  --overlay-color: transparent;
  --main-box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.1), 0 1px 4px 0 rgba(0, 0, 0, 0.06);
  --day-dimensions: 2.2em;
  --time-scale: 1;
}

@keyframes start {
  from {
    transform: inherit scale(0.95);
    opacity: 0;
  }
  to {
    transform: inherit scale(1);
    opacity: 1;
  }
}
@keyframes startModal {
  from {
    transform: translate(-50%, -50%) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}
@keyframes tada {
  0% {
    transform: scale(1);
  }
  10%, 20% {
    transform: scale(0.9) rotate(-3deg);
  }
  30%, 50%, 70%, 90% {
    transform: scale(1.1) rotate(3deg);
  }
  40%, 60%, 80% {
    transform: scale(1.1) rotate(-3deg);
  }
  100% {
    transform: scale(1) rotate(0);
  }
}
@media (max-width: 700px) {
  .pdp-picker {
    flex-direction: column-reverse;
  }
  .pdp-shortcut {
    flex-direction: row !important;
    flex-wrap: wrap;
    justify-content: space-evenly;
    padding: 0 !important;
    border: none !important;
  }
}
.font-fa,
.pdp {
  direction: rtl;
}

.pdp {
  position: relative;
}
.pdp:not(.pdp-range) .pdp-day.start-range {
  border-radius: 0.5rem !important;
  border-radius: var(--radius) !important;
}
.pdp.pdp-range .pdp-picker.rtl .pdp-day.start-range {
  border-radius: 0 0.5rem 0.5rem 0 !important;
  border-radius: 0 var(--radius) var(--radius) 0 !important;
}
.pdp.pdp-range .pdp-picker.rtl .pdp-day.end-range {
  border-radius: 0.5rem 0 0 0.5rem !important;
  border-radius: var(--radius) 0 0 var(--radius) !important;
}
.pdp.pdp-range .pdp-picker.rtl .pdp-day.end-range.start-range {
  border-radius: 0.5rem !important;
  border-radius: var(--radius) !important;
}
.pdp.pdp-range .pdp-picker.ltr .pdp-day.start-range {
  border-radius: 0.5rem 0 0 0.5rem !important;
  border-radius: var(--radius) 0 0 var(--radius) !important;
}
.pdp.pdp-range .pdp-picker.ltr .pdp-day.end-range {
  border-radius: 0 0.5rem 0.5rem 0 !important;
  border-radius: 0 var(--radius) var(--radius) 0 !important;
}
.pdp.pdp-range .pdp-picker.ltr .pdp-day.end-range.start-range {
  border-radius: 0.5rem !important;
  border-radius: var(--radius) !important;
}
.pdp.rtl {
  direction: rtl;
  text-align: right;
}
.pdp.rtl .pdp-group :first-child:not(.pdp-inside),
.pdp.rtl .pdp-group .pdp-inside:first-child + input {
  border-top-right-radius: 0.5rem;
  border-top-right-radius: var(--radius);
  border-bottom-right-radius: 0.5rem;
  border-bottom-right-radius: var(--radius);
  margin-left: -1px;
}
.pdp.rtl .pdp-group input:last-of-type {
  border-top-left-radius: 0.5rem;
  border-top-left-radius: var(--radius);
  border-bottom-left-radius: 0.5rem;
  border-bottom-left-radius: var(--radius);
}
.pdp.rtl .pdp-group .pdp-icon.pdp-inside:nth-of-type(2) {
  right: 50%;
}
.pdp.rtl .pdp-group .pdp-icon.pdp-inside + input {
  padding-right: 3em;
}
.pdp.rtl.pdp-dual .pdp-clear:nth-of-type(1) {
  left: calc(50% + 0.5em) !important;
}
.pdp.rtl .pdp-picker::after {
  right: 1.2em;
}
.pdp.ltr {
  direction: ltr;
  text-align: left;
}
.pdp.ltr .pdp-group :first-child:not(.pdp-inside),
.pdp.ltr .pdp-group .pdp-inside:first-child + input {
  border-top-left-radius: 0.5rem;
  border-top-left-radius: var(--radius);
  border-bottom-left-radius: 0.5rem;
  border-bottom-left-radius: var(--radius);
  margin-right: -1px;
}
.pdp.ltr .pdp-group input:last-of-type {
  border-top-right-radius: 0.5rem;
  border-top-right-radius: var(--radius);
  border-bottom-right-radius: 0.5rem;
  border-bottom-right-radius: var(--radius);
}
.pdp.ltr .pdp-group .pdp-clear {
  left: unset;
  right: 0.5em;
}
.pdp.ltr .pdp-group .pdp-icon.pdp-inside:nth-of-type(2) {
  left: 50%;
}
.pdp.ltr .pdp-group .pdp-icon.pdp-inside + input {
  padding-left: 3em;
}
.pdp.ltr.pdp-dual .pdp-clear:nth-of-type(1) {
  right: calc(50% + 0.5em) !important;
}
.pdp.ltr .pdp-picker::after {
  left: 1.2em;
}
.pdp.pdp-dual .pdp-picker {
  left: 50%;
  transform: translateX(-50%);
}
.pdp.pdp-dual .pdp-picker::after {
  right: unset;
  left: 50%;
  transform: translateX(-50%);
}
.pdp.pdp-modal .pdp-overlay {
  background: rgba(0, 0, 0, 0.45) !important;
}
.pdp.pdp-modal .pdp-picker {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: startModal 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}
.pdp.pdp-modal .pdp-picker::after {
  all: unset !important;
}
.pdp * {
  box-sizing: border-box;
}
.pdp input,
.pdp button {
  font-family: inherit;
}
.pdp .pdp-label {
  display: inline-block;
  margin-bottom: 0.4em;
  font-size: 0.875em;
  font-weight: 500;
  color: #374151;
  color: var(--text-color);
}
.pdp .pdp-group {
  position: relative;
  display: flex;
  align-items: stretch;
  width: 100%;
}
.pdp .pdp-group .pdp-input {
  display: block;
  height: calc(2.375em + 2px);
  padding: 0.4375em 0.875em;
  font-size: 1em;
  font-weight: 400;
  line-height: 1.5;
  color: #374151;
  color: var(--text-color);
  background: #ffffff;
  background: var(--background);
  background-clip: padding-box;
  border: 1.5px solid #e5e7eb;
  border: 1.5px solid var(--border-color);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  flex: 1 1 auto;
  width: 100%;
}
.pdp .pdp-group .pdp-input::placeholder {
  color: #9ca3af;
}
.pdp .pdp-group .pdp-input.pdp-focus {
  outline: none;
  border-color: #3b82f6;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 20%, transparent);
}
.pdp .pdp-group .pdp-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.4375em 0.75em;
  line-height: 1.5;
  font-size: 1em;
  color: #374151;
  color: var(--text-color);
  background: #f3f4f6;
  background: var(--icon-background);
  border: 1.5px solid #e5e7eb;
  border: 1.5px solid var(--border-color);
  max-height: calc(2.375em + 2px);
}
.pdp .pdp-group .pdp-icon:nth-of-type(2) {
  margin-left: -1px;
  margin-right: -1px;
}
.pdp .pdp-group .pdp-icon.pdp-inside {
  background: transparent;
  border: none;
  position: absolute;
  z-index: 1;
}
.pdp .pdp-group .pdp-clear {
  border: none;
  background-color: transparent;
  position: absolute;
  left: 0.5em;
  top: 0;
  bottom: 0;
  z-index: 1;
  cursor: pointer;
  padding: 0 0.4em;
  color: #9ca3af;
  transition: color 0.15s;
}
.pdp .pdp-group .pdp-clear:hover {
  color: #374151;
  color: var(--text-color);
}
.pdp .pdp-overlay {
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  z-index: calc(var(--z-index) - 1);
  background: transparent;
  background: var(--overlay-color);
  border: none;
  cursor: default;
}
.pdp .pdp-picker {
  display: flex;
  position: fixed;
  color: #374151;
  color: var(--text-color);
  background: #ffffff;
  background: var(--background);
  box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.1), 0 1px 4px 0 rgba(0, 0, 0, 0.06);
  box-shadow: var(--main-box-shadow);
  z-index: 9999;
  z-index: var(--z-index);
  border-radius: 1rem;
  border-radius: calc(var(--radius) * 2);
  border: 1px solid #e5e7eb;
  border: 1px solid var(--border-color);
  transition: none;
  padding: 0.5em 0.75em;
  animation: start 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}
.pdp .pdp-picker.ltr {
  direction: ltr;
}
.pdp .pdp-picker.ltr .pdp-header .bottom {
  flex-direction: row-reverse;
}
.pdp .pdp-picker.ltr .pdp-header .bottom > div {
  display: flex;
  flex-direction: row-reverse;
}
.pdp .pdp-picker.ltr .pdp-shortcut {
  border-right: unset;
  border-left: 1px solid #e5e7eb;
  border-left: 1px solid var(--border-color);
}
.pdp .pdp-picker.rtl {
  direction: rtl;
}
.pdp .pdp-picker.pdp-top::after {
  bottom: unset;
  top: 100%;
  transform: rotate(180deg);
}
.pdp .pdp-picker.pdp-left::after {
  right: unset;
  left: 1.2em;
}
.pdp .pdp-picker.pdp-right::after {
  left: unset;
  right: 1.2em;
}
.pdp .pdp-picker:after {
  content: "";
  position: absolute;
  bottom: 100%;
  border: solid transparent;
  border-bottom-color: #ffffff;
  border-bottom-color: var(--background);
  border-width: 0.4em;
}
.pdp .pdp-picker ::selection {
  all: unset;
}
.pdp .pdp-picker .pdp-auto, .pdp .pdp-picker .pdp-auto > div {
  background: inherit;
}
.pdp .pdp-picker .pdp-select-year,
.pdp .pdp-picker .pdp-select-month {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  font-size: 0.82em;
  background: inherit;
  list-style: none;
  position: absolute;
  left: 0;
  right: 0;
  top: 3.5em;
  bottom: 3.5em;
  padding: 0.5em;
  margin: 0;
  z-index: 1;
  animation: start 0.12s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: auto;
}
.pdp .pdp-picker .pdp-select-year button,
.pdp .pdp-picker .pdp-select-month button {
  border: 0;
  background: inherit;
  cursor: pointer;
  font-size: inherit;
  color: inherit;
  padding: 0;
  width: 100%;
  height: 100%;
  border-radius: inherit;
}
.pdp .pdp-picker .pdp-select-year button:focus,
.pdp .pdp-picker .pdp-select-month button:focus {
  outline: 0;
}
.pdp .pdp-picker .pdp-select-year li,
.pdp .pdp-picker .pdp-select-month li {
  width: 4.5em;
  height: 3.5em;
  padding: 0.2em;
  cursor: pointer;
  margin: 0.2em;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  flex: 30% 0;
  border-radius: 0.5rem;
  border-radius: var(--radius);
  transition: background 0.12s, border 0.12s;
}
.pdp .pdp-picker .pdp-select-year li:not(.disabled):hover,
.pdp .pdp-picker .pdp-select-month li:not(.disabled):hover {
  background: #dbeafe;
  background: var(--in-range-background);
  border: 2px solid #3b82f6;
  border: 2px solid var(--primary-color);
}
.pdp .pdp-picker .pdp-select-year li.disabled,
.pdp .pdp-picker .pdp-select-month li.disabled {
  cursor: default !important;
  opacity: 0.38;
  opacity: var(--disabled-opacity);
  pointer-events: none;
}
.pdp .pdp-picker .pdp-select-year li.selected,
.pdp .pdp-picker .pdp-select-month li.selected {
  border: 2px solid #3b82f6;
  border: 2px solid var(--primary-color);
  background: #3b82f6 !important;
  background: var(--primary-color) !important;
  color: #fff;
  font-weight: 600;
}
.pdp .pdp-picker .pdp-select-year::-webkit-scrollbar,
.pdp .pdp-picker .pdp-select-month::-webkit-scrollbar {
  -webkit-appearance: none;
}
.pdp .pdp-picker .pdp-select-year::-webkit-scrollbar:vertical,
.pdp .pdp-picker .pdp-select-month::-webkit-scrollbar:vertical {
  width: 0.35em;
}
.pdp .pdp-picker .pdp-select-year::-webkit-scrollbar-thumb,
.pdp .pdp-picker .pdp-select-month::-webkit-scrollbar-thumb {
  border-radius: 1em;
  background: #e5e7eb;
  background: var(--border-color);
}
.pdp .pdp-picker .pdp-header > div:first-child {
  border-bottom: 1px solid #e5e7eb;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 0.5em;
}
.pdp .pdp-picker .pdp-header .top {
  padding: 0.6em 0.3em 0.8em 0.3em;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85em;
  direction: rtl;
}
.pdp .pdp-picker .pdp-header .top div {
  font-weight: 500;
  color: #374151;
  color: var(--text-color);
  opacity: 0.6;
  font-size: 0.92em;
}
.pdp .pdp-picker .pdp-header .top button {
  border: 0;
  background: #dbeafe;
  background: var(--in-range-background);
  cursor: pointer;
  color: #3b82f6;
  color: var(--primary-color);
  padding: 0.25em 0.7em;
  border-radius: 2em;
  font-size: 0.9em;
  font-weight: 600;
  transition: background 0.15s;
}
.pdp .pdp-picker .pdp-header .top button:hover {
  background: #93c5fd;
  background: var(--secondary-color);
}
.pdp .pdp-picker .pdp-header .bottom {
  padding: 0.25em 0.3em;
  display: flex;
  align-items: center;
  height: 3em;
  direction: rtl;
}
.pdp .pdp-picker .pdp-header .bottom > div {
  display: flex;
  flex-grow: 1;
  justify-content: space-around;
}
.pdp .pdp-picker .pdp-header .bottom > div .pdp-month,
.pdp .pdp-picker .pdp-header .bottom > div .pdp-year {
  color: #3b82f6;
  color: var(--primary-color);
  font-size: 0.95em;
  font-weight: 600;
  border-radius: 0.35em;
  padding: 0.15em 0.4em;
  transition: background 0.12s;
}
.pdp .pdp-picker .pdp-header .bottom > div .pdp-month:hover,
.pdp .pdp-picker .pdp-header .bottom > div .pdp-year:hover {
  background: #dbeafe;
  background: var(--in-range-background);
}
.pdp .pdp-picker .pdp-header .bottom button {
  border: 0;
  background: inherit;
  cursor: pointer;
}
.pdp .pdp-picker .pdp-header .bottom button:focus {
  outline: 0;
}
.pdp .pdp-picker .pdp-header .bottom .pdp-arrow.disabled {
  opacity: 0.38;
  opacity: var(--disabled-opacity);
}
.pdp .pdp-picker .pdp-header .bottom .pdp-arrow:not(.disabled):hover {
  opacity: 0.55;
}
.pdp .pdp-picker .pdp-main {
  position: relative;
}
.pdp .pdp-picker .pdp-main .pdp-date {
  display: flex;
  justify-content: center;
}
.pdp .pdp-picker .pdp-main .pdp-date .pdp-column {
  margin: 0 0.75em;
}
.pdp .pdp-picker .pdp-main .pdp-date .pdp-column .pdp-week {
  background: inherit;
  margin-bottom: 0.35em;
  display: flex;
  justify-content: space-around;
}
.pdp .pdp-picker .pdp-main .pdp-date .pdp-column .pdp-week .pdp-weekday {
  width: 2.2em;
  width: var(--day-dimensions);
  height: 2.2em;
  height: var(--day-dimensions);
  line-height: 2.2em;
  line-height: var(--day-dimensions);
  font-size: 0.75em;
  text-align: center;
  font-weight: 600;
  color: #9ca3af;
}
.pdp .pdp-picker .pdp-main .pdp-date .pdp-column .pdp-days {
  background: inherit;
}
.pdp .pdp-picker .pdp-main .pdp-date .pdp-column .pdp-days .pdp-day {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  margin: 0.08em 0;
  font-size: 0.82em;
  width: 2.2em;
  width: var(--day-dimensions);
  height: 2.2em;
  height: var(--day-dimensions);
  border-radius: 0.5rem;
  border-radius: var(--radius);
  padding: 0;
  cursor: pointer;
  transition: background-color 0.1s ease, color 0.1s ease, box-shadow 0.1s ease;
  contain: content;
  font-weight: 400;
}
.pdp .pdp-picker .pdp-main .pdp-date .pdp-column .pdp-days .pdp-day.friday {
  color: #3b82f6;
  color: var(--primary-color);
}
.pdp .pdp-picker .pdp-main .pdp-date .pdp-column .pdp-days .pdp-day.empty {
  visibility: hidden;
}
.pdp .pdp-picker .pdp-main .pdp-date .pdp-column .pdp-days .pdp-day.start-range, .pdp .pdp-picker .pdp-main .pdp-date .pdp-column .pdp-days .pdp-day.end-range {
  background: #3b82f6;
  background: var(--primary-color);
  color: #fff;
  font-weight: 600;
}
.pdp .pdp-picker .pdp-main .pdp-date .pdp-column .pdp-days .pdp-day.selected {
  background: #3b82f6;
  background: var(--primary-color);
  color: #fff;
  font-weight: 600;
}
.pdp .pdp-picker .pdp-main .pdp-date .pdp-column .pdp-days .pdp-day.disabled {
  box-shadow: unset;
  cursor: default !important;
  border-color: transparent;
  opacity: 0.38;
  opacity: var(--disabled-opacity);
  pointer-events: none;
}
.pdp .pdp-picker .pdp-main .pdp-date .pdp-column .pdp-days .pdp-day.hover {
  background: #3b82f6;
  background: var(--primary-color);
  color: #fff;
}
.pdp .pdp-picker .pdp-main .pdp-date .pdp-column .pdp-days .pdp-day.in-range {
  background: #dbeafe;
  background: var(--in-range-background);
  color: #111827;
  color: var(--hover-color);
  border-radius: 0 !important;
}
.pdp .pdp-picker .pdp-main .pdp-date .pdp-column .pdp-days .pdp-day:not(.disabled):hover {
  background: #dbeafe;
  background: var(--in-range-background);
  color: #111827;
  color: var(--hover-color);
  border: 2px solid #3b82f6;
  border: 2px solid var(--primary-color);
}
.pdp .pdp-picker .pdp-main .pdp-date .pdp-column .pdp-days .pdp-day.today {
  border: 2px solid #3b82f6;
  border: 2px solid var(--primary-color);
}
.pdp .pdp-picker .pdp-main .pdp-date .pdp-column .pdp-days .pdp-day.start-range:not(.disabled):hover, .pdp .pdp-picker .pdp-main .pdp-date .pdp-column .pdp-days .pdp-day.end-range:not(.disabled):hover, .pdp .pdp-picker .pdp-main .pdp-date .pdp-column .pdp-days .pdp-day.selected:not(.disabled):hover {
  background: #3b82f6;
  background: var(--primary-color);
  color: #fff;
  filter: brightness(0.9);
}
.pdp .pdp-picker .pdp-main .pdp-date .pdp-column .pdp-days .pdp-day.tada {
  animation: tada 1s;
  background: #93c5fd;
  background: var(--secondary-color);
  box-shadow: inset 0 3px 8px rgba(0, 0, 0, 0.18);
  color: #111827;
  color: var(--hover-color);
  position: relative;
  z-index: 1;
}
.pdp .pdp-picker .pdp-main .pdp-time {
  background: inherit;
}
.pdp .pdp-picker .pdp-main .pdp-time:not(.inline) {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
}
.pdp .pdp-picker .pdp-main .pdp-time .pdp-moment {
  margin-bottom: 1em;
  font-size: 2em;
  font-size: calc(2em * var(--time-scale));
  display: flex;
  justify-content: space-around;
  height: 100%;
}
.pdp .pdp-picker .pdp-main .pdp-time .pdp-moment.column-direction {
  flex-direction: column;
}
.pdp .pdp-picker .pdp-main .pdp-time .pdp-moment > div {
  display: flex;
  justify-content: center;
  align-items: center;
  direction: ltr;
  width: 100%;
  padding: 1em 0;
}
.pdp .pdp-picker .pdp-main .pdp-time .pdp-moment > div.disabled {
  opacity: 0.38;
  opacity: var(--disabled-opacity);
}
.pdp .pdp-picker .pdp-main .pdp-time .pdp-moment > div div {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 0.8em;
}
.pdp .pdp-picker .pdp-main .pdp-time .pdp-moment > div div button {
  border: none;
  background: none;
  cursor: pointer;
  padding: 0.2em;
  border-radius: 50%;
  transition: background 0.12s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pdp .pdp-picker .pdp-main .pdp-time .pdp-moment > div div button:hover {
  background: #dbeafe;
  background: var(--in-range-background);
}
.pdp .pdp-picker .pdp-footer {
  text-align: center;
  min-height: 3em;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #e5e7eb;
  border-top: 1px solid var(--border-color);
  padding: 0.5em 0.3em 0.25em;
  margin-top: 0.25em;
  gap: 0.5em;
}
.pdp .pdp-picker .pdp-footer > div:first-child {
  font-size: 0.8em;
  color: #6b7280;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.2em;
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.pdp .pdp-picker .pdp-footer .pdp-today,
.pdp .pdp-picker .pdp-footer .pdp-submit {
  font-size: 0.8em;
  padding: 0.35em 0.75em;
  margin: 0 0.2em;
  line-height: 1.5;
  color: #fff;
  text-decoration: none;
  border: none;
  border-radius: 2em;
  background: #3b82f6;
  background: var(--primary-color);
  cursor: pointer;
  font-weight: 600;
  transition: filter 0.15s;
  white-space: nowrap;
}
.pdp .pdp-picker .pdp-footer .pdp-today:hover,
.pdp .pdp-picker .pdp-footer .pdp-submit:hover {
  filter: brightness(0.88);
}
.pdp .pdp-picker .pdp-footer .pdp-cancel {
  font-size: 0.8em;
  padding: 0.35em 0.75em;
  margin: 0 0.2em;
  line-height: 1.5;
  color: #3b82f6;
  color: var(--primary-color);
  text-decoration: none;
  border: 1.5px solid #3b82f6;
  border: 1.5px solid var(--primary-color);
  border-radius: 2em;
  background: transparent;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}
.pdp .pdp-picker .pdp-footer .pdp-cancel:hover {
  background: #3b82f6;
  background: var(--primary-color);
  color: #fff;
}
.pdp .pdp-picker .pdp-footer > div {
  display: flex;
  align-items: center;
}
.pdp .pdp-picker .pdp-shortcut {
  margin: 0;
  padding: 0.5em;
  list-style: none;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  border-right: 1px solid #e5e7eb;
  border-right: 1px solid var(--border-color);
  min-width: 8em;
}
.pdp .pdp-picker .pdp-shortcut li {
  margin: 0.2em 0;
  padding: 0;
  text-align: center;
  cursor: pointer;
  border-radius: 0.5rem;
  border-radius: var(--radius);
}
.pdp .pdp-picker .pdp-shortcut li button {
  background: none;
  border: none;
  cursor: pointer;
  width: 100%;
  padding: 0.5em 0.9em;
  border-radius: 0.5rem;
  border-radius: var(--radius);
  color: #111827;
  color: var(--hover-color);
  font-weight: 500;
  font-size: 0.875em;
  transition: background 0.12s;
}
.pdp .pdp-picker .pdp-shortcut li button:hover {
  background: #dbeafe;
  background: var(--in-range-background);
}
.pdp .pdp-picker .pdp-shortcut li.selected button {
  background: #3b82f6;
  background: var(--primary-color);
  color: #fff;
}
.pdp .pdp-pointer {
  cursor: pointer;
}
.pdp .pdp-auto {
  margin: auto;
  position: relative;
}

@keyframes start {
  from {
    transform: inherit scale(0.5);
    opacity: 0;
  }
  to {
    transform: inherit scale(1);
    opacity: 1;
  }
}
@keyframes startModal {
  from {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0;
  }
  to {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}
@keyframes tada {
  0% {
    transform: scale(1);
  }
  10%, 20% {
    transform: scale(0.9) rotate(-3deg);
  }
  30%, 50%, 70%, 90% {
    transform: scale(1.1) rotate(3deg);
  }
  40%, 60%, 80% {
    transform: scale(1.1) rotate(-3deg);
  }
  100% {
    transform: scale(1) rotate(0);
  }
}
@media (max-width: 700px) {
  .pdp-picker {
    flex-direction: column-reverse;
  }
  .pdp-shortcut {
    flex-direction: row !important;
    flex-wrap: wrap;
    justify-content: space-evenly;
    padding: 0 !important;
    border: none !important;
  }
}
.font-fa,
.pdp {
  direction: rtl;
}

.pdp {
  position: relative;
}
.pdp:not(.pdp-range) .pdp-day.start-range {
  border-radius: 0.5rem !important;
  border-radius: var(--radius) !important;
}
.pdp.pdp-range .pdp-picker.rtl .pdp-day.start-range {
  border-radius: 0 0.5rem 0.5rem 0 !important;
  border-radius: 0 var(--radius) var(--radius) 0 !important;
}
.pdp.pdp-range .pdp-picker.rtl .pdp-day.end-range {
  border-radius: 0.5rem 0 0 0.5rem !important;
  border-radius: var(--radius) 0 0 var(--radius) !important;
}
.pdp.pdp-range .pdp-picker.rtl .pdp-day.end-range.start-range {
  border-radius: 0.5rem !important;
  border-radius: var(--radius) !important;
}
.pdp.pdp-range .pdp-picker.ltr .pdp-day.start-range {
  border-radius: 0.5rem 0 0 0.5rem !important;
  border-radius: var(--radius) 0 0 var(--radius) !important;
}
.pdp.pdp-range .pdp-picker.ltr .pdp-day.end-range {
  border-radius: 0 0.5rem 0.5rem 0 !important;
  border-radius: 0 var(--radius) var(--radius) 0 !important;
}
.pdp.pdp-range .pdp-picker.ltr .pdp-day.end-range.start-range {
  border-radius: 0.5rem !important;
  border-radius: var(--radius) !important;
}
.pdp.rtl {
  direction: rtl;
  text-align: right;
}
.pdp.rtl .pdp-group :first-child:not(.pdp-inside),
.pdp.rtl .pdp-group .pdp-inside:first-child + input {
  border-top-right-radius: 0.5rem;
  border-top-right-radius: var(--radius);
  border-bottom-right-radius: 0.5rem;
  border-bottom-right-radius: var(--radius);
  margin-left: -1px;
}
.pdp.rtl .pdp-group input:last-of-type {
  border-top-left-radius: 0.5rem;
  border-top-left-radius: var(--radius);
  border-bottom-left-radius: 0.5rem;
  border-bottom-left-radius: var(--radius);
}
.pdp.rtl .pdp-group .pdp-icon.pdp-inside:nth-of-type(2) {
  right: 50%;
}
.pdp.rtl .pdp-group .pdp-icon.pdp-inside + input {
  padding-right: 3em;
}
.pdp.rtl.pdp-dual .pdp-clear:nth-of-type(1) {
  left: calc(50% + 0.5em) !important;
}
.pdp.rtl .pdp-picker::after {
  right: 1.2em;
}
.pdp.ltr {
  direction: ltr;
  text-align: left;
}
.pdp.ltr .pdp-group :first-child:not(.pdp-inside),
.pdp.ltr .pdp-group .pdp-inside:first-child + input {
  border-top-left-radius: 0.5rem;
  border-top-left-radius: var(--radius);
  border-bottom-left-radius: 0.5rem;
  border-bottom-left-radius: var(--radius);
  margin-right: -1px;
}
.pdp.ltr .pdp-group input:last-of-type {
  border-top-right-radius: 0.5rem;
  border-top-right-radius: var(--radius);
  border-bottom-right-radius: 0.5rem;
  border-bottom-right-radius: var(--radius);
}
.pdp.ltr .pdp-group .pdp-clear {
  left: unset;
  right: 0.5em;
}
.pdp.ltr .pdp-group .pdp-icon.pdp-inside:nth-of-type(2) {
  left: 50%;
}
.pdp.ltr .pdp-group .pdp-icon.pdp-inside + input {
  padding-left: 3em;
}
.pdp.ltr.pdp-dual .pdp-clear:nth-of-type(1) {
  right: calc(50% + 0.5em) !important;
}
.pdp.ltr .pdp-picker::after {
  left: 1.2em;
}
.pdp.pdp-dual .pdp-picker {
  left: 50%;
  transform: translateX(-50%);
}
.pdp.pdp-dual .pdp-picker::after {
  right: unset;
  left: 50%;
  transform: translateX(-50%);
}
.pdp.pdp-modal .pdp-overlay {
  background: rgba(0, 0, 0, 0.5) !important;
}
.pdp.pdp-modal .pdp-picker {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: startModal 0.1s;
}
.pdp.pdp-modal .pdp-picker::after {
  all: unset !important;
}
.pdp * {
  box-sizing: border-box;
}
.pdp input,
.pdp button {
  font-family: inherit;
}
.pdp .pdp-label {
  display: inline-block;
  margin-bottom: 0.5em;
}
.pdp .pdp-group {
  position: relative;
  display: flex;
  align-items: stretch;
  width: 100%;
}
.pdp .pdp-group .pdp-input {
  display: block;
  height: calc(2.25em + 2px);
  padding: 0.375em 0.75em;
  font-size: 1em;
  font-weight: 400;
  line-height: 1.5;
  background-clip: padding-box;
  border: 1px solid #e5e7eb;
  border: 1px solid var(--border-color);
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  position: relative;
  flex: 1 1 auto;
  width: 100%;
}
.pdp .pdp-group .pdp-input.pdp-focus {
  outline: none;
  border-bottom: 2px solid #3b82f6;
  border-bottom: 2px solid var(--primary-color);
}
.pdp .pdp-group .pdp-icon {
  padding: 0.375em 0.75em;
  line-height: 1.5;
  font-size: 1em;
  color: #374151;
  color: var(--text-color);
  background: #f3f4f6;
  background: var(--icon-background);
  border: 1px solid #e5e7eb;
  border: 1px solid var(--border-color);
  max-height: calc(2.25em + 2px);
}
.pdp .pdp-group .pdp-icon:nth-of-type(2) {
  margin-left: -1px;
  margin-right: -1px;
}
.pdp .pdp-group .pdp-icon.pdp-inside {
  background: transparent;
  border: none;
  position: absolute;
  z-index: 1;
}
.pdp .pdp-group .pdp-clear {
  border: none;
  background-color: transparent;
  position: absolute;
  left: 0.5em;
  top: 0;
  bottom: 0;
  z-index: 1;
  cursor: pointer;
  padding: 0 0.5em;
}
.pdp .pdp-overlay {
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  z-index: calc(var(--z-index) - 1);
  background: transparent;
  background: var(--overlay-color);
}
.pdp .pdp-picker {
  display: flex;
  position: fixed;
  color: #374151;
  color: var(--text-color);
  background: #ffffff;
  background: var(--background);
  box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.1), 0 1px 4px 0 rgba(0, 0, 0, 0.06);
  box-shadow: var(--main-box-shadow);
  z-index: 9999;
  z-index: var(--z-index);
  border-radius: 0.5rem;
  border-radius: var(--radius);
  transition: all 1s ease;
  padding: 0.3em 0.6em;
  animation: start 0.1s;
}
.pdp .pdp-picker.ltr {
  direction: ltr;
}
.pdp .pdp-picker.ltr .pdp-header .bottom {
  flex-direction: row-reverse;
}
.pdp .pdp-picker.ltr .pdp-header .bottom > div {
  display: flex;
  flex-direction: row-reverse;
}
.pdp .pdp-picker.ltr .pdp-shortcut {
  border-right: unset;
  border-left: 1px solid #e5e7eb;
  border-left: 1px solid var(--border-color);
}
.pdp .pdp-picker.rtl {
  direction: rtl;
}
.pdp .pdp-picker.pdp-top::after {
  bottom: unset;
  top: 100%;
  transform: rotate(180deg);
}
.pdp .pdp-picker.pdp-left::after {
  right: unset;
  left: 1.2em;
}
.pdp .pdp-picker.pdp-right::after {
  left: unset;
  right: 1.2em;
}
.pdp .pdp-picker:after {
  content: "";
  position: absolute;
  bottom: 100%;
  border: solid transparent;
  border-bottom-color: #ffffff;
  border-bottom-color: var(--background);
  border-width: 0.4em;
}
.pdp .pdp-picker ::selection {
  all: unset;
}
.pdp .pdp-picker .pdp-auto, .pdp .pdp-picker .pdp-auto > div {
  background: inherit;
}
.pdp .pdp-picker .pdp-select-year,
.pdp .pdp-picker .pdp-select-month {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  font-size: 0.8em;
  background: inherit;
  list-style: none;
  position: absolute;
  left: 0;
  right: 0;
  top: 3.5em;
  bottom: 3.5em;
  padding: 0;
  margin: 0;
  z-index: 1;
  animation: start 0.1s;
  overflow: auto;
}
.pdp .pdp-picker .pdp-select-year button,
.pdp .pdp-picker .pdp-select-month button {
  border: 0;
  background: inherit;
  cursor: pointer;
}
.pdp .pdp-picker .pdp-select-year button:focus,
.pdp .pdp-picker .pdp-select-month button:focus {
  outline: 0;
}
.pdp .pdp-picker .pdp-select-year li,
.pdp .pdp-picker .pdp-select-month li {
  width: 5em;
  height: 4em;
  padding: 0.2em;
  cursor: pointer;
  margin: 0.15em;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  flex: 30% 0;
}
.pdp .pdp-picker .pdp-select-year li:not(.disabled):hover,
.pdp .pdp-picker .pdp-select-month li:not(.disabled):hover {
  border-radius: 0.5rem;
  border-radius: var(--radius);
  border: 2px solid #3b82f6;
  border: 2px solid var(--primary-color);
}
.pdp .pdp-picker .pdp-select-year li.disabled,
.pdp .pdp-picker .pdp-select-month li.disabled {
  text-shadow: unset;
  box-shadow: unset;
  cursor: default !important;
  opacity: 0.38;
  opacity: var(--disabled-opacity);
}
.pdp .pdp-picker .pdp-select-year li.selected,
.pdp .pdp-picker .pdp-select-month li.selected {
  border: 2px solid #3b82f6;
  border: 2px solid var(--primary-color);
  border-radius: 0.5rem;
  border-radius: var(--radius);
  background: #3b82f6 !important;
  background: var(--primary-color) !important;
  color: #ffffff;
  color: var(--background);
}
.pdp .pdp-picker .pdp-select-year::-webkit-scrollbar,
.pdp .pdp-picker .pdp-select-month::-webkit-scrollbar {
  -webkit-appearance: none;
}
.pdp .pdp-picker .pdp-select-year::-webkit-scrollbar:vertical,
.pdp .pdp-picker .pdp-select-month::-webkit-scrollbar:vertical {
  width: 0.4em;
}
.pdp .pdp-picker .pdp-select-year::-webkit-scrollbar-thumb,
.pdp .pdp-picker .pdp-select-month::-webkit-scrollbar-thumb {
  border-radius: 0.5rem;
  border-radius: var(--radius);
  border: 0.1em solid white;
  /* should match background, can't be transparent */
  background: #e5e7eb;
  background: var(--border-color);
}
.pdp .pdp-picker .pdp-header > div:first-child {
  border-bottom: 1px solid #e5e7eb;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 0.5em;
}
.pdp .pdp-picker .pdp-header .top {
  padding: 0.75em 0.3em 1em 0.3em;
  display: flex;
  justify-content: space-between;
  font-size: 0.9em;
  direction: rtl;
}
.pdp .pdp-picker .pdp-header .top button {
  border: 0;
  background: inherit;
  cursor: pointer;
  color: #3b82f6;
  color: var(--primary-color);
  padding: 0 0.5em;
}
.pdp .pdp-picker .pdp-header .bottom {
  padding: 0.3em;
  display: flex;
  align-items: center;
  height: 3em;
  direction: rtl;
}
.pdp .pdp-picker .pdp-header .bottom > div {
  display: flex;
  flex-grow: 1;
  justify-content: space-around;
}
.pdp .pdp-picker .pdp-header .bottom > div .pdp-month,
.pdp .pdp-picker .pdp-header .bottom > div .pdp-year {
  color: #3b82f6;
  color: var(--primary-color);
  font-size: 1em;
}
.pdp .pdp-picker .pdp-header .bottom button {
  border: 0;
  background: inherit;
  cursor: pointer;
}
.pdp .pdp-picker .pdp-header .bottom button:focus {
  outline: 0;
}
.pdp .pdp-picker .pdp-header .bottom .pdp-arrow.disabled {
  opacity: 0.38;
  opacity: var(--disabled-opacity);
}
.pdp .pdp-picker .pdp-header .bottom .pdp-arrow:not(.disabled):hover {
  opacity: 0.38;
  opacity: var(--disabled-opacity);
}
.pdp .pdp-picker .pdp-main {
  position: relative;
}
.pdp .pdp-picker .pdp-main .pdp-date {
  display: flex;
  justify-content: center;
}
.pdp .pdp-picker .pdp-main .pdp-date .pdp-column {
  margin: 0 1em;
}
.pdp .pdp-picker .pdp-main .pdp-date .pdp-column .pdp-week {
  background: inherit;
  margin-bottom: 0.3em;
  display: flex;
  justify-content: space-around;
}
.pdp .pdp-picker .pdp-main .pdp-date .pdp-column .pdp-week .pdp-weekday {
  width: 2.2em;
  width: var(--day-dimensions);
  height: 2.2em;
  height: var(--day-dimensions);
  line-height: 2.2em;
  line-height: var(--day-dimensions);
  font-size: 0.8em;
  text-align: center;
}
.pdp .pdp-picker .pdp-main .pdp-date .pdp-column .pdp-days {
  background: inherit;
}
.pdp .pdp-picker .pdp-main .pdp-date .pdp-column .pdp-days .pdp-day {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  margin: 0.1em 0;
  font-size: 0.8em;
  width: 2.2em;
  width: var(--day-dimensions);
  height: 2.2em;
  height: var(--day-dimensions);
  border-radius: 0.5rem;
  border-radius: var(--radius);
  padding: 0;
  cursor: pointer;
  transition-property: background-color, box-shadow;
  transition-duration: 0.1s;
  contain: content;
}
.pdp .pdp-picker .pdp-main .pdp-date .pdp-column .pdp-days .pdp-day.friday {
  color: #3b82f6;
  color: var(--primary-color);
}
.pdp .pdp-picker .pdp-main .pdp-date .pdp-column .pdp-days .pdp-day.empty {
  visibility: hidden;
}
.pdp .pdp-picker .pdp-main .pdp-date .pdp-column .pdp-days .pdp-day.start-range, .pdp .pdp-picker .pdp-main .pdp-date .pdp-column .pdp-days .pdp-day.end-range {
  background: #3b82f6;
  background: var(--primary-color);
  color: #ffffff;
  color: var(--background);
}
.pdp .pdp-picker .pdp-main .pdp-date .pdp-column .pdp-days .pdp-day.selected {
  background: #3b82f6;
  background: var(--primary-color);
  color: #ffffff;
  color: var(--background);
  font-weight: 600;
}
.pdp .pdp-picker .pdp-main .pdp-date .pdp-column .pdp-days .pdp-day.disabled {
  box-shadow: unset;
  text-shadow: unset;
  cursor: default !important;
  border-color: transparent;
  opacity: 0.38;
  opacity: var(--disabled-opacity);
}
.pdp .pdp-picker .pdp-main .pdp-date .pdp-column .pdp-days .pdp-day.hover {
  background: #3b82f6;
  background: var(--primary-color);
  color: #ffffff;
  color: var(--background);
}
.pdp .pdp-picker .pdp-main .pdp-date .pdp-column .pdp-days .pdp-day.in-range {
  background: #dbeafe;
  background: var(--in-range-background);
  color: #111827;
  color: var(--hover-color);
  border-radius: 0 !important;
}
.pdp .pdp-picker .pdp-main .pdp-date .pdp-column .pdp-days .pdp-day:not(.disabled):hover, .pdp .pdp-picker .pdp-main .pdp-date .pdp-column .pdp-days .pdp-day.today {
  border: 2px solid #3b82f6;
  border: 2px solid var(--primary-color);
}
.pdp .pdp-picker .pdp-main .pdp-date .pdp-column .pdp-days .pdp-day.tada {
  animation: tada 1s;
  background: #93c5fd;
  background: var(--secondary-color);
  box-shadow: inset 0 4px 9px rgba(0, 0, 0, 0.24);
  color: #000;
  position: relative;
  z-index: 1;
}
.pdp .pdp-picker .pdp-main .pdp-time {
  background: inherit;
}
.pdp .pdp-picker .pdp-main .pdp-time:not(.inline) {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
}
.pdp .pdp-picker .pdp-main .pdp-time .pdp-moment {
  margin-bottom: 1em;
  font-size: 2em;
  font-size: calc(2em * var(--time-scale));
  display: flex;
  justify-content: space-around;
  height: 100%;
}
.pdp .pdp-picker .pdp-main .pdp-time .pdp-moment.column-direction {
  flex-direction: column;
}
.pdp .pdp-picker .pdp-main .pdp-time .pdp-moment > div {
  display: flex;
  justify-content: center;
  align-items: center;
  direction: ltr;
  width: 100%;
  padding: 1em 0;
}
.pdp .pdp-picker .pdp-main .pdp-time .pdp-moment > div.disabled {
  opacity: 0.38;
  opacity: var(--disabled-opacity);
}
.pdp .pdp-picker .pdp-main .pdp-time .pdp-moment > div div {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 0.8em;
}
.pdp .pdp-picker .pdp-main .pdp-time .pdp-moment > div div button {
  border: none;
  background: none;
  cursor: pointer;
}
.pdp .pdp-picker .pdp-footer {
  text-align: center;
  min-height: 3em;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #e5e7eb;
  border-top: 1px solid var(--border-color);
  padding: 0.3em;
}
.pdp .pdp-picker .pdp-footer .pdp-today,
.pdp .pdp-picker .pdp-footer .pdp-submit {
  font-size: 0.8em;
  padding: 0.25em 0.5em;
  margin: 0 0.3em;
  line-height: 1.5;
  color: #ffffff;
  color: var(--background);
  text-decoration: none;
  border: none;
  border-radius: 0.5rem;
  border-radius: var(--radius);
  background: #3b82f6;
  background: var(--primary-color);
  cursor: pointer;
}
.pdp .pdp-picker .pdp-footer .pdp-today:hover,
.pdp .pdp-picker .pdp-footer .pdp-submit:hover {
  filter: brightness(0.9);
}
.pdp .pdp-picker .pdp-footer .pdp-cancel {
  font-size: 0.8em;
  padding: 0.25em 0.5em;
  margin: 0 0.3em;
  line-height: 1.5;
  color: #3b82f6;
  color: var(--primary-color);
  text-decoration: none;
  border: 1px solid #3b82f6;
  border: 1px solid var(--primary-color);
  border-radius: 0.5rem;
  border-radius: var(--radius);
  background: transparent;
  cursor: pointer;
}
.pdp .pdp-picker .pdp-footer .pdp-cancel:hover {
  background: #3b82f6;
  background: var(--primary-color);
  color: #ffffff;
  color: var(--background);
}
.pdp .pdp-picker .pdp-footer > div {
  display: flex;
}
.pdp .pdp-picker .pdp-shortcut {
  margin: 0;
  padding: 0.5em;
  list-style: none;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  border-right: 1px solid #e5e7eb;
  border-right: 1px solid var(--border-color);
}
.pdp .pdp-picker .pdp-shortcut li {
  margin: 0;
  padding: 0.5em 1em;
  text-align: center;
  cursor: pointer;
  border-radius: 0.5rem;
  border-radius: var(--radius);
  margin: 0.25em 0;
  color: #111827;
  color: var(--hover-color);
  font-weight: 500;
}
.pdp .pdp-picker .pdp-shortcut li:hover {
  background: #dbeafe;
  background: var(--in-range-background);
}
.pdp .pdp-picker .pdp-shortcut li.selected {
  background: #3b82f6;
  background: var(--primary-color);
  color: #ffffff;
  color: var(--background);
}
.pdp .pdp-pointer {
  cursor: pointer;
}
.pdp .pdp-auto {
  margin: auto;
  position: relative;
}
</style>
