/**
 * AI/LLM Guide for Persian DatePicker Component
 *
 * This file provides structured information to help AI coding assistants
 * understand and work with the Persian DatePicker component effectively.
 *
 * @fileoverview AI-friendly component documentation and usage patterns
 * @version 1.0.3
 * @author Hamed Fallah
 */

import type { PersianDate } from './modules/core';

// ====================================================================
// AI/LLM COMPONENT USAGE PATTERNS
// Common patterns and configurations for AI coding assistance
// ====================================================================

/**
 * AI Usage Patterns - Copy these for common scenarios
 */
export const AI_USAGE_PATTERNS = {
	// Basic single date selection
	SINGLE_DATE: `
    <script>
      let selectedDate: string;
    </script>
    
    <DatePicker bind:model={selectedDate} />
  `,

	// Persian calendar date range
	PERSIAN_RANGE: `
    <script>
      let dateRange: string[];
    </script>
    
    <DatePicker 
      bind:model={dateRange}
      mode="range"
      locale="fa"
      dual_input={true}
    />
  `,

	// Multiple date selection
	MULTIPLE_DATES: `
    <script>
      let multipleDates: string[];
    </script>
    
    <DatePicker 
      bind:model={multipleDates}
      mode="multiple"
      auto_submit={false}
    />
  `,

	// Time picker only
	TIME_ONLY: `
    <script>
      let selectedTime: string;
    </script>
    
    <DatePicker 
      bind:model={selectedTime}
      type="time"
      from="08:00"
      to="20:00"
    />
  `,

	// DateTime with validation
	DATETIME_VALIDATED: `
    <script>
      let dateTime: string;
      const disableWeekends = (date) => [0, 6].includes(date.weekday());
    </script>
    
    <DatePicker 
      bind:model={dateTime}
      type="datetime"
      from="1403/01/01"
      to="1405/12/29"
      disable={disableWeekends}
    />
  `,

	// Multi-language support
	MULTI_LANGUAGE: `
    <script>
      let date: string;
    </script>
    
    <DatePicker 
      bind:model={date}
      locale="fa,en"
      input_calendar="auto"
    />
  `,

	// Modal with custom styling
	MODAL_STYLED: `
    <script>
      let date: string;
    </script>
    
    <DatePicker 
      bind:model={date}
      modal={true}
      color="blue"
      clearable={true}
    />
  `
};

// ====================================================================
// AI TROUBLESHOOTING GUIDE
// Common issues and solutions for AI assistants
// ====================================================================

export const AI_TROUBLESHOOTING = {
	'No date shows in input': 'Check if model is bound correctly with bind:model',
	'Date format wrong': 'Use from/to props for boundaries, format prop for model format',
	'Calendar not showing': 'Verify locale prop and input_calendar setting',
	'Range selection not working': "Set mode='range' and consider dual_input={true}",
	'Disabled dates not working': 'Check disable prop format - array, function, or regex',
	'Styling issues': 'Use color prop for themes, styles prop for custom CSS',
	'Modal not responsive': 'Use modal={true} and check viewport settings',
	'Time picker missing': "Set type='time' or type='datetime'",
	'Multiple selection issues': "Set mode='multiple' and auto_submit={false}",
	'Validation not working': 'Use from/to for boundaries, disable for specific dates'
};

// ====================================================================
// COMPONENT CONFIGURATIONS FOR COMMON USE CASES
// Ready-to-use configurations that AI can recommend
// ====================================================================

export const AI_CONFIGURATIONS = {
	// Standard Persian date picker
	STANDARD_PERSIAN: {
		locale: 'fa',
		type: 'date' as const,
		mode: 'single' as const,
		clearable: true,
		auto_submit: true
	},

	// Business date range picker
	BUSINESS_RANGE: {
		mode: 'range' as const,
		dual_input: true,
		locale: 'fa',
		color: 'blue' as const,
		clearable: true
	},

	// Event scheduling picker
	EVENT_SCHEDULER: {
		type: 'datetime' as const,
		mode: 'multiple' as const,
		auto_submit: false,
		modal: true,
		clearable: true
	},

	// Working hours time picker
	WORKING_HOURS: {
		type: 'time' as const,
		from: '08:00',
		to: '18:00',
		mode: 'range' as const,
		dual_input: true
	},

	// International date picker
	INTERNATIONAL: {
		locale: 'fa,en',
		input_calendar: 'auto' as const,
		type: 'date' as const,
		color: 'green' as const
	}
};

/**
 * AI Quick Reference for Props
 * Essential props that AI should know about
 */
export const AI_ESSENTIAL_PROPS = {
	// MUST KNOW - These are essential for basic functionality
	BINDABLE_MODEL: 'bind:model - The main data binding prop',
	SELECTION_MODE: "mode - 'single' | 'range' | 'multiple'",
	PICKER_TYPE: "type - 'date' | 'time' | 'datetime'",
	LOCALE_SETTING: "locale - 'fa' | 'en' | 'ar' | combined",

	// SHOULD KNOW - These solve common requirements
	DATE_BOUNDARIES: 'from/to - Set date/time limits',
	DISABLE_DATES: 'disable - Array, function, or regex to disable dates',
	DUAL_INPUTS: 'dual_input - Separate inputs for range mode',
	AUTO_SUBMIT: 'auto_submit - Auto-submit on selection',

	// NICE TO KNOW - These enhance UX
	COLOR_THEME: 'color - Visual theme colors',
	MODAL_MODE: 'modal - Show as overlay',
	CLEARABLE: 'clearable - Show clear button',
	CLICK_BEHAVIOR: 'click_on - What triggers opening'
};
