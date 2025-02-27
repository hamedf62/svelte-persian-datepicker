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

	interface Props {
		select?: (date: PersianDate) => void;
		submit?: (date: PersianDate | PersianDate[]) => void;
		clear?: () => void;
		open?: () => void;
		close?: () => void;
		modelValue?: PersianDate | PersianDate[] | string | string[];
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
		localeConfig?: RecursivePartial<Langs>;
		styles?: Styles;
		color?: 'blue' | 'red' | 'pink' | 'orange' | 'green' | 'purple' | 'gray';
		dualInput?: boolean;
		iconInside?: boolean;
		shortcut?: boolean | Shortcuts;
	}

	let {
		select: onSelect = () => {}, // Default to no-op function,
		submit: onSubmit = () => {}, // Default to no-op function,
		clear: onClear = () => {}, // Default to no-op function,
		open: onOpen = () => {}, // Default to no-op function
		close: onClose = () => {}, // Default to no-op function
		modelValue: modelValueProp,
		format: formatProp,
		inputFormat: inputFormatProp,
		displayFormat: displayFormatProp,
		type: typeProp = 'date',
		from: fromProp = typeProp === 'time' ? '' : '1300',
		to: toProp = typeProp === 'time' ? '23:59' : '1430',
		show: showProp = false,
		clickOn: clickOnProp = 'all',
		modal: modalProp = false,
		label: labelProp = '',
		column: columnProp = 1,
		autoSubmit: autoSubmitProp = true,
		mode: modeProp = 'range',
		locale: localeProp = 'fa',
		clearable: clearableProp = true,
		disable: disableProp,
		localeConfig: localeConfigProp,
		styles: stylesProp,
		color: colorProp,
		dualInput: dualInputProp = false,
		iconInside: iconInsideProp = false,
		shortcut: shortcutProp = false,
		...restAttrs
	}: Props & HTMLInputAttributes = $props();

	// Reactive state
	let coreState = $state(new PersianDate());
	let onDisplayState: PersianDate | undefined = $state();
	let selectedDatesState: PersianDate[] = $state([]);
	let selectedTimesState: PersianDate[] = $state([]);
	let showDatePickerState = $state(showProp);
	let showYearSelectState = $state(false);
	let showMonthSelectState = $state(false);
	let displayValueState: string[] = $state([]);
	let inputNameState: Inputs = $state('firstInput');
	let pickerPlaceState: PickerPlace = $state({} as PickerPlace);
	let documentWidthState = $state(typeof window !== 'undefined' ? window.innerWidth : Infinity);
	let currentLocaleState = $state(localeProp.split(',')[0]);
	let submitedValueState: PersianDate[] = $state([]);

	let langs = Core.langs;
	let interval: ReturnType<typeof setInterval> | null = $state(null);
	let pdpPicker: HTMLElement | undefined = $state();
	let pdpMain = $state();
	let pdpSelectYear: HTMLElement | undefined = $state();

	let inputsElement: (HTMLInputElement | undefined)[] = $state([]);
	let rootElement: HTMLElement;

	let lang: Langs[string] = $derived(langs[currentLocaleState]);

	let inputs: Inputs[] = dualInputProp ? ['firstInput', 'secondInput'] : ['firstInput'];

	let defaultDate = $derived({
		from: (typeProp === 'time' ? coreState.toString('jYYYY/jMM/jDD') + ' ' : '') + fromProp,
		to: (typeProp === 'time' ? coreState.toString('jYYYY/jMM/jDD') + ' ' : '') + toProp
	});

	let fromDateState: PersianDate = $state(
		coreState.clone().parse(defaultDate.from).calendar(lang.calendar)
	);
	let toDateState: PersianDate = $state(
		coreState
			.clone()
			.parse(defaultDate.to)
			.endOf(Core.getLastUnit(toProp, typeProp))
			.calendar(lang.calendar)
	);



	onMount(() => {
		Core.setColor(colorProp, rootElement as HTMLElement);
		Core.setStyles(stylesProp, rootElement as HTMLElement);

		const val = modelValueProp as string | string[];
	if (val) {
		setDate(val);
	} else {
		const today = () => coreState.clone();
		if (typeProp == 'date') today().startOf('date');
		if (checkDate(today(), 'date')) {
			onDisplayState = today();
		} else {
			onDisplayState = nearestDate(today()).startOf('date');
		}
	}


		window.addEventListener('resize', () => {
			documentWidthState = window.innerWidth;
		});
		if (typeProp != 'date') {
			onDisplayState!.time(coreState as PersianDate);
		}
	});


	let attrs = $derived.by((): Attrs => {
		const attrsLocal: Attrs = {
			div: { class: 'pdp-group' },
			label: { class: 'pdp-label' },
			alt: {},
			picker: { class: 'pdp-picker' },
			firstInput: { class: 'pdp-input' },
			secondInput: { class: 'pdp-input' }
		};

		for (const [key, value] of Object.entries(restAttrs)) {

			const match = key.match(/(div|label|alt|picker|firstInput|secondInput)-(.*)/);
			if (match) {
				const [, group, attr] = match as [string, keyof Attrs, string];
				attrsLocal[group][attr] = value as string;
			} else {
				attrsLocal.firstInput[key] = value as string;
			}
		}
		attrsLocal.picker.class = [
			attrsLocal.picker.class,
			{
				'pdp-top': pickerPlaceState.top,
				'pdp-left': pickerPlaceState.left,
				'pdp-right': pickerPlaceState.right
			},
			lang.dir.picker
		];

		if (modeProp == 'single' && dualInputProp) {
			attrsLocal['secondInput'].disabled = 'disabled';
		}
		if (showDatePickerState) {
			attrsLocal[inputNameState].class += ' pdp-focus';
		}

		return attrsLocal;
	});

	const formats = $derived.by((): Formats => {
		const displayFormatLocal: Obj<string, TypePart | 'datetime'> = {
			date: '?D ?MMMM',
			datetime: '?D ?MMMM HH:mm',
			time: 'HH:mm'
		};
		const formatLocal: Obj<string, TypePart | 'datetime'> = {
			date: 'YYYY-MM-DD',
			datetime: 'YYYY-MM-DD HH:mm',
			time: 'HH:mm'
		};
		return {
			model: formatProp || formatLocal[typeProp],
			input: inputFormatProp || lang.inputFormat || typeProp,
			display: displayFormatProp || lang.displayFormat || displayFormatLocal[typeProp],
			alt: (attrs.alt.format as string) || formatProp || formatLocal[typeProp]
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
			const scale = columnLocal / (modeProp == 'single' ? 1 : 2);
			if (typeof window !== 'undefined') {
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
						//FIXME: refactor
						monthLocal[week][day] = {
							friday: day == 6,
							raw: onDisplayState!.clone().addMonth(i).date(showDay),
							startRange:
								selectedDatesState[0] &&
								selectedDatesState[0].isSame(selectedYear, selectedMonth, showDay),
							endRange:
								selectedDatesState[1] &&
								selectedDatesState[1].isSame(selectedYear, selectedMonth, showDay),
							inRange:
								selectedDatesState.length == 2 &&
								coreState
									.clone()
									.parse(selectedYear, selectedMonth, showDay)
									.isBetween(
										...(selectedDatesState.map((date) => date.toString()) as [string, string])
									),
							disabled:
								!checkDate(onDisplayState!.clone().addMonth(i).date(showDay), 'date') ||
								isInDisable(onDisplayState!.clone().addMonth(i).date(showDay)),
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
		if (showYearSelectState) {
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
	});

	$effect(() => {
		if (showDatePickerState) {
			onOpen(); // Call the onOpen callback prop
		} else {
			if (!modalProp) {
				document.removeEventListener('scroll', locate);
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
		if (rootElement) {
			Core.setStyles(stylesProp, rootElement);
		}
	});

	$effect(() => {
		if (rootElement) {
			Core.setColor(colorProp, rootElement);
		}
	});

	function updateValue(date: PersianDate | PersianDate[] | string | string[]) {
		modelValueProp = date; // Update the prop directly
	}

	function showPart(part: CalendarPart) {
		if (part === 'year') {
			showMonthSelectState = false;
			showYearSelectState = !showYearSelectState;
		} else if (part === 'month') {
			showYearSelectState = false;
			showMonthSelectState = !showMonthSelectState;
		}
	}

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

	function changeSelectedYear(year: number): void {
		const cloneLocal = onDisplayState!.clone();
		cloneLocal.year(year);

		if (!checkDate(onDisplayState, 'date'))
			onDisplayState = nearestDate(onDisplayState as PersianDate);
		showYearSelectState = false;
		onDisplayState = cloneLocal;
	}

	function validate(date: PersianDate, part: TypePart): boolean {
		if (!checkDate(date, part) || isInDisable(date)) return false;
		return true;
	}

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
			(pdpMain as HTMLElement).addEventListener('mouseover', selectInRangeDate);
			if (selectedDatesState.length === 0) {
				selectedDatesState[0] = date;
				inputNameState = 'secondInput';
			} else if (inputNameState === 'secondInput') {
				inputNameState = 'firstInput';
				if (!date.isBefore(selectedDatesState[0] as PersianDate)) {
					selectedDatesState[1] = date;
				} else {
					if (selectedDatesState.length === 1) selectedDatesState.unshift(date);
					else {
						selectedDatesState = [date];
						inputNameState = 'secondInput';
					}
				}
			} else {
				selectedDatesState = [date];
				inputNameState = 'secondInput';
			}
			if (selectedDatesState.length == 2) {
				(pdpMain as HTMLElement).removeEventListener('mouseover', selectInRangeDate);
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
			(modeProp !== 'range' || (modeProp === 'range' && selectedDatesState.length == 2))
		) {
			submitDate();
			return 1;
		}
		return 0;
	}

	function setModel(date?: PersianDate | PersianDate[] | string | string[]): void {
		if (date === undefined) {
			date = selectedDatesState.map((el) => {
				return el.toString(formats.model);
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
				document.addEventListener('scroll', locate);
			}
		}
	}

	async function selectWithArrow(e: KeyboardEvent): Promise<void> {
		const fakeOnDisplayState = onDisplayState!.clone();
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
				selectInRangeDate({ target: focusedDay });
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
						onDisplay = coreState.clone().parse(value);
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
	function selectInRangeDate(e: any): void {
		const target = e.target;
		if (!target.classList.contains('pdp-day')) return;
		document.querySelectorAll(`.pdp .pdp-day`).forEach((el) => {
			el.classList.remove('in-range');
		});

		let column = getColumn(target);
		const hoveredDate = onDisplayState!
			.clone()
			.startOf('date')
			.addMonth(column)
			.date(target.innerText);
		const selectedDate = selectedDatesState[0].clone().startOf('date');
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
			selectedDate.parse(onDisplayState as PersianDate);
			if (number === 1) {
				selectedDate.startOf('month').subDay();
				column = -1;
			} else {
				selectedDate
					.addMonth(columnCountDerived - 1)
					.endOf('month')
					.addDay()
					.startOf('date');
				column = columnCountDerived;
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
						`.pdp-column[data-column='${column}'] .pdp-day[data-value='${selectedDate.date()}']`
					)!
					.classList.add('in-range');
			} else {
				break;
			}
		}
	}

	function submitDate(close = true): void {
		const displayDate = selectedDatesState.map((el) => {
			return el.toString(formats.input);
		});

		if (dualInputProp) displayValueState = displayDate;
		else displayValueState[0] = displayDate.join(' - ');

		submitedValueState = selectedDatesState.slice();
		setModel();

		onSubmit?.(modeProp === 'range' ? selectedDatesState : selectedDatesState[0]);

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
		pickerPlaceState = {
			top: false,
			left: false,
			right: false
		};
		tick().then(() => {
			const input = (inputsElement as HTMLElement[])[0];

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
		if (!dates) return;

		if (modeProp == 'single' && typeof dates === 'string') dates = [dates];
		selectedDatesState = [];

		(dates as string[]).some((d, index) => {
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
		if (selectedDatesState.length) submitDate();
	}

	// $inspect("coreState", coreState);
	// $inspect('inputsElement>>>', inputsElement);
	// $inspect('langs', langs);
	// $inspect('lang', lang);
	// $inspect('currentLocale', currentLocaleState);
	// $inspect('selectedDates', selectedDatesState);
	// $inspect('attrs', attrs);
	// $inspect('years', years);
	// $inspect('type', typeProp);
	// $inspect('locale', localeProp);
	// $inspect('from', fromProp);
	// $inspect('to', toProp);
	// $inspect('months', months);
	// $inspect('showMonthSelectState', showMonthSelectState);
	// $inspect('showYearSelectState', showYearSelectState);
	// $inspect('selectedDates', selectedDatesState);
	// $inspect('showDatePicker', showDatePickerState);
	// $inspect('interval', interval);
	// $inspect('selectedTimesState', selectedTimesState);
	// $inspect('onDisplayState', onDisplayState);
	// $inspect('selectedDatesState', selectedDatesState);
	// $inspect('displayValueState', displayValueState);
	// $inspect('fromDateState', fromDateState);
	// $inspect('toDateState', toDateState);
	// $inspect('inputs', inputs);
</script>

<div
	bind:this={rootElement}
	class="pdp {lang.dir.input} {modeProp === 'range' ? 'pdp-range' : ''} {modalProp
		? 'pdp-modal'
		: ''} {dualInputProp ? 'pdp-dual' : ''}"
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
				onclick={() => showPicker('icon', index as 0 | 1)}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						showPicker('icon', index as 0 | 1);
					}
				}}
			>
				<PDPIcon icon={typeProp} width="230" height="23" />
			</div>

			<input
				bind:this={inputsElement[index]}
				bind:value={displayValueState[index]}
				type="text"
				autocomplete="off"
				{...attrs[input]}
				onfocus={() => showPicker('input', index as 0 | 1)}
				onkeydown={selectWithArrow}
			/>

			{#if clearableProp}
				<button class="pdp-clear" type="button" onclick={() => clear(input)}>
					<!-- <slot name="clear"> -->
					<PDPIcon icon="clear" />
					<!-- </slot> -->
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
									<li class:selected={onDisplayState!.year() === year} class:disabled={!checkDate(year, 'year')}>
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
									{#each Array(columnCountDerived) as _, i}
										<div>
											<button
												class="pdp-month"
												type="button"
												onclick={() => showPart('month')}
												tabindex="-1"
											>
												{months[onDisplayState!.clone().addMonth(i).month()].label}
											</button>
											<button
												class="pdp-year"
												type="button"
												onclick={() => showPart('year')}
												tabindex="-1"
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
										<div class="pdp-week">
											<!-- week days above -->
											{#each lang.weekdays as weekday}
												<div class="pdp-weekday">{weekday}</div>
											{/each}
										</div>

										<div class="pdp-days">
											{#each monthDays[i] as week, wIndex}
												<div>
													{#each week as any[] as day, dIndex}
														{#if day}
															<div
																class="pdp-day"
																role="button"
																tabindex="0"
																class:tada={null}
																class:empty={day.empty}
																class:friday={day.friday}
																class:today={day.today}
																class:start-range={day.startRange}
																class:end-range={day.endRange}
																class:disabled={day.disabled}
																class:in-range={day.inRange}
																class:hover={day.hover}
																onclick={() => selectDate(day.raw, 'date')}
																onkeydown={() => selectDate(day.raw, 'date')}
																aria-label={day.val ? `Day ${day.val}` : 'Empty'}
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
													ontouchstart={(e) => { e.preventDefault();startChangeTime(i, 'hour', 'add')}}
													onmousedown={(e) => { e.preventDefault();startChangeTime(i, 'hour', 'add')}}
													onkeydown={(e) => { e.preventDefault();startChangeTime(i, 'hour', 'add')}}
													ontouchend={stopChangeTime}
													onmouseup={stopChangeTime}
													onkeyup={stopChangeTime}
												>
													<PDPArrow />
												</button>
												{selectedTimesState[i]
													? selectedTimesState[i].hour('HH')
													: coreState.hour('HH')}
												<button type="button"
													ontouchstart={(e) => { e.preventDefault();startChangeTime(i, 'hour', 'sub')}}
													onmousedown={(e) => { e.preventDefault();startChangeTime(i, 'hour', 'sub')}}
													onkeydown={(e) => { e.preventDefault();startChangeTime(i, 'hour', 'sub')}}
													ontouchend={stopChangeTime}
													onmouseup={stopChangeTime}
													onkeyup={stopChangeTime}
												>
													<PDPArrow direction="down" />
												</button>
											</div>
											:
											<div class="minute">
												<button type="button"
													ontouchstart={(e) => { e.preventDefault();startChangeTime(i, 'minute', 'add')}}
													onmousedown={(e) => { e.preventDefault();startChangeTime(i, 'minute', 'add')}}
													onkeydown={(e) => { e.preventDefault();startChangeTime(i, 'minute', 'add')}}
													ontouchend={stopChangeTime}
													onmouseup={stopChangeTime}
													onkeyup={stopChangeTime}
												>
													<PDPArrow />
												</button>
												{selectedTimesState[i]
													? selectedTimesState[i].minute('mm')
													: coreState.minute('mm')}
												<button type="button"
													ontouchstart={(e) => { e.preventDefault();startChangeTime(i, 'minute', 'sub')}}
													onmousedown={(e) => { e.preventDefault();startChangeTime(i, 'minute', 'sub')}}
													onkeydown={(e) => { e.preventDefault();startChangeTime(i, 'minute', 'sub')}}
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
							<!-- <slot name="footer" /> -->
							{#if selectedDatesState[0]}
								<small>{selectedDatesState[0].toString(formats.display)}</small>
							{/if}
							{#if selectedDatesState.length === 2}
								<small> - {selectedDatesState[1].toString(formats.display)}</small>
							{/if}
						</div>
						<div>
							{#if checkDate(coreState, 'date')}
								<button class="pdp-today" tabindex={tabIndex} onclick={goToToday}>
									{lang.translations.now}
								</button>
							{/if}
							{#if !autoSubmitProp && !selectedDatesState.some((date) => isInDisable(date))}
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

<style lang="scss">
	@use './assets/sass/app.scss';
</style>
