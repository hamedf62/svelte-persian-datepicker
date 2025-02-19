<script lang="ts">
    import type { PersianDate } from '../modules/core';
  
    export let name: string;
    export let format: string;
    export let dates: PersianDate[];
  </script>
  
  {#if name.endsWith('[]')}
    {#each dates as date, i}
      <input type="hidden" name={name} value={date.toString(format)} />
    {/each}
  {:else}
    <input type="hidden" name={name} value={dates.map((date) => date.toString(format))} />
  {/if}