<script>
	import '../app.css'

	import { onMount } from 'svelte'
	import { browser } from '$app/environment'
	import { afterNavigate, beforeNavigate } from '$app/navigation'
	import { page } from '$app/stores'

	import { ScrollSmoother } from 'gsap/dist/ScrollSmoother'
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
	import { gsap } from 'gsap'
	import { closeMenu } from '$Stores/menuStore'
	import { MorphSVGPlugin } from 'gsap/dist/MorphSVGPlugin'

	import Header from '$Layouts/Header.svelte'
	import NavigationProgressBar from '$UI/NavigationProgressBar.svelte'

	import Logo from '$Components/AnimatedIcons/Logo/Mark.svelte'
	import Wordmark from '$Components/AnimatedIcons/Wordmark/Wordmark.svelte'

	// import logo from '$Icons/qfLogos/logo-full.svg'

	let mounted = false
	let fadeOut = false
	let navigationProgressBar
	let windowHeight
	let isInitialized = false
	let isContentInitialized = false

	let resizeObserver

	const metadata = {
		title: 'Make any wallet and any transaction private — in one click.',
		description: `NullMask is a private VPN for crypto: confidential transfers, swaps and bridging for tokens and stablecoins on Ethereum and Base. One click. Any wallet.`,
		thumbnail: '/thumbnail.webp'
	}

	// Plain document pages: they set their own title, description and share
	// tags, and render on the server without waiting for the intro animation,
	// so their text is in the HTML for anyone fetching the page
	const DOCUMENT_PAGES = ['/compliance']
	$: isDocumentPage = DOCUMENT_PAGES.includes($page.url.pathname)

	gsap.registerPlugin(ScrollTrigger, MorphSVGPlugin, ScrollSmoother)

	ScrollTrigger.defaults({
		scroller: '.content-wrapper'
	})

	onMount(() => {
		setTimeout(() => {
			fadeOut = true

			setTimeout(() => {
				mounted = true
			}, 300)
		}, 300)

		let resizeTimeout

		const contentWrapper = document.querySelector('body')
		if (contentWrapper) {
			// Use ResizeObserver to watch for size changes
			resizeObserver = new ResizeObserver((entries) => {
				if (!isInitialized) {
					isInitialized = true

					setTimeout(() => {
						isContentInitialized = true
					}, 150)
					return
				}
			})

			resizeObserver.observe(contentWrapper)
		}

		// Update window height on resize
		const handleResize = () => {
			windowHeight = window.innerHeight
		}

		handleResize()

		window.addEventListener('resize', handleResize)

		return () => {
			if (contentWrapper && resizeObserver) {
				resizeObserver.disconnect()
			}

			document.removeEventListener('visibilitychange', handleVisibility)
			window.removeEventListener('focus', handleFocus)
			window.removeEventListener('pageshow', handlePageShow)
			window.removeEventListener('orientationchange', handleOrientation)
			clearTimeout(resizeTimeout)
			window.removeEventListener('resize', handleResize)
		}
	})

	afterNavigate(() => {
		navigationProgressBar?.complete()
		closeMenu()

		setTimeout(() => {
			const contentWrapper = document.querySelector('.content-wrapper')
			if (contentWrapper && contentWrapper.scrollTop !== 0) {
				contentWrapper.scrollTo({ top: 0 })
			}
			// re-measure after navigation
			ScrollTrigger.refresh()
		}, 0)
	})

	beforeNavigate(() => {
		navigationProgressBar?.start()
	})
</script>

<svelte:head>
	{#if !isDocumentPage}
		<title>{metadata.title}</title>
		<meta name="description" content={metadata.description} />
		<meta property="og:url" content="https://nullmask.io/" />
		<meta property="og:title" content={metadata.title} />
		<meta property="og:description" content={metadata.description} />
		<meta property="og:image:url" content={metadata.thumbnail} />
		<meta property="twitter:domain" content="nullmask.io" />
		<meta property="twitter:url" content="https://nullmask.io/" />
		<meta property="twitter:card" content="summary_large_image" />
		<meta property="twitter:image" content={metadata.thumbnail} />
		<meta property="twitter:title" content={metadata.title} />
		<meta property="twitter:description" content={metadata.description} />
	{/if}
</svelte:head>

<NavigationProgressBar bind:this={navigationProgressBar} />

{#if !mounted}
	<div
		class="loading-state fixed left-0 top-0 z-[1000000] flex min-h-screen w-full flex-col items-center justify-center gap-4"
		class:fade-out={fadeOut}
	>
		<!-- <video
			width="80"
			height="80"
			style="height: 80px; width: 80px;"
			class="absolute left-1/2 top-1/2 z-[1] block aspect-square h-20 w-20 -translate-x-1/2 -translate-y-1/2 object-contain"
			autoplay
			muted
			loop
			playsinline
			preload="metadata"
		>
			<source src="/loading.webm" type="video/webm" />
			<source src="/loading.mp4" type="video/mp4" />
		</video> -->
		<Logo className="h-20 flex-shrink-0 lg:h-24" theme="dark" />

		<Wordmark
			className="w-[240px] flex-shrink-0  transition-all duration-500 h-auto object-contain"
			theme="dark"
		/>
	</div>
{/if}

<Header />

{#if isContentInitialized || isDocumentPage}
	<slot />
{/if}

<style>
	.loading-state {
		background: var(--primary-dark);
		opacity: 1;
	}

	.fade-out {
		transition: opacity 0.3s ease-out;
		opacity: 0;
	}
</style>
