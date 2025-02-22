<script lang="ts">
	let count = $state(0);
	count = 10;
	function increment(item: number) {
const i = item + 1;
		count = i;
	}
	$inspect('count', count);
</script>

<div class="hamed">
	<button onclick={() => increment(1)}>Clicked {count} times</button>
</div>

<style lang="scss">
	// @import '../../lib/assets/sass/app.scss';
	@import 'ggg.scss';
</style>
