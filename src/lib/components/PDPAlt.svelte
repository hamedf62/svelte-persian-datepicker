<script lang="ts">
	import type { PersianDate } from '../modules/core';

	interface Props {
		name: string;
		format: string;
		dates: PersianDate[];
	}

	let { name, format, dates }: Props = $props();
</script>

{#if name.endsWith('[]')}
	{#each dates as date, i}
		<input type="hidden" {name} value={date.toString(format)} />
	{/each}
{:else}
	<input type="hidden" {name} value={dates.map((date) => date.toString(format))} />
{/if}
