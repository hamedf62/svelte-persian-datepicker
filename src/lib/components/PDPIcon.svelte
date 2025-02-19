<script lang="ts">
  
    export let icon: 'clear' | 'date' | 'datetime' | 'time';
  
    // Svelte automatically inherits attributes unless you explicitly prevent it.
    // No need for "inheritAttrs: false"
  
  </script>
  
  {#if icon === 'clear'}
    <svg
      viewBox="0 0 512 512"
      width="1rem"
      xmlns="http://www.w3.org/2000/svg"
      {...$$restProps}  
    >
      <metadata>Clear icon</metadata>
      <path
        d="M443.6,387.1L312.4,255.4l131.5-130c5.4-5.4,5.4-14.2,0-19.6l-37.4-37.6c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4  L256,197.8L124.9,68.3c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4L68,105.9c-5.4,5.4-5.4,14.2,0,19.6l131.5,130L68.4,387.1  c-2.6,2.6-4.1,6.1-4.1,9.8c0,3.7,1.4,7.2,4.1,9.8l37.4,37.6c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1L256,313.1l130.7,131.1  c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1l37.4-37.6c2.6-2.6,4.1-6.1,4.1-9.8C447.7,393.2,446.2,389.7,443.6,387.1z"
      />
    </svg>
  {:else if icon === 'date'}
    <svg
      version="1.1"
      viewBox="20.711000442504883 19.33300018310547 51.29999542236328 53.48200225830078"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      {...$$restProps}
    >
      <metadata>Calendar icon</metadata>
      <g>
        <path
          d="M30.35,19.333v2.76h-9.639V32.79v3.4v36.625h44.781c3.595,0,6.519-2.926,6.519-6.52V36.19v-3.4V22.093h-9.64v-2.76h-3.399   v2.76H48.061v-2.76h-3.399v2.76H33.75v-2.76H30.35z M68.61,66.296c0,1.719-1.398,3.119-3.118,3.119H24.111V36.19H68.61V66.296z    M44.661,25.493v2.906h3.399v-2.906h10.911v2.906h3.399v-2.906h6.239v7.297H24.111v-7.297h6.239v2.906h3.4v-2.906H44.661z"
        ></path>
        </g>
    </svg>
  {:else if icon === 'datetime'}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="7.146755218505859 47.93895721435547 195.70648193359375 201.1220703125"
      version="1.1"
      {...$$restProps}
    >
      <metadata>Calendar And Clock Icon</metadata>
      </svg>
  {:else if icon === 'time'}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill-rule="evenodd"
      clip-rule="evenodd"
      viewBox="0 0 24 24"
      {...$$restProps}
    >
      <metadata>Clock Icon</metadata>
      <path
        d="M12 0c6.623 0 12 5.377 12 12s-5.377 12-12 12-12-5.377-12-12 5.377-12 12-12zm0 1c6.071 0 11 4.929 11 11s-4.929 11-11 11-11-4.929-11-11 4.929-11 11-11zm0 11h6v1h-7v-9h1v8z"
      ></path>
    </svg>
  {/if}