<script>
	import OneClick from '$Components/AnimatedIcons/OneClick/index.svelte'
	import { mediaQuery } from '$lib/Stores/mediaQuery'
	import { NULLMASK_LINK, HEADER, SOCIALS } from '$lib/const'
	import { cn } from '$utils'

	export let className = ''
</script>

<section
	data-section="hero"
	data-theme="light"
	id="landing-page"
	class={cn('bg-light h-screen min-h-[600px] w-full overflow-hidden', className)}
>
	<div
		class="relative mx-auto flex h-full max-w-[1440px] flex-col items-center md:flex-row"
		style="padding-top: {$mediaQuery.md ? HEADER.height.desktop : HEADER.height.mobile}px;"
	>
		<div class="hero-top relative z-[1] mt-14 flex flex-col md:ml-10 md:mt-0 lg:ml-16 xl:ml-32">
			<h1
				class="mb-4 text-center text-[45px] leading-[1.1] md:text-left md:text-[60px] lg:mb-6 lg:text-[70px] xl:mb-8 xl:text-[80px]"
			>
				One Click. <br />
				Total Privacy.
			</h1>

			<p
				class=" mb-6 text-center text-xl uppercase md:text-left md:text-2xl lg:mb-6 xl:mb-8 xl:text-3xl"
			>
				ZK privacy protocol for any<br>wallet, blockchain, or token
			</p>

			<a
				href={NULLMASK_LINK}
				target="_blank"
				rel="noopener noreferrer"
				class="bg-green hover:bg-dark border-dark hover:text-green mx-auto block w-fit rounded-[10px] border px-4 py-2 text-xl font-[300] transition-all duration-300 md:mb-20 md:ml-0 md:mr-0 xl:text-2xl"
			>
				Try NullMask now
			</a>
		</div>

		<div
			class="w-full max-w-[550px] flex-grow overflow-hidden p-4 md:absolute md:right-4 md:h-full md:w-[500px] md:max-w-full md:p-0 lg:right-10 lg:w-[605px] xl:right-24"
		>
			<OneClick className="h-full w-full object-contain" />
		</div>
	</div>
</section>

<style>
	@media (max-height: 700px) {
		.hero-top {
			margin-top: 20px !important;
		}
	}
</style>
