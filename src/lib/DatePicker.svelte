<script lang="ts">
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
		columnProp?: number | Record<number, number>;
		autoSubmit?: boolean;
		mode?: 'single' | 'range';
		locale?: string;
		clearable?: boolean;
		disable?: Disable;
		localeConfig?: RecursivePartial<Langs>;
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
		from = type === 'time' ? '' : '1300',
		to = type === 'time' ? '23:59' : '1499',
		show = true,
		clickOn = 'all',
		modal = false,
		label = 'pick a persian date:',
		columnProp = { 576: 1 },
		autoSubmit = true,
		mode = 'single',
		locale = 'fa',
		clearable = true,
		disable,
		localeConfig,
		styles,
		color,
		dualInput = false,
		iconInside = false,
		shortcut = true
	}: Props = $props();

	function updateValue(date?: PersianDate | PersianDate[] | string | string[]) {
		console.log('value>>>>', date);
		modelValue = date; // Update the prop directly
	}

	// Props
	let rootElement: HTMLElement;

	// Reactive state
	let core = $state(new PersianDate());
	let onDisplay: PersianDate | undefined = $state();
	let fromDate: PersianDate | undefined = $state();
	let toDate: PersianDate | undefined = $state();
	let selectedDates: PersianDate[] = $state([]);
	let selectedTimes: PersianDate[] = $state([]);
	let showDatePicker = $state(false);
	let showYearSelect = $state(false);
	let showMonthSelect = $state(false);
	let displayValue: string[] = $state([]);
	let inputName: Inputs = $state('firstInput');
	let pickerPlaceState: PickerPlace = $state({} as PickerPlace);
	let documentWidth = $state(typeof window !== 'undefined' ? window.innerWidth : Infinity);
	let langs = Core.langs;
	let currentLocale = $state(locale.split(',')[0]);
	let interval: ReturnType<typeof setInterval>;
	let submitedValue: PersianDate[] = $state([]);

	// Refs
	let root: HTMLElement;
	// let pdpPicker:HTMLElement=$state();
	let pdpPicker = $state();
	let pdpMain = $state();
	let pdpSelectYear: HTMLElement;
	//  | null = $state(null);
	let inputs1: HTMLInputElement[] = $state([]);
	$inspect('selectedDates', selectedDates);
	$inspect('showDatePicker', showDatePicker);
	$inspect('onDisplay', onDisplay);

	onMount(() => {
		// initializeDates();

		Core.setColor(color, rootElement as HTMLElement);
		Core.setStyles(styles, rootElement as HTMLElement);

		const calendar = lang.calendar;
		fromDate = core.clone().parse(defaultDate.from).calendar(calendar);
		toDate = core
			.clone()
			.parse(defaultDate.to)
			.endOf(Core.getLastUnit(to, type))
			.calendar(calendar);
		core.calendar(calendar);

		const val = attrs.modelValue as string | string[];
		if (val) {
			setDate(val);
		} else {
			const today = core.clone();
			if (type == 'date') today.startOf('date');
			if (checkDate(today, 'date')) {
				onDisplay = today;
			} else {
				onDisplay = nearestDate(today).startOf('date');
			}
		}
		window.addEventListener('resize', () => {
			documentWidth = window.innerWidth;
		});
		if (type != 'date') {
			onDisplay!.time(core as PersianDate);
		}
		showDatePicker = show;

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});

	// Computed

	let lang: Langs[string] = langs[currentLocale];
	let columnCount = calculateColumnCount();
	// let monthDays = $state();

	// let inputs: Inputs[] = !dualInput ? ['firstInput'] : ['firstInput', 'secondInput'];
	function calculateInputs(): Inputs[] {
		return !dualInput ? ['firstInput'] : ['firstInput', 'secondInput'];
	}
	let inputs = $state(calculateInputs());
	$inspect('inputs', inputs);

	function calculateAttrs(): Attrs {
		const attrs: Attrs = {
			div: { class: 'pdp-group' },
			label: { class: 'pdp-label' },
			alt: {},
			picker: { class: 'pdp-picker' },
			firstInput: { class: 'pdp-input' },
			secondInput: { class: 'pdp-input' }
		};
		for (const key in this.$attrs) {
			try {
				// @ts-expect-error type
				const [, group, attr] = key.match(/(div|label|alt|picker|firstInput|secondInput)-(.*)/) as [
					void,
					keyof Attrs,
					string
				];
				attrs[group][attr] = this.$attrs[key];
			} catch {
				attrs['firstInput'][key] = this.$attrs[key] as string;
			}
		}
		attrs.picker.class = [
			attrs.picker.class,
			{
				'pdp-top': pickerPlaceState.top,
				'pdp-left': pickerPlaceState.left,
				'pdp-right': pickerPlaceState.right
			},
			this.lang.dir.picker
		];
		if (this.mode == 'single' && this.dualInput) {
			attrs['secondInput'].disabled = 'disabled';
		}
		if (this.showDatePicker) {
			attrs[this.inputName].class += ' pdp-focus';
		}
		return attrs;
	}

	let attrs = $derived(calculateAttrs());

	// function calculateDefaultDate(): DefaultDate {
	// 	const prefixLocal = type === 'time' ? core.toString('jYYYY/jMM/jDD') + ' ' : '';
	// 	return {
	// 		from: prefixLocal + from,
	// 		to: prefixLocal + to
	// 	};
	// }
	// const defaultDate = calculateDefaultDate();
	let defaultDate = $derived({
		from: (type === 'time' ? core.toString('jYYYY/jMM/jDD') + ' ' : '') + from,
		to: (type === 'time' ? core.toString('jYYYY/jMM/jDD') + ' ' : '') + to
	});

	// function initializeDates() {
	// 	console.log('initualzed date?>>>>>>>');
	// 	Core.setColor(color, rootElement);
	// 	Core.setStyles(styles, rootElement);

	// 	const calendar = lang.calendar;
	// 	// const fromValue = typeof from === 'function' ? from({ type }) : from;
	// 	fromDate = core.clone().parse(defaultDate.from).calendar(calendar);
	// 	toDate = core
	// 		.clone()
	// 		.parse(defaultDate.to)
	// 		.endOf(Core.getLastUnit(to, type))
	// 		.calendar(calendar);
	// 	core.calendar(calendar);

	// 	const val = attrs.modelValue as string | string[];
	// 	if (val) {
	// 		setDate(val);
	// 	} else {
	// 		const today = core.clone();
	// 		if (type == 'date') today.startOf('date');
	// 		if (checkDate(today, 'date')) {
	// 			onDisplay = today;
	// 		} else {
	// 			onDisplay = nearestDate(today).startOf('date');
	// 		}
	// 	}
	// 	window.addEventListener('resize', () => {
	// 		documentWidth = window.innerWidth;
	// 	});
	// 	if (type != 'date') {
	// 		onDisplay!.time(core as PersianDate);
	// 	}
	// 	showDatePicker = show;
	// }
	// initializeDates();
	langs = Core.mergeObject(Core.langs, localeConfig) as Langs;
	$effect(() => {
		console.log('effects');
		if (show !== undefined) showDatePicker = show;
		if (from) fromDate?.fromJalali(from);
		if (to) toDate?.fromJalali(to);
		if (mode === 'single' && selectedDates.length === 2) selectedDates.pop();

		if (styles) Core.setStyles(styles, rootElement);
		if (color) Core.setColor(color, rootElement);
	});

	// function calculateYears(): number[] {
	// 	let start: number = fromDate!.year();
	// 	const end: number = toDate!.year();
	// 	console.log(start);
	// 	console.log(end);
	// 	return Array(end - start + 1)
	// 		.fill(null)
	// 		.map(() => start++);
	// }
	// let years = calculateYears();
	function calculateYears(start: number, end: number): number[] {
		return Array.from({ length: end - start + 1 }, (_, i) => start + i);
	}

	const years = $derived<number[]>(
		fromDate && toDate ? calculateYears(fromDate.year(), toDate.year()) : []
	);

	function calculateColumnCount(): number {
		let columnLocal = 2;
		if (Core.isNumber(columnProp)) {
			columnLocal = columnProp as number;
		} else {
			const breakpoint = Object.keys(columnProp)
				.sort((a, b) => +a - +b)
				.find((bp) => documentWidth <= +bp);
			if (breakpoint) columnLocal = (columnProp as Obj)[breakpoint] as number;
		}
		if (type.includes('time')) {
			const scale = columnLocal / (mode == 'single' ? 1 : 2);
			(rootElement as HTMLElement).style.setProperty('--time-scale', (scale > 1 ? scale : 1) + '');
		}
		return columnLocal;
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
	let monthDays = $derived(calculateMonthDays());

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
	let months = $derived(calculateMonths());

	function calculateFormats(): Formats {
		const displayFormat1: Obj<string, TypePart | 'datetime'> = {
			date: '?D ?MMMM',
			datetime: '?D ?MMMM HH:mm',
			time: 'HH:mm'
		};
		const format1: Obj<string, TypePart | 'datetime'> = {
			date: 'YYYY-MM-DD',
			datetime: 'YYYY-MM-DD HH:mm',
			time: 'HH:mm'
		};
		return {
			model: format || format1[type],
			input: inputFormat || lang.inputFormat || type,
			display: displayFormat || lang.displayFormat || displayFormat1[type],
			alt: (attrs.alt.format as string) || format || format1[type]
		};
	}
	let formats = calculateFormats();

	// function calculateInputs(): Inputs[] {
	// 	return !dualInput ? ['firstInput'] : ['firstInput', 'secondInput'];
	// }
	function calculateTabIndex(): number | undefined {
		return +(attrs.secondInput.tabindex || attrs.firstInput.tabindex) + 1 || undefined;
	}
	let tabIndex = calculateTabIndex();

	function calculateShortcuts(): Shortcuts | false {
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
	let shortcuts = $derived(calculateShortcuts());

	function calculateNextLocale(): string {
		const locales = locale.split(',');
		const index = locales.indexOf(currentLocale);
		const locale1 = locales[index + 1] || locales[0];
		return langs[locale1].translations.label;
	}

	let nextLocale = calculateNextLocale();

	function handleResize() {
		documentWidth = window.innerWidth;
	}

	function showPart(part) {
		if (part === 'year') {
			showMonthSelect = false;
			showYearSelect = !showYearSelect;
		} else if (part === 'month') {
			showYearSelect = false;
			showMonthSelect = !showMonthSelect;
		}
	}

	// Effect to handle scrolling after DOM updates
	$effect(() => {
		if (showYearSelect) {
			tick().then(() => {
				const selectedYearElement = pdpSelectYear.querySelector('li.selected');
				if (selectedYearElement) {
					const selectedYearTop = selectedYearElement.offsetTop;
					pdpSelectYear.scrollTo({
						top: selectedYearTop,
						behavior: 'smooth'
					});
				}
			});
		}
	});

	function changeSelectedMonth(month: 'add' | 'sub' | number): void {
		const clone = onDisplay!.clone();
		console.log('changeSelectedMonth', month);
		console.log(onDisplay);
		console.log(checkDate(onDisplay, 'month'));
		console.log('fromDate', fromDate, toDate);
		console.log(from, to);

		if (month == 'add') {
			onDisplay!.addMonth();
		} else if (month == 'sub') {
			onDisplay!.subMonth();
		} else onDisplay!.month(month);
		if (checkDate(onDisplay, 'month')) showMonthSelect = false;
		else onDisplay = clone;
		console.log(onDisplay);
		console.log(checkDate(onDisplay, 'month'));
		console.log(from, to);
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
		console.log(date, part);
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
			// console.log("inja>>")
			// console.log(date.startOf('date'));
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
		console.log('final date', date);
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
	function calculateCheckDate(date: unknown, part: CalendarPart | TypePart): boolean {
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

	let checkDate = $derived(calculateCheckDate);

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
			(inputs1 as HTMLElement[])[index].focus();
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
				console.log(selectedDate);
				console.log(selectedDate.date());
				console.log('column', column);
				console.log(
					document.querySelector(
						`.pdp-column[data-column='${column}'] .pdp-day[value='${selectedDate.date()}']`
					)
				);
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

		console.log('formats.input', formats.input);
		console.log('displayDate', displayDate);

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

	$inspect('displayValue', displayValue);

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
		pickerPlaceState = {
			top: false,
			left: false,
			right: false
		};
		tick().then(() => {
			const input = (inputs1 as HTMLElement[])[0];
			const inputOffset = input.offsetHeight + input.getBoundingClientRect().top;
			const picker = pdpPicker as HTMLElement;
			const pickerHeight = picker.offsetHeight + 10;
			const pickerOffset = picker.getBoundingClientRect();
			pickerPlaceState = {
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

	$inspect('langs', langs);
	$inspect('lang', lang);
	$inspect('currentLocale', currentLocale);
	$inspect('selectedDates', selectedDates);
	$inspect('fromDate', fromDate);
	$inspect('toDate', toDate);
	$inspect('attrs', attrs);
	$inspect('years', years);
	$inspect('type', type);
	$inspect('locale', locale);
	$inspect('from', from);
	$inspect('to', to);
	// $inspect('months', months);
</script>

<div
	bind:this={rootElement}
	class="pdp {lang.dir.input} {mode === 'range' ? 'pdp-range' : ''} {modal
		? 'pdp-modal'
		: ''} {dualInput ? 'pdp-dual' : ''}"
>
	{#if label}
		<label for={attrs.firstInput.id} {...attrs.label}>
			{label}
		</label>
	{/if}

	<div {...attrs.div}>
		{#each inputs as input, index}
			{input}
			{index}
			<!-- {#if !$$slots.icon || $slots.icon} -->
			{#if !slots.icon || slots.icon().length > 0}
				<div
					role="button"
					tabindex="0"
					class="pdp-icon"
					class:pdp-pointer={['all', 'icon'].includes(clickOn)}
					class:pdp-inside={iconInside}
					onclick={() => showPicker('icon', index as 0 | 1)}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							showPicker('icon', index as 0 | 1);
						}
					}}
				>
					<!-- <slot name="icon"> -->
					<PDPIcon icon={type} width="230" height="23" />
					<!-- </slot> -->
				</div>
			{/if}

			<input
				bind:this={inputs1}
				bind:value={displayValue[index]}
				type="text"
				autocomplete="off"
				{...attrs[input]}
				onfocus={() => showPicker('input', index as 0 | 1)}
				onkeydown={selectWithArrow}
				defaultValue="123"
			/>

			{#if clearable}
				<button class="pdp-clear" type="button" onclick={() => clear(input)}>
					<!-- <slot name="clear"> -->
					<PDPIcon icon="clear" />
					<!-- </slot> -->
				</button>
			{/if}
		{/each}
	</div>

	{#if attrs.alt.name}
		<PDPAlt name={attrs.alt.name} format={formats.alt} dates={submitedValue} />
	{/if}

	{#if showDatePicker}
		<div>
			<button
				type="button"
				class="pdp-overlay"
				aria-label="Close datepicker"
				onclick={() => (showDatePicker = false)}
			></button>
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
								<button
									type="button"
									class:selected={onDisplay.year() === year}
									onclick={() => changeSelectedYear(year)}
									onkeydown={() => changeSelectedYear(year)}
								>
									{year}
								</button>
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
									<PDPArrow
										direction="right"
										inverse={lang.dir.picker === 'ltr'}
										width={10}
										height={10}
									/>
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
									<!-- <slot name="left-arrow"> -->
									<PDPArrow direction="left" inverse={lang.dir.picker === 'ltr'} />
									<!-- </slot> -->
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
													{#each week as any[] as day, dIndex}
														{#if day}
															{day.raw}
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
													<!-- <slot name="up-arrow"> -->
													<PDPArrow />
													<!-- </slot> -->
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
													<!-- <slot name="down-arrow"> -->
													<PDPArrow direction="down" />
													<!-- </slot> -->
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
													<!-- <slot name="up-arrow"> -->
													<PDPArrow />
													<!-- </slot> -->
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
													<!-- <slot name="down-arrow"> -->
													<PDPArrow direction="down" />
													<!-- </slot> -->
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
							<!-- <slot name="footer" /> -->
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
								999
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
