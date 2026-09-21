<script>
	export let className = ''
	export let theme = 'light' // 'light' or 'dark'
</script>

<div
	class="nullmask-mark transition-colors duration-500 {className}"
	class:bg-light={theme === 'dark'}
	class:bg-dark={theme === 'light'}
	role="img"
	aria-label="NullMask"
></div>

<style>
	/* Знак — одноцветный силуэт, поэтому подставляется маской:
	   форма берётся из картинки, а цвет задаёт background-color,
	   благодаря чему он перекрашивается вместе с темой секции. */
	.nullmask-mark {
		aspect-ratio: 300 / 401;
		-webkit-mask-image: url('/nullmask-mask.png');
		mask-image: url('/nullmask-mask.png');
		-webkit-mask-size: contain;
		mask-size: contain;
		-webkit-mask-repeat: no-repeat;
		mask-repeat: no-repeat;
		-webkit-mask-position: center;
		mask-position: center;
	}
</style>
