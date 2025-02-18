<script lang="ts">
    import { onMount, createEventDispatcher } from "svelte";
    import PDPArrow from "./components/PDPArrow.svelte";
    import PDPIcon from "./components/PDPIcon.svelte";
    import PDPAlt from "./components/PDPAlt.svelte";
    import { PersianDate, Core } from "./modules/core";
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
      DefaultDate,
    } from "./modules/types";

    const dispatch = createEventDispatcher();

    // -- props (Svelte “export” variables) --
    export let format: string;
    export let inputFormat: string;
    export let displayFormat: string;
    export let type: "date" | "time" | "datetime" = "date";
    export let from: string = type === "time" ? "" : "1300";
    export let to: string = type === "time" ? "23:59" : "1499";
    export let show: boolean = false;
    export let clickOn: "all" | "input" | "icon" | "none" = "all";
    export let modal: boolean = false;
    export let label: string;
    export let column: number | Record<number, number> = { 576: 1 };
    export let autoSubmit: boolean = true;
    export let mode: "single" | "range" = "range";
    export let locale: string = "fa";
    export let clearable: boolean = false;
    export let disable: Disable;
    export let localeConfig: RecursivePartial<Langs> = {};
    export let styles: Styles;
    export let color: "blue" | "red" | "pink" | "orange" | "green" | "purple" | "gray";
    export let dualInput: boolean = false;
    export let iconInside: boolean = false;
    export let shortcut: boolean | Shortcuts = false;

    // -- internal state --
    let core = new PersianDate();
    let onDisplay: PersianDate = core.clone();
    let fromDate: PersianDate;
    let toDate: PersianDate;
    let selectedDates: PersianDate[] = [];
    let selectedTimes: PersianDate[] = [];
    let showDatePicker = false;
    let showYearSelect = false;
    let showMonthSelect = false;
    let displayValue: string[] = [];
    let inputName: Inputs = "firstInput";
    let pickerPlace: PickerPlace = { top: false, left: false, right: false };
    let documentWidth: number = typeof window !== "undefined" ? window.innerWidth : Infinity;
    let langs: Langs = Core.langs;
    let currentLocale = locale.split(",")[0];
    let interval: ReturnType<typeof setInterval> | null = null;
    let submitedValue: PersianDate[] = [];

    // -- reactive declarations --
    $: lang = langs[currentLocale];
    $: formats = {
      model: format || (type === "date" ? "YYYY-MM-DD" : type === "datetime" ? "YYYY-MM-DD HH:mm" : "HH:mm"),
      input: inputFormat || lang.inputFormat || type,
      display:
        displayFormat || lang.displayFormat || (type === "date" ? "?D ?MMMM" : type === "datetime" ? "?D ?MMMM HH:mm" : "HH:mm"),
      alt: format || "", // adjust as needed
    };

    // -- example computed properties (convert others similarly) --
    $: columnCount = typeof column === "number"
      ? column
      : // find appropriate breakpoint
        Object.keys(column)
          .sort((a, b) => +a - +b)
          .find((bp) => documentWidth <= +bp) !== undefined
      ? (column as Record<number, number>)[+Object.keys(column)
          .sort((a, b) => +a - +b)
          .find((bp) => documentWidth <= +bp)!]
      : 2;

    // -- Methods (converted to functions) --

    function checkDate(date: PersianDate, part: CalendarPart | TypePart): boolean {
      let fromStr, toStr;
      if (part === "year") {
        fromStr = fromDate.toString("?YYYY");
        toStr = toDate.toString("?YYYY");
      } else if (part === "month") {
        fromStr = fromDate.toString("?YYYY/?MM");
        toStr = toDate.toString("?YYYY/?MM");
      } else if (part === "date") {
        fromStr = fromDate.toString();
        toStr = toDate.toString();
      } else if (part === "time") {
        fromStr = fromDate.toString(type.includes("time") ? "datetime" : "date");
        toStr = toDate.toString(type.includes("time") ? "datetime" : "date");
      }
      return date.isBetween(fromStr, toStr, "[]");
    }

    function nearestDate(date: PersianDate): PersianDate {
      return Math.abs(date.diff(fromDate)) <= Math.abs(date.diff(toDate))
        ? fromDate.clone()
        : toDate.clone();
    }

    function changeSelectedMonth(month: "add" | "sub" | number): void {
      const clone = onDisplay.clone();
      if (month === "add") {
        onDisplay.addMonth();
      } else if (month === "sub") {
        onDisplay.subMonth();
      } else {
        onDisplay.month(month);
      }
      if (checkDate(onDisplay, "month")) {
        showMonthSelect = false;
      } else {
        onDisplay = clone;
      }
    }

    function changeSelectedYear(year: number): void {
      onDisplay.year(year);
      if (!checkDate(onDisplay, "date"))
        onDisplay = nearestDate(onDisplay);
      showYearSelect = false;
    }

    function submitDate(close = true): void {
      const displayDates = selectedDates.map((d) => d.toString(formats.input));
      if (dualInput) displayValue = displayDates;
      else displayValue[0] = displayDates.join(" - ");
      submitedValue = selectedDates.slice();
      dispatch("update:modelValue", selectedDates);
      dispatch("submit", mode === "range" ? selectedDates : selectedDates[0]);
      if (close) showDatePicker = false;
    }

    function goToToday(): void {
      showMonthSelect = false;
      showYearSelect = false;
      onDisplay = core.now().clone();
      if (type.includes("time") && selectedDates.length) {
        const lastIndex = selectedDates.length - 1;
        let time = selectedDates[lastIndex];
        time.time(onDisplay);
        selectedTimes[lastIndex] = time;
        if (autoSubmit && checkDate(time, "time") && true) {
          submitDate(false);
        }
      }
      // implement Svelte-friendly animation if needed
    }

    function keyboardHandler(e: KeyboardEvent) {
      // implement keyboard handling (arrow keys, Enter, etc.)
      // For example:
      if (e.key === "Enter") {
        // Do something, e.g. submit the date
        submitDate();
      }
    }

    // (Other functions such as selectDate, clear, startChangeTime, stopChangeTime, etc. should be similarly converted.)

    onMount(() => {
      langs = Core.mergeObject(langs, localeConfig) as Langs;
      fromDate = core.clone().parse(
        (type === "time" ? core.toString("jYYYY/jMM/jDD") + " " : "") + from
      );
      toDate = core
        .clone()
        .parse((type === "time" ? core.toString("jYYYY/jMM/jDD") + " " : "") + to)
        .endOf(Core.getLastUnit(to, type));
      core.calendar(lang.calendar);
      // Initialize onDisplay based on modelValue logic (omitted for brevity)
      let today = core.clone();
      if (type === "date") today.startOf("date");
      onDisplay = checkDate(today, "date") ? today : nearestDate(today).startOf("date");
      window.addEventListener("resize", () => {
        documentWidth = window.innerWidth;
      });
      if (type !== "date") onDisplay.time(core);
      showDatePicker = show;
    });
</script>

<!-- Template -->
<div class="pdp {mode === 'range' ? 'pdp-range' : ''} {modal ? 'pdp-modal' : ''} {dualInput ? 'pdp-dual' : ''} {lang.dir.input}">
  <slot name="before">
    {#if label}
      <label for="firstInput">{label}</label>
    {/if}
  </slot>
  <div class="pdp-group">
    {#each (dualInput ? ["firstInput", "secondInput"] : ["firstInput"]) as input, index}
      <div
        class="pdp-icon {clickOn === 'all' || clickOn === 'icon' ? 'pdp-pointer' : ''} {iconInside ? 'pdp-inside' : ''}"
        on:click={() => {
          if (clickOn === "all" || clickOn === "icon") {
            showDatePicker = true;
          }
        }}
      >
        <slot name="icon">
          <PDPIcon icon={type} width="23" height="23" />
        </slot>
      </div>
      <input
        id={input}
        bind:value={displayValue[index]}
        type="text"
        autocomplete="off"
        on:focus={() => {
          if (clickOn === "all" || clickOn === "input") showDatePicker = true;
        }}
        on:keydown={keyboardHandler}
      />
      {#if clearable}
        <button class="pdp-clear" type="button" on:click={() => {/* clear logic */}}>
          <slot name="clear">
            <PDPIcon icon="clear" />
          </slot>
        </button>
      {/if}
    {/each}
  </div>
  <slot name="after"></slot>
  {#if submitedValue.length}
    <PDPAlt name="" format={formats.alt} dates={submitedValue} />
  {/if}
  {#if showDatePicker}
    <div class="pdp-overlay" on:click={() => (showDatePicker = false)}></div>
    <div class="pdp-picker">
      <!-- The picker content (date and/or time) is converted below: -->
      <div class="pdp-auto">
        {#if type.includes("date")}
          <ul class="pdp-select-month" hidden={!showMonthSelect}>
            {#each Object.values(/* your months object */ {}) as month, i}
              <li
                class:selected={month.selected}
                class:disabled={month.disabled}
                on:click={() => changeSelectedMonth(i)}
              >
                {month.label}
              </li>
            {/each}
          </ul>
          <ul class="pdp-select-year" hidden={!showYearSelect}>
            {#each /* your years array */ [] as year}
              <li class:selected={onDisplay.year() === year} on:click={() => changeSelectedYear(year)}>
                {year}
              </li>
            {/each}
          </ul>
        {/if}

        {#if type.includes("date")}
          <div class="pdp-header">
            {#if locale.includes(",")}
              <div class="top">
                <div>{lang.translations.text}</div>
                <button type="button" on:click={() => {/* changeLocale logic */}}>
                  {/* nextLocale logic */}
                  Next
                </button>
              </div>
            {/if}
            <div class="bottom">
              <button
                type="button"
                class="pdp-arrow { !checkDate(onDisplay.clone().subMonth(), 'month') ? 'disabled' : '' }"
                title={lang.translations.prevMonth}
                on:click={() => changeSelectedMonth("sub")}
              >
                <slot name="right-arrow">
                  <PDPArrow direction="right" width="10" height="10" inverse={lang.dir.picker === "ltr"} />
                </slot>
              </button>
              <div>
                {#each Array(columnCount) as _, i}
                  <div>
                    <button type="button" class="pdp-month" on:click={() => {/* show month select */}}>
                      {/** Use onDisplay.clone().addMonth(i) logic to display label **/}
                      Month
                    </button>
                    <button type="button" class="pdp-year" on:click={() => {/* show year select */}}>
                      {/** onDisplay.clone().addMonth(i).year() **/}
                      Year
                    </button>
                  </div>
                {/each}
              </div>
              <button
                type="button"
                class="pdp-arrow { !checkDate(onDisplay.clone().addMonth(), 'month') ? 'disabled' : '' }"
                title={lang.translations.nextMonth}
                on:click={() => changeSelectedMonth("add")}
              >
                <slot name="left-arrow">
                  <PDPArrow direction="left" width="10" height="10" inverse={lang.dir.picker === "ltr"} />
                </slot>
              </button>
            </div>
          </div>
        {/if}

        <div class="pdp-main">
          {#if type.includes("date")}
            <div class="pdp-date">
              {#each Array(columnCount) as _, colIndex}
                <div class="pdp-column" data-column={colIndex}>
                  <div class="pdp-week">
                    {#each lang.weekdays as weekday}
                      <div class="pdp-weekday">{weekday}</div>
                    {/each}
                  </div>
                  <div class="pdp-days">
                    {#each /* your monthDays[colIndex] array */ [] as week}
                      <div>
                        {#each week as day}
                          <div
                            class="pdp-day
                              {day.empty ? 'empty' : ''}
                              {day.friday ? 'friday' : ''}
                              {day.today ? 'today' : ''}
                              {day.startRange ? 'start-range' : ''}
                              {day.endRange ? 'end-range' : ''}
                              {day.disabled ? 'disabled' : ''}
                              {day.inRange ? 'in-range' : ''}"
                            data-value={day.val}
                            on:click={() => {
                              // call selectDate(day.raw, 'date')
                            }}
                          >
                            {day.val}
                          </div>
                        {/each}
                      </div>
                    {/each}
                  </div>
                </div>
              {/each}
            </div>
          {/if}

          {#if type.includes("time")}
            <div class="pdp-time inline">
              <div class="pdp-column">
                {#each Array(columnCount) as _, i}
                  <div></div>
                {/each}
              </div>
              <div class="pdp-moment {mode === 'range' && columnCount === 1 ? 'column-direction' : ''}">
                {#each Array(mode === "range" ? 2 : 1) as _, i}
                  <div class="{selectedTimes[i] && (!checkDate(selectedTimes[i], 'time') || true) ? 'disabled' : ''}">
                    <div class="hour">
                      <button
                        type="button"
                        on:touchstart|preventDefault={() => {/* startChangeTime logic */}}
                        on:mousedown|preventDefault={() => {/* startChangeTime logic */}}
                        on:keydown|enter|preventDefault={() => {/* startChangeTime logic */}}
                        on:touchend|preventDefault={() => {/* stopChangeTime logic */}}
                        on:mouseup|preventDefault={() => {/* stopChangeTime logic */}}
                        on:keyup|enter|preventDefault={() => {/* stopChangeTime logic */}}
                      >
                        <slot name="up-arrow">
                          <PDPArrow />
                        </slot>
                      </button>
                      {selectedTimes[i] ? selectedTimes[i].hour("HH") : core.hour("HH")}
                      <button
                        type="button"
                        on:touchstart|preventDefault={() => {/* startChangeTime logic */}}
                        on:mousedown|preventDefault={() => {/* startChangeTime logic */}}
                        on:keydown|enter|preventDefault={() => {/* startChangeTime logic */}}
                        on:touchend|preventDefault={() => {/* stopChangeTime logic */}}
                        on:mouseup|preventDefault={() => {/* stopChangeTime logic */}}
                        on:keyup|enter|preventDefault={() => {/* stopChangeTime logic */}}
                      >
                        <slot name="down-arrow">
                          <PDPArrow direction="down" />
                        </slot>
                      </button>
                    </div>
                    :
                    <div class="minute">
                      <button
                        type="button"
                        on:touchstart|preventDefault={() => {/* startChangeTime logic */}}
                        on:mousedown|preventDefault={() => {/* startChangeTime logic */}}
                        on:keydown|enter|preventDefault={() => {/* startChangeTime logic */}}
                        on:touchend|preventDefault={() => {/* stopChangeTime logic */}}
                        on:mouseup|preventDefault={() => {/* stopChangeTime logic */}}
                        on:keyup|enter|preventDefault={() => {/* stopChangeTime logic */}}
                      >
                        <slot name="up-arrow">
                          <PDPArrow />
                        </slot>
                      </button>
                      {selectedTimes[i] ? selectedTimes[i].minute("mm") : core.minute("mm")}
                      <button
                        type="button"
                        on:touchstart|preventDefault={() => {/* startChangeTime logic */}}
                        on:mousedown|preventDefault={() => {/* startChangeTime logic */}}
                        on:keydown|enter|preventDefault={() => {/* startChangeTime logic */}}
                        on:touchend|preventDefault={() => {/* stopChangeTime logic */}}
                        on:mouseup|preventDefault={() => {/* stopChangeTime logic */}}
                        on:keyup|enter|preventDefault={() => {/* stopChangeTime logic */}}
                      >
                        <slot name="down-arrow">
                          <PDPArrow direction="down" />
                        </slot>
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
            <slot name="footer"></slot>
            {#if selectedDates[0]}
              <small>{selectedDates[0].toString(formats.display)}</small>
            {/if}
            {#if selectedDates.length === 2}
              <small>- {selectedDates[1].toString(formats.display)}</small>
            {/if}
          </div>
          <div>
            {#if checkDate(core, "date")}
              <button class="pdp-today" type="button" on:click={goToToday}>
                {lang.translations.now}
              </button>
            {/if}
            {#if !autoSubmit && !selectedDates.some((date) => true)}
              <button class="pdp-submit" type="button" on:click={() => submitDate()}>
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
              class:selected={!dates.some((date, i) => !date.isSame(selectedDates[i] && selectedDates[i].toString("datetime")))}
              on:click={() => {/* selectShorcut logic */}}
            >
              {name}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}
</div>

<style lang="scss">
    @use './assets/sass/app.scss';
</style>