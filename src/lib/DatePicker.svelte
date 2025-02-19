<script lang="ts">
	// import {  $derived } from 'svelte';
	import { onMount, onDestroy, tick } from 'svelte';
	import { PersianDate, Core } from './modules/core';
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

	// import { get } from 'svelte/store';
	// const slots = get($$slots);
	let slots = $$slots;

	interface Props {
		onSelect: (date: PersianDate) => void;
		onSubmit: (date: PersianDate | PersianDate[]) => void;
		onClear: () => void;
		modelValue: any;
		format: string;
		inputFormat: string;
		displayFormat: string;
		type?: 'date' | 'time' | 'datetime';
		from?: string;
		to?: string;
		show?: boolean;
		clickOn?: 'all' | 'input' | 'icon' | 'none';
		modal?: boolean;
		label?: string;
		column?: number | Record<number, number>;
		autoSubmit?: boolean;
		mode?: 'single' | 'range';
		locale?: string;
		clearable?: boolean;
		disable?: Disable;
		localeConfig?: Langs;
		styles?: Styles;
		color?: 'blue' | 'red' | 'pink' | 'orange' | 'green' | 'purple' | 'gray';
		dualInput?: boolean;
		iconInside?: boolean;
		shortcut?: boolean | Shortcuts;
	}

	let {
		onSelect,
		onSubmit,
		onClear,
		modelValue,
		format,
		inputFormat,
		displayFormat,
		type = 'date',
		from,
		to,
		show = false,
		clickOn = 'all',
		modal = false,
		label,
		column = { 576: 1 },
		autoSubmit = true,
		mode = 'range',
		locale = 'fa',
		clearable = false,
		disable,
		localeConfig,
		styles,
		color,
		dualInput = false,
		iconInside = false,
		shortcut = false
	}: Props = $props();

	function updateValue(date?: PersianDate | PersianDate[] | string | string[]) {
		modelValue = date; // Update the prop directly
	}
	// Props
	let rootElement: HTMLElement;
	$inspect(locale);

	// Reactive state
	let core = new PersianDate();
	let onDisplay: PersianDate = $state(new PersianDate());
	let fromDate: PersianDate = $state(new PersianDate());
	let toDate: PersianDate = $state(new PersianDate());
	let selectedDates: PersianDate[] = $state([]);
	let selectedTimes: PersianDate[] = $state([]);
	let showDatePicker = $state(false);
	let showYearSelect = $state(false);
	let showMonthSelect = $state(false);
	let displayValue: string[] = $state([]);
	let inputName: Inputs = $state('firstInput');
	let pickerPlace: PickerPlace = $state({} as PickerPlace);
	let documentWidth = $state(typeof window !== 'undefined' ? window.innerWidth : Infinity);
	let langs = $state(Core.langs);
	let currentLocale = locale.split(',')[0];
	let interval: ReturnType<typeof setInterval>;
	let submitedValue: PersianDate[] = $state([]);

	// Refs
	let root: HTMLElement;
	let pdpPicker: HTMLElement | null = $state(null);
	let pdpMain: HTMLElement | null = $state(null);
	let pdpSelectYear: HTMLElement | null = $state(null);
	// let inputs: HTMLInputElement[] = [];

	// Computed
	// $: lang = langs[currentLocale];
	let lang = langs[currentLocale];
	// $: attrs = calculateAttrs();
	let attrs = $derived(calculateAttrs());
	// $: years = calculateYears();
	let years = $derived(calculateYears());
	// $: columnCount = calculateColumnCount();
	let columnCount = $derived(calculateColumnCount());
	// $: monthDays = calculateMonthDays();
	let monthDays = $derived(calculateMonthDays());
	// $: months = calculateMonths();
	let months = $derived(calculateMonths());
	// $: nextLocale = calculateNextLocale();
	let nextLocale = $derived(calculateNextLocale());
	// $: formats = calculateFormats();
	let formats = $derived(calculateFormats());
	let inputsList = dualInput ? ['firstInput', 'secondInput'] : ['firstInput'];
	// $: tabIndex = calculateTabIndex();
	let tabIndex = $derived(calculateTabIndex());
	let inputs = $derived(calculateInputs());
	// Watchers
	// $: {
	// 	if (show !== undefined) showDatePicker = show;
	// 	if (from) fromDate?.fromJalali(from);
	// 	if (to) toDate?.fromJalali(to);
	// 	if (mode === 'single' && selectedDates.length === 2) selectedDates.pop();
	// 	langs = Core.mergeObject(Core.langs, localeConfig) as Langs;
	// 	if (styles) Core.setStyles(styles, rootElement);
	// 	if (color) Core.setColor(color, rootElement);
	// }
	// Effect to handle changes based on reactive dependencies
	$effect(() => {
		if (show !== undefined) showDatePicker = show;
		if (from) fromDate?.fromJalali(from);
		if (to) toDate?.fromJalali(to);
		if (mode === 'single' && selectedDates.length === 2) selectedDates.pop();
		langs = Core.mergeObject(Core.langs, localeConfig) as Langs;
		if (styles) Core.setStyles(styles, rootElement);
		if (color) Core.setColor(color, rootElement);
	});

	onMount(() => {
		initializeDates();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});

	function initializeDates() {
		const calendar = lang.calendar;
		fromDate = core.clone().parse(defaultDate().from).calendar(calendar);
		toDate = core.clone().parse(defaultDate().to).calendar(calendar);
		// Rest of initialization
	}

	function calculateAttrs(): Attrs {
		const attrs: Attrs = {
			div: { class: 'pdp-group' },
			label: { class: 'pdp-label' },
			alt: {},
			picker: { class: 'pdp-picker' },
			firstInput: { class: 'pdp-input' },
			secondInput: { class: 'pdp-input' }
		};
		for (const key in attrs) {
			try {
				// @ts-expect-error type
				const [, group, attr] = key.match(/(div|label|alt|picker|firstInput|secondInput)-(.*)/) as [
					void,
					keyof Attrs,
					string
				];
				attrs[group][attr] = attrs[key];
			} catch {
				attrs['firstInput'][key] = attrs[key] as string;
			}
		}
		attrs.picker.class = [
			attrs.picker.class,
			{
				'pdp-top': pickerPlace.top,
				'pdp-left': pickerPlace.left,
				'pdp-right': pickerPlace.right
			},
			lang.dir.picker
		];
		if (mode == 'single' && dualInput) {
			attrs['secondInput'].disabled = 'disabled';
		}
		if (showDatePicker) {
			attrs[inputName].class += ' pdp-focus';
		}
		return attrs;
	}
	function calculateYears(): number[] {
		let start: number = fromDate!.year();
		const end: number = toDate!.year();
		return Array(end - start + 1)
			.fill(null)
			.map(() => start++);
	}

	function calculateColumnCount(): number {
		let column = 2;
		if (Core.isNumber(column)) {
			column = column as number;
		} else {
			const breakpoint = Object.keys(column)
				.sort((a, b) => +a - +b)
				.find((bp) => documentWidth <= +bp);
			if (breakpoint) column = (column as Obj)[breakpoint] as number;
		}
		if (type.includes('time')) {
			const scale = column / (mode == 'single' ? 1 : 2);
			(rootElement as HTMLElement).style.setProperty('--time-scale', (scale > 1 ? scale : 1) + '');
		}
		return column;
	}

	function calculateMonthDays(): MonthDays[][] {
		const months: MonthDays[][] = [];
		for (let i = 0; i < columnCount; i++) {
			let emptyCells;
			const selectedYear = onDisplay!.clone().addMonth(i).year();
			const selectedMonth = onDisplay!.clone().addMonth(i).month();
			emptyCells = +onDisplay!.clone().parse(selectedYear, selectedMonth, 1).toString('?d');
			let daysOfMonthNumber = onDisplay!.getDaysInMonth(selectedYear, selectedMonth);
			const numberOfWeek = Math.ceil((daysOfMonthNumber + emptyCells) / 7);
			const month: MonthDays[] = [];
			let showDay = 1;
			for (let week = 0; week < numberOfWeek; week++) {
				month[week] = [];
				for (let day = 0; day < 7; day++) {
					if (emptyCells) {
						month[week][day] = { empty: true };
						--emptyCells;
					} else if (daysOfMonthNumber) {
						//FIXME: refactor
						month[week][day] = {
							friday: day == 6,
							raw: onDisplay!.clone().addMonth(i).date(showDay),
							startRange:
								selectedDates[0] && selectedDates[0].isSame(selectedYear, selectedMonth, showDay),
							endRange:
								selectedDates[1] && selectedDates[1].isSame(selectedYear, selectedMonth, showDay),
							inRange:
								selectedDates.length == 2 &&
								core
									.clone()
									.parse(selectedYear, selectedMonth, showDay)
									.isBetween(...(selectedDates.map((date) => date.toString()) as [string, string])),
							disabled:
								!checkDate(onDisplay!.clone().addMonth(i).date(showDay), 'date') ||
								isInDisable(onDisplay!.clone().addMonth(i).date(showDay)),
							today: core.clone().isSame(selectedYear, selectedMonth, showDay),
							val: showDay++
						};
						--daysOfMonthNumber;
					} else month[week][day] = { empty: true };
				}
			}
			months.push(month);
		}
		return months;
	}

	function calculateMonths(): Months {
		const months: Months = {};
		for (let i = 1; i <= 12; i++) {
			months[i] = {
				label: lang.months[i - 1],
				selected: onDisplay!.month() == i,
				disabled: !checkDate(onDisplay!.clone().month(i), 'month')
			};
		}
		return months;
	}

	function calculateFormats(): Formats {
		const displayFormat: Obj<string, TypePart | 'datetime'> = {
			date: '?D ?MMMM',
			datetime: '?D ?MMMM HH:mm',
			time: 'HH:mm'
		};
		const format: Obj<string, TypePart | 'datetime'> = {
			date: 'YYYY-MM-DD',
			datetime: 'YYYY-MM-DD HH:mm',
			time: 'HH:mm'
		};
		return {
			model: format || format[type],
			input: inputFormat || lang.inputFormat || type,
			display: displayFormat || lang.displayFormat || displayFormat[type],
			alt: (attrs.alt.format as string) || format || format[type]
		};
	}
	function defaultDate(): DefaultDate {
		const prefix = type === 'time' ? core.toString('jYYYY/jMM/jDD') + ' ' : '';
		return {
			from: prefix + from,
			to: prefix + to
		};
	}
	function calculateInputs(): Inputs[] {
		return !dualInput ? ['firstInput'] : ['firstInput', 'secondInput'];
	}
	function calculateTabIndex(): number | undefined {
		return +(attrs.secondInput.tabindex || attrs.firstInput.tabindex) + 1 || undefined;
	}
	function shortcuts(): Shortcuts | false {
		if (!shortcut) {
			return false;
		}
		const shortcuts: Shortcuts = {};
		const part = type.includes('date') ? 'date' : 'time';
		let d = core.clone().now();
		if (part == 'time' && !validate(d, part)) d = toDate!.clone().subDay().now();

		const checkDate = (dates: PersianDate[]) => {
			return mode === 'single'
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
						type == 'date' ? dates.map((d: PersianDate) => d.startOf('date')) : dates;
				}
			}
		};

		if (shortcut === true) {
			setShortcut(Core.getShortcuts(d, `${part}-${mode}`, lang.translations)!);
		} else {
			setShortcut(shortcut, true);
		}
		return shortcuts;
	}

	function calculateNextLocale(): string {
		const locales = locale.split(',');
		const index = locales.indexOf(currentLocale);
		 locale = locales[index + 1] || locales[0];
		return langs[locale].translations.label;
	}
	// Other methods converted to regular functions

	function handleResize() {
		documentWidth = window.innerWidth;
	}

	// Event dispatchers
	function dispatchOpen() {
		/* ... */
	}
	function dispatchClose() {
		/* ... */
	}
	// ... other event dispatchers
	function showPart(part: CalendarPart): void {
		if (part == 'year') {
			showMonthSelect = false;
			showYearSelect = !showYearSelect;
			if (showYearSelect) {
				tick().then(() => {
					const selectedYearTop = (
						(pdpSelectYear as HTMLElement).querySelector('li.selected') as HTMLLIElement
					).offsetTop;
					(pdpSelectYear as HTMLElement).scroll({
						top: selectedYearTop,
						behavior: 'smooth'
					});
				});
			}
		} else if (part == 'month') {
			showYearSelect = false;
			showMonthSelect = !showMonthSelect;
		}
	}
	function changeSelectedMonth(month: 'add' | 'sub' | number): void {
		const clone = onDisplay!.clone();
		if (month == 'add') {
			onDisplay!.addMonth();
		} else if (month == 'sub') {
			onDisplay!.subMonth();
		} else onDisplay!.month(month);
		if (checkDate(onDisplay, 'month')) showMonthSelect = false;
		else onDisplay = clone;
	}
	function changeSelectedYear(year: number): void {
		onDisplay!.year(year);
		if (!checkDate(onDisplay, 'date')) onDisplay = nearestDate(onDisplay as PersianDate);
		showYearSelect = false;
	}
	function validate(date: PersianDate, part: TypePart): boolean {
		if (!checkDate(date, part) || isInDisable(date)) return false;
		return true;
	}
	function isDisableBetween(first: PersianDate, second: PersianDate): boolean {
		if (!disable) return false;
		if (type != 'datetime' && Core.isString(disable)) {
			const date = type == 'time' ? second.clone().time(disable as string) : disable;
			return core
				.clone()
				.parse(date as PersianDate | string)
				.isBetween(first.toString(), second.toString());
		} else if (
			type != 'datetime' &&
			Array.isArray(disable) &&
			disable.some((date) => Core.isString(date))
		) {
			return disable.some((date) => {
				if (type == 'time')
					date = second
						.clone()
						.time(date as string)
						.toString();
				return core
					.clone()
					.parse(date as string)
					.isBetween(first, second);
			});
		} else if (type != 'time') {
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
		} else if (mode == 'range' && selectedDates.length == 1) {
			isValid = !isDisableBetween(selectedDates[0] as PersianDate, date);
			if (!isValid) {
				return -2;
			}
		}
		if (type == 'date') {
			date.startOf('date');
		}
		if (mode == 'single') {
			selectedDates = [date];
		} else if (mode == 'range') {
			(pdpMain as HTMLElement).addEventListener('mouseover', selectInRangeDate);
			if (selectedDates.length === 0) {
				selectedDates[0] = date;
				inputName = 'secondInput';
			} else if (inputName === 'secondInput') {
				inputName = 'firstInput';
				if (!date.isBefore(selectedDates[0] as PersianDate)) {
					selectedDates[1] = date;
				} else {
					if (selectedDates.length === 1) selectedDates.unshift(date);
					else {
						selectedDates = [date];
						inputName = 'secondInput';
					}
				}
			} else {
				selectedDates = [date];
				inputName = 'secondInput';
			}
			if (selectedDates.length == 2) {
				(pdpMain as HTMLElement).removeEventListener('mouseover', selectInRangeDate);
			}
		}

		if (type == 'datetime') {
			selectedDates = selectedDates.map((d, i) => {
				if (selectedTimes[i]) {
					d.time(selectedTimes[i] as PersianDate);
				}
				selectedTimes[i] = d;
				return d;
			});
		}

		// $emit('select', date);
		onSelect?.(date);
		if (autoSubmit && (mode !== 'range' || (mode === 'range' && selectedDates.length == 2))) {
			submitDate();
			return 1;
		}
		return 0;
	}
	function setModel(date?: PersianDate | PersianDate[] | string | string[]): void {
		if (date === undefined) {
			date = selectedDates.map((el) => {
				return el.toString(formats.model);
			});
			if (mode == 'single') date = date[0];
		}
		// $emit('update:modelValue', date);
		updateValue(date);
	}
	function goToToday(): void {
		showMonthSelect = showYearSelect = false;
		onDisplay = core.now().clone();
		if (type.includes('time') && selectedDates.length) {
			const lastIndex = selectedDates.length - 1;
			const time = selectedDates[lastIndex];
			time.time(onDisplay as PersianDate);
			if (selectedTimes[lastIndex]) {
				selectedTimes[lastIndex] = time.clone();
			}
			if (autoSubmit && checkDate(time, 'time') && !isInDisable(time as PersianDate))
				submitDate(false);
		}
		if (type.includes('date'))
			tick().then(() => {
				document.querySelector('.pdp-day.today')!.classList.add('tada');
				setTimeout(() => {
					document.querySelector('.pdp-day.today')!.classList.remove('tada');
				}, 1000);
			});
	}
	function checkDate(date: unknown, part: CalendarPart | TypePart): boolean {
		let from, to;
		if (!Core.isPersianDate(date)) date = core.clone().parse(date as PersianDate);
		switch (part) {
			case 'year':
				from = fromDate!.toString('?YYYY');
				to = toDate!.toString('?YYYY');
				break;
			case 'month':
				from = fromDate!.toString('?YYYY/?MM');
				to = toDate!.toString('?YYYY/?MM');
				break;
			case 'date':
				from = fromDate!.toString();
				to = toDate!.toString();
				break;
			case 'time':
				from = fromDate!.toString(type.includes('time') ? 'datetime' : 'date');
				to = toDate!.toString(type.includes('time') ? 'datetime' : 'date');
				break;
		}
		return (date as PersianDate).isBetween(from, to, '[]');
	}
	function isInDisable(date: PersianDate, disable?: Disable): boolean {
		if (!disable) return false;
		disable = disable || disable;
		date = Core.isPersianDate(date) ? date.clone() : core.clone().parse(date);
		if (Core.isString(disable)) {
			if (type == 'time') disable = date.toString() + ' ' + disable;
			return date.calendar('jalali').isSame(disable as string);
		} else if (disable instanceof RegExp) {
			const format = {
				date: 'jYYYY/jM/jD',
				datetime: 'jYYYY/jM/jD H:m',
				time: 'H:m'
			};
			return disable.test(date.toString(format[type]));
		} else if (Core.isFunction(disable)) {
			return (disable as (date: PersianDate) => boolean)(date);
		} else if (Array.isArray(disable)) {
			return disable.some((val) => {
				if (Core.isString(val)) {
					if (type == 'time') val = date.toString() + ' ' + val;
					return date.calendar('jalali').isSame(val as string);
				} else if (val instanceof RegExp) {
					const format = {
						date: 'jYYYY/jM/jD',
						datetime: 'jYYYY/jM/jD H:m',
						time: 'H:m'
					};
					return val.test(date.toString(format[type]));
				}
			});
		} else {
			return false;
		}
	}
	function showPicker(el: 'icon' | 'input', index: 0 | 1): void {
		if (clickOn == 'all' || clickOn == el) {
			const inputName1 = inputs[index];
			if (dualInput) inputName = inputName1;
			(inputs as HTMLElement[])[index].focus();
			showDatePicker = true;
			if (!modal) {
				tick().then(() => {
					locate();
				});
				document.addEventListener('scroll', locate);
			}
		}
	}
	async function selectWithArrow(e: KeyboardEvent): Promise<void> {
		//FIXME: refactor
		//FIXME: when up arraw press go to last date
		// [37, 38, 39, 40] are key codes of arrow keys
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
				const firstColumnMonth = onDisplay!.toString();
				const focusedMonth = onDisplay!.clone().addMonth(column);
				let nextElementValue: PersianDate | number = focusedMonth
					.date(focusedDay.innerText)
					.addDay(numberOfDay);
				if (!checkDate(nextElementValue, 'date')) return focusedDay.classList.add('hover');
				nextElementValue = (nextElementValue as PersianDate).date();
				column = focusedMonth.diff(firstColumnMonth, 'month');
				if (column < 0) {
					onDisplay!.subMonth(columnCount);
					column = columnCount - 1;
				} else if (column >= columnCount) {
					onDisplay!.addMonth(columnCount);
					column = 0;
				}
				await tick();
				focusedDay = document.querySelector(
					`.pdp .pdp-main .pdp-column[data-column='${column}'] .pdp-day[value='${nextElementValue}']`
				) as HTMLElement;
				focusedDay.classList.add('hover');
			} else {
				focusedDay = document.querySelector(
					'.pdp .pdp-day:not(.empty):not(.disabled)'
				) as HTMLElement;
				if (focusedDay) focusedDay.classList.add('hover');
				else {
					focusedDay = document.querySelector(
						`.pdp .pdp-main .pdp-column[data-column="0"] .pdp-day[value="${fromDate!.date()}"]`
					) as HTMLElement;
					focusedDay.classList.add('hover');
				}
			}
			if (mode === 'range' && selectedDates.length == 1) {
				selectInRangeDate({ target: focusedDay });
			}
		} else if (e.key == 'Enter') {
			// 13 is key code of Enter key
			e.preventDefault();
			const focusedDay = document.querySelector('.pdp .pdp-day.hover') as HTMLElement;
			if (focusedDay) {
				selectDate(
					onDisplay!
						.clone()
						.addMonth(getColumn(focusedDay) || 0)
						.date(focusedDay.innerText),
					'date'
				);
			} else {
				let onDisplay;
				displayValue.forEach((value, index) => {
					if (!value) return false;
					if (type == 'time') {
						const time = value.split(/[/ -.,:\\]/);
						if (checkDate(core.clone(), 'time')) onDisplay = core.clone();
						else onDisplay = fromDate!.clone();
						onDisplay.time(time as [string]);
					} else {
						onDisplay = core.clone().parse(value);
					}
					if (selectDate(onDisplay, 'time') === 0) {
						const diff = onDisplay.diff(onDisplay as PersianDate, 'month');
						if (diff < 0 || diff >= columnCount) onDisplay = onDisplay.clone();
						displayValue[index] = '';
					}
				});
			}
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function selectInRangeDate(e: any): void {
		const target = e.target;
		if (!target.classList.contains('pdp-day')) return;
		document.querySelectorAll(`.pdp .pdp-day`).forEach((el) => {
			el.classList.remove('in-range');
		});

		let column = getColumn(target);
		const hoveredDate = onDisplay!.clone().startOf('date').addMonth(column).date(target.innerText);
		const selectedDate = selectedDates[0].clone().startOf('date');
		const number = hoveredDate.isAfter(selectedDate) ? 1 : -1;
		const selectedDateDOM = document.querySelector(
			'.pdp-day.start-range,.pdp-day.end-range'
		) as HTMLElement;
		if (selectedDateDOM) {
			column = +getColumn(selectedDateDOM);
			selectedDateDOM.classList.replace(
				...((hoveredDate.isBefore(selectedDate)
					? ['start-range', 'end-range']
					: ['end-range', 'start-range']) as [string, string])
			);
		} else {
			selectedDate.parse(onDisplay as PersianDate);
			if (number === 1) {
				selectedDate.startOf('month').subDay();
				column = -1;
			} else {
				selectedDate
					.addMonth(columnCount - 1)
					.endOf('month')
					.addDay()
					.startOf('date');
				column = columnCount;
			}
		}
		while (!hoveredDate.isSame(selectedDate)) {
			const oldMonth = selectedDate.month();
			selectedDate.addDay(number);
			if (oldMonth != selectedDate.month()) {
				column += number;
			}
			if (checkDate(selectedDate, 'date') && !isInDisable(selectedDate)) {
				document
					.querySelector(
						`.pdp-column[data-column='${column}'] .pdp-day[value='${selectedDate.date()}']`
					)!
					.classList.add('in-range');
			} else {
				break;
			}
		}
	}
	function submitDate(close = true): void {
		const displayDate = selectedDates.map((el) => {
			return el.toString(formats.input);
		});
		if (dualInput) displayValue = displayDate;
		else displayValue[0] = displayDate.join(' - ');

		submitedValue = selectedDates.slice();
		setModel();
		// $emit('submit', mode === 'range' ? selectedDates : selectedDates[0]);
		onSubmit?.(mode === 'range' ? selectedDates : selectedDates[0]);
		if (close) {
			showDatePicker = false;
		}
	}
	function getColumn({ parentNode }: HTMLElement): number | string {
		return (parentNode!.parentNode!.parentNode as HTMLElement).dataset.column!;
	}
	function nearestDate(date: PersianDate): PersianDate {
		return Math.abs(date.diff(fromDate as PersianDate)) <=
			Math.abs(date.diff(toDate as PersianDate))
			? fromDate!.clone()
			: toDate!.clone();
	}
	function locate(): void {
		pickerPlace = {
			top: false,
			left: false,
			right: false
		};
		tick().then(() => {
			const input = (inputs as HTMLElement[])[0];
			const inputOffset = input.offsetHeight + input.getBoundingClientRect().top;
			const picker = pdpPicker as HTMLElement;
			const pickerHeight = picker.offsetHeight + 10;
			const pickerOffset = picker.getBoundingClientRect();
			pickerPlace = {
				top: inputOffset >= pickerHeight && window.innerHeight - (inputOffset + pickerHeight) < 0,
				left: pickerOffset.left <= 0,
				right: window.innerWidth - (pickerOffset.left + pickerOffset.width) <= 0
			};
		});
	}
	function changeLocale(): void {
		const locales = locale.split(',');
		const index = locales.indexOf(currentLocale);
		currentLocale = locales[index + 1] || locales[0];
		const calendar = lang.calendar;
		core.calendar(calendar);
		fromDate!.calendar(calendar);
		toDate!.calendar(calendar);
		onDisplay!.calendar(calendar);
		for (const date of selectedDates) {
			date.calendar(calendar);
		}
		submitDate(false);
	}
	function clear(inputName: Inputs): void {
		const inputIndex = inputName === 'firstInput' ? 0 : 1;

		displayValue[inputIndex] = '';
		// $emit('clear');
		onClear?.();
		if (dualInput) {
			const values = attrs.value;
			if (values && Array.isArray(values))
				return setModel(values.map((val, i) => (i == inputIndex ? null : val)));
		}
		setModel('');
	}
	function startChangeTime(timeIndex: number, unit: 'minute' | 'hour', operator: 'add' | 'sub') {
		let time = selectedTimes[timeIndex];
		if (!time) {
			time = core.clone();
			if (!checkDate(time, 'time')) {
				time = toDate!
					.clone()
					.subDay()
					.time(core as PersianDate);
			}
			if (timeIndex == 1 && !selectedTimes.length) selectedTimes.push(time.clone());
			selectedTimes.push(time);
		}
		stopChangeTime();
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
			if (!checkDate(time[unit](currentAmount), 'time')) {
				time.parse(time.isSameOrAfter(toDate!.clone()) ? toDate!.clone() : fromDate!.clone());
			} else if (
				selectedTimes.length == 2 &&
				selectedTimes[0].isAfter(selectedTimes[1] as PersianDate)
			) {
				time.parse((timeIndex == 0 ? selectedTimes[1] : selectedTimes[0]) as PersianDate);
			}
			if (!isInDisable(time as PersianDate)) {
				if (type == 'time') {
					selectedDates[timeIndex] = time;
				} else if (selectedDates[timeIndex]) {
					selectedDates[timeIndex].time(time as PersianDate);
				}
				// $emit('select', time);
				onSelect?.(time);
				if (autoSubmit && !selectedTimes.some((sTime) => isInDisable(sTime as PersianDate)))
					submitDate(false);
			}
		};
		changeTime();
		interval = setInterval(changeTime, 100);
	}
	function stopChangeTime() {
		clearInterval(interval!);
	}
	function selectShorcut(dates: PersianDate[]) {
		selectedDates = dates.map((date, i) => {
			if (i == 0) onDisplay = date.clone();
			// $emit('select', date);
			onSelect?.(date);
			return date.clone();
		});
		if (autoSubmit) {
			submitDate();
		}
	}
	function setDate(dates: string | string[]) {
		if (!dates) return;
		if (mode == 'single' && typeof dates === 'string') dates = [dates];
		selectedDates = [];
		(dates as string[]).some((d, index) => {
			const date = core
				.clone()
				.fromGregorian((type == 'time' ? core.toString('YYYY-MM-DD') + ' ' : '') + d);
			if (Core.isPersianDate(date)) {
				selectedDates.push(date.clone());
				selectedTimes.push(date.clone());
				if (index == 0) onDisplay = date.clone();
			} else {
				selectedDates = selectedTimes = [];
				return true;
			}
		});
		if (selectedDates.length) submitDate();
	}
</script>

<div
	bind:this={rootElement}
	class="pdp {lang.dir.input} {mode === 'range' ? 'pdp-range' : ''} {modal
		? 'pdp-modal'
		: ''} {dualInput ? 'pdp-dual' : ''}"
>
	<slot name="before">
		{#if label}
			<label for={attrs.firstInput.id} {...attrs.label}>
				{label}
			</label>
		{/if}
	</slot>

	<div {...attrs.div}>
		{#each inputs as input, index}
			<!-- {#if !$$slots.icon || $slots.icon} -->
			{#if !slots.icon || slots.icon().length > 0}
				<div
					class="pdp-icon"
					class:pdp-pointer={['all', 'icon'].includes(clickOn)}
					class:pdp-inside={iconInside}
					onclick={() => showPicker('icon', index as 0 | 1)}
				>
					<slot name="icon">
						<PDPIcon icon={type} width="23" height="23" />
					</slot>
				</div>
			{/if}

			<input
				bind:this={inputs[index]}
				bind:value={displayValue[index]}
				type="text"
				autocomplete="off"
				{...attrs[input]}
				onfocus={() => showPicker('input', index as 0 | 1)}
				onkeydown={selectWithArrow}
			/>

			{#if clearable}
				<button class="pdp-clear" type="button" onclick={() => clear(input)}>
					<slot name="clear">
						<PDPIcon icon="clear" />
					</slot>
				</button>
			{/if}
		{/each}
	</div>

	<slot name="after" />

	{#if attrs.alt.name}
		<PDPAlt name={attrs.alt.name} format={formats.alt} dates={submitedValue} />
	{/if}

	{#if showDatePicker}
		<div>
			<div class="pdp-overlay" onclick={() => (showDatePicker = false)} />
			<div {...attrs.picker} bind:this={pdpPicker}>
				<div class="pdp-auto">
					{#if type.includes('date')}
						<ul class="pdp-select-month" style:display={showMonthSelect ? 'block' : 'none'}>
							{#each months as month, index}
								<button
									type="button"
									class:selected={month.selected}
									class:disabled={month.disabled}
									onclick={() => changeSelectedMonth(index)}
								>
									{month.label}
								</button>
							{/each}
						</ul>

						<ul
							class="pdp-select-year"
							style:display={showYearSelect ? 'block' : 'none'}
							bind:this={pdpSelectYear}
						>
							{#each years as year}
								<li
									class:selected={onDisplay.year() === year}
									onclick={() => changeSelectedYear(year)}
								>
									{year}
								</li>
							{/each}
						</ul>
					{/if}

					{#if type.includes('date')}
						<div class="pdp-header">
							{#if locale.includes(',')}
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
									class:disabled={!checkDate(onDisplay.clone().subMonth(), 'month')}
									title={lang.translations.prevMonth}
									onclick={() => changeSelectedMonth('sub')}
								>
									<slot name="right-arrow">
										<PDPArrow direction="right" inverse={lang.dir.picker === 'ltr'} />
									</slot>
								</button>

								<div>
									{#each Array(columnCount) as _, i}
										<div>
											<button class="pdp-month" type="button" onclick={() => showPart('month')}>
												{months[onDisplay.clone().addMonth(i).month()].label}
											</button>
											<button class="pdp-year" type="button" onclick={() => showPart('year')}>
												{onDisplay.clone().addMonth(i).year()}
											</button>
										</div>
									{/each}
								</div>

								<button
									class="pdp-arrow"
									class:disabled={!checkDate(onDisplay.clone().addMonth(), 'month')}
									title={lang.translations.nextMonth}
									onclick={() => changeSelectedMonth('add')}
								>
									<slot name="left-arrow">
										<PDPArrow direction="left" inverse={lang.dir.picker === 'ltr'} />
									</slot>
								</button>
							</div>
						</div>
					{/if}

					<div class="pdp-main" bind:this={pdpMain}>
						{#if type.includes('date')}
							<div class="pdp-date">
								{#each Array(columnCount) as _, i}
									<div class="pdp-column" data-column={i}>
										<div class="pdp-week">
											{#each lang.weekdays as weekday}
												<div class="pdp-weekday">{weekday}</div>
											{/each}
										</div>
										<div class="pdp-days">
											{#each monthDays[i] as week, wIndex}
												<div>
													{#each week as day, dIndex}
														{#if day}
															<button
																type="button"
																class="pdp-day"
																class:empty={day.empty}
																class:friday={day.friday}
																class:end-range={day.endRange}
																class:disabled={day.disabled}
																class:in-range={day.inRange}
																onclick={() => selectDate(day.raw, 'date')}
																onkeydown={() => selectDate(day.raw, 'date')}
																aria-label={day.val ? `Day ${day.val}` : 'Empty'}
																disabled={day.disabled}
															>
																{day.val}
															</button>
														{/if}
													{/each}
												</div>
											{/each}
										</div>
									</div>
								{/each}
							</div>
						{/if}

						{#if type.includes('time')}
							<div class="pdp-time inline">
								<div
									class="pdp-moment"
									class:column-direction={mode === 'range' && columnCount === 1}
								>
									{#each Array(mode === 'range' ? 2 : 1) as _, i}
										<div
											class:disabled={selectedTimes[i] &&
												(!checkDate(selectedTimes[i], 'time') || isInDisable(selectedTimes[i]))}
										>
											<div class="hour">
												<button
													ontouchstart={() => startChangeTime(i, 'hour', 'add')}
													onmousedown={() => startChangeTime(i, 'hour', 'add')}
													onkeydown={() => startChangeTime(i, 'hour', 'add')}
													ontouchend={stopChangeTime}
													onmouseup={stopChangeTime}
													onkeyup={stopChangeTime}
												>
													<slot name="up-arrow"><PDPArrow /></slot>
												</button>
												{selectedTimes[i] ? selectedTimes[i].hour('HH') : core.hour('HH')}
												<button
													ontouchstart={() => startChangeTime(i, 'hour', 'sub')}
													onmousedown={() => startChangeTime(i, 'hour', 'sub')}
													onkeydown={() => startChangeTime(i, 'hour', 'sub')}
													ontouchend={stopChangeTime}
													onmouseup={stopChangeTime}
													onkeyup={stopChangeTime}
												>
													<slot name="down-arrow"><PDPArrow direction="down" /></slot>
												</button>
											</div>
											:
											<div class="minute">
												<button
													ontouchstart={() => startChangeTime(i, 'minute', 'add')}
													onmousedown={() => startChangeTime(i, 'minute', 'add')}
													onkeydown={() => startChangeTime(i, 'minute', 'add')}
													ontouchend={stopChangeTime}
													onmouseup={stopChangeTime}
													onkeyup={stopChangeTime}
												>
													<slot name="up-arrow"><PDPArrow /></slot>
												</button>
												{selectedTimes[i] ? selectedTimes[i].minute('mm') : core.minute('mm')}
												<button
													ontouchstart={() => startChangeTime(i, 'minute', 'sub')}
													onmousedown={() => startChangeTime(i, 'minute', 'sub')}
													onkeydown={() => startChangeTime(i, 'minute', 'sub')}
													ontouchend={stopChangeTime}
													onmouseup={stopChangeTime}
													onkeyup={stopChangeTime}
												>
													<slot name="down-arrow"><PDPArrow direction="down" /></slot>
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
							<slot name="footer" />
							{#if selectedDates[0]}
								<small>{selectedDates[0].toString(formats.display)}</small>
							{/if}
							{#if selectedDates.length === 2}
								<small> - {selectedDates[1].toString(formats.display)}</small>
							{/if}
						</div>
						<div>
							{#if checkDate(core, 'date')}
								<button class="pdp-today" tabindex={tabIndex} onclick={goToToday}>
									{lang.translations.now}
								</button>
							{/if}
							{#if !autoSubmit && !selectedDates.some((date) => isInDisable(date))}
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
							<button
								type="button"
								class:selected={!dates.some(
									(date: PersianDate, i: number) =>
										!date.isSame(selectedDates[i]?.toString('datetime'))
								)}
								onclick={() => selectShorcut(dates)}
								onkeydown={() => selectShorcut(dates)}
							>
								{name}
							</button>
						{/each}
					</ul>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	@use './assets/sass/app.scss';
</style>
