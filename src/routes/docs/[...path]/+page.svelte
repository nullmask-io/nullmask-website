<script>
	import { onMount, tick } from 'svelte'
	import { fade, fly } from 'svelte/transition'
	import { afterNavigate } from '$app/navigation'

	import { currentSection } from '$lib/Stores/currentSection'
	import { SOCIALS } from '$lib/const'
	import DocsNav from '$lib/docs/DocsNav.svelte'

	export let data

	$: doc = data.page
	$: nav = data.nav
	$: pageTitle = `${doc.title} | Nullmask Docs`

	let scroller
	let sidebar
	let menuButton
	let closeButton
	let drawerList
	let menuOpen = false

	// The page scrolls inside its own container (html and body are fixed), so
	// a page opens at the top of that container, or at its #anchor (this also
	// runs when the page first loads)
	afterNavigate(({ to, type }) => {
		menuOpen = false
		if (!scroller) return
		const id = to?.url.hash ? decodeURIComponent(to.url.hash.slice(1)) : ''
		const target = id ? document.getElementById(id) : null
		if (target) target.scrollIntoView({ block: 'start' })
		else if (type !== 'enter') scroller.scrollTo({ top: 0 })
	})

	const openMenu = async () => {
		menuOpen = true
		await tick()
		closeButton?.focus()
		const active = drawerList?.querySelector('[aria-current="page"]')
		if (active) drawerList.scrollTop = active.offsetTop - drawerList.clientHeight / 2
	}

	const closeMenu = () => {
		if (!menuOpen) return
		menuOpen = false
		menuButton?.focus()
	}

	// Copy buttons on code blocks (the article is HTML rendered on the server)
	const copyTimers = new WeakMap()

	const legacyCopy = (text) => {
		const area = document.createElement('textarea')
		area.value = text
		area.setAttribute('readonly', '')
		area.style.position = 'fixed'
		area.style.top = '-1000px'
		document.body.appendChild(area)
		area.select()
		const ok = document.execCommand('copy')
		document.body.removeChild(area)
		return ok
	}

	const onArticleClick = async (event) => {
		const button = event.target instanceof Element ? event.target.closest('.code-copy') : null
		const code = button?.closest('.code-block')?.querySelector('code')
		if (!code) return
		const text = code.textContent ?? ''
		let ok = false
		try {
			await navigator.clipboard.writeText(text)
			ok = true
		} catch {
			try {
				ok = legacyCopy(text)
			} catch {
				ok = false
			}
		}
		if (!ok) return
		button.textContent = 'Copied'
		clearTimeout(copyTimers.get(button))
		copyTimers.set(
			button,
			setTimeout(() => (button.textContent = 'Copy'), 1600)
		)
	}

	onMount(() => {
		// The header takes its colours from the section in view; the docs are light
		currentSection.set({ index: 0, id: 'docs', theme: 'light' })

		// Keep the current page visible in a long sidebar
		const active = sidebar?.querySelector('[aria-current="page"]')
		if (active && active.offsetTop > sidebar.clientHeight * 0.6) {
			sidebar.scrollTop = active.offsetTop - sidebar.clientHeight / 2
		}
	})
</script>

<svelte:window on:keydown={(event) => event.key === 'Escape' && closeMenu()} />

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={doc.description} />
	<link rel="canonical" href={doc.canonical} />
	<meta property="og:type" content="article" />
	<meta property="og:url" content={doc.canonical} />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={doc.description} />
	<meta property="og:image:url" content="/thumbnail.webp" />
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:title" content={pageTitle} />
	<meta property="twitter:description" content={doc.description} />
</svelte:head>

<div class="docs" bind:this={scroller}>
	<!-- A solid strip behind the fixed header, so text does not show around it -->
	<div class="veil" aria-hidden="true"></div>

	<div class="shell">
		<aside class="sidebar" bind:this={sidebar}>
			<nav aria-label="Documentation">
				<DocsNav {nav} current={doc.path} />
			</nav>
		</aside>

		<div class="menu-bar">
			<button
				type="button"
				class="menu-button"
				bind:this={menuButton}
				aria-expanded={menuOpen}
				aria-controls="docs-menu"
				on:click={openMenu}
			>
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<path d="M4 7h16M4 12h16M4 17h10" />
				</svg>
				<span class="menu-label">Docs</span>
				<span class="menu-current">{doc.title}</span>
			</button>
		</div>

		<main class="main">
			<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
			<article class="article" on:click={onArticleClick}>
				<header class="head">
					<p class="eyebrow">
						Docs{#if doc.group}&nbsp;&middot; {doc.group}{/if}
					</p>
					<h1>{doc.title}</h1>
					{#if doc.lead}
						<p class="lead">{doc.lead}</p>
					{/if}
				</header>

				<div class="prose">
					{@html doc.html}
				</div>
			</article>

			{#if doc.prev || doc.next}
				<nav class="pager" aria-label="Previous and next page">
					{#if doc.prev}
						<a class="pager-link prev" href={doc.prev.href} rel="prev">
							<span class="pager-dir">Previous</span>
							<span class="pager-title">{doc.prev.title}</span>
						</a>
					{/if}
					{#if doc.next}
						<a class="pager-link next" href={doc.next.href} rel="next">
							<span class="pager-dir">Next</span>
							<span class="pager-title">{doc.next.title}</span>
						</a>
					{/if}
				</nav>
			{/if}

			<footer class="foot">
				<span>Nullmask Docs</span>
				<span class="foot-links">
					<a href="/">nullmask.io</a>
					<a href="/compliance">Compliance</a>
					<a href={SOCIALS.email}>{SOCIALS.email.replace('mailto:', '')}</a>
				</span>
			</footer>
		</main>
	</div>
</div>

{#if menuOpen}
	<button
		type="button"
		class="backdrop"
		aria-label="Close the docs menu"
		tabindex="-1"
		on:click={closeMenu}
		transition:fade={{ duration: 180 }}
	></button>
	<div id="docs-menu" class="drawer" transition:fly={{ y: -12, duration: 220 }}>
		<div class="drawer-head">
			<span>Docs</span>
			<button
				type="button"
				class="drawer-close"
				bind:this={closeButton}
				aria-label="Close the docs menu"
				on:click={closeMenu}
			>
				<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
			</button>
		</div>
		<nav class="drawer-list" bind:this={drawerList} aria-label="Documentation">
			<DocsNav {nav} current={doc.path} touch on:navigate={() => (menuOpen = false)} />
		</nav>
	</div>
{/if}

<style>
	.docs {
		position: relative;
		height: 100%;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
		background: var(--primary-light);
		color: var(--primary-dark);
	}

	.veil {
		position: fixed;
		z-index: 25;
		top: 0;
		left: 0;
		right: 0;
		height: 80px;
		background: var(--primary-light);
	}

	/* Phones and tablets: the menu bar under the fixed header (80px phone / 106px from 768px) */
	.shell {
		max-width: 1232px;
		margin: 0 auto;
		padding: 80px 16px 0;
	}

	.sidebar {
		display: none;
	}

	.menu-bar {
		position: sticky;
		top: 80px;
		z-index: 20;
		margin: 0 -16px;
		padding: 8px 16px;
		background: var(--primary-light);
	}
	.menu-button {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		height: 44px;
		padding: 0 14px;
		border: 1px solid var(--primary-dark);
		border-radius: 12px;
		background: var(--primary-light);
		color: var(--primary-dark);
		font-size: 14px;
		text-align: left;
		transition:
			background-color 0.2s,
			color 0.2s;
	}
	.menu-button:active {
		background: var(--primary-dark);
		color: var(--primary-light);
	}
	.menu-button svg {
		flex: none;
		width: 20px;
		height: 20px;
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
	}
	.menu-label {
		flex: none;
		font-weight: 600;
	}
	.menu-current {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		opacity: 0.7;
	}
	.menu-current::before {
		content: '/';
		margin-right: 10px;
		opacity: 0.5;
	}

	.main {
		min-width: 0;
		padding-top: 18px;
	}

	/* Page head */
	.eyebrow {
		font-size: 12px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		opacity: 0.65;
		margin-bottom: 8px;
	}
	h1 {
		font-size: 30px;
		line-height: 1.12;
		overflow-wrap: break-word;
	}
	.lead {
		margin-top: 10px;
		font-size: 17px;
		line-height: 1.5;
		opacity: 0.75;
	}
	.head {
		margin-bottom: 26px;
	}

	/* Previous / next */
	.pager {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 10px;
		margin-top: 44px;
	}
	.pager-link {
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
		padding: 12px 14px;
		border: 1px solid var(--primary-dark);
		border-radius: 15px;
		transition:
			background-color 0.2s,
			color 0.2s;
	}
	.pager-link:hover {
		background: var(--primary-dark);
		color: var(--primary-light);
	}
	.pager-link.next {
		grid-column: 2;
		align-items: flex-end;
		text-align: right;
	}
	.pager-dir {
		font-size: 11.5px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		opacity: 0.6;
	}
	.pager-dir::before,
	.pager-dir::after {
		opacity: 0.9;
	}
	.prev .pager-dir::before {
		content: '← ';
	}
	.next .pager-dir::after {
		content: ' →';
	}
	.pager-title {
		font-size: 14px;
		font-weight: 600;
		line-height: 1.3;
		overflow-wrap: break-word;
	}

	.foot {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 8px 16px;
		margin-top: 40px;
		padding: 16px 0 32px;
		border-top: 1px solid rgba(32, 34, 33, 0.25);
		font-size: 13px;
		opacity: 0.8;
	}
	.foot-links {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 16px;
	}
	.foot a {
		text-decoration: underline;
		text-underline-offset: 3px;
		text-decoration-thickness: 1px;
	}

	/* Drawer (phones and tablets) */
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 9000;
		background: rgba(32, 34, 33, 0.35);
		cursor: default;
	}
	.drawer {
		position: fixed;
		z-index: 9001;
		top: 88px;
		left: 16px;
		right: 16px;
		bottom: 16px;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		border: 1px solid var(--primary-dark);
		border-radius: 15px;
		background: var(--primary-light);
		color: var(--primary-dark);
		box-shadow: 0 18px 48px rgba(32, 34, 33, 0.25);
	}
	.drawer-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex: none;
		height: 52px;
		padding: 0 6px 0 16px;
		border-bottom: 1px solid rgba(32, 34, 33, 0.2);
		font-weight: 600;
	}
	.drawer-close {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border-radius: 10px;
	}
	.drawer-close:active {
		background: rgba(32, 34, 33, 0.1);
	}
	.drawer-close svg {
		width: 20px;
		height: 20px;
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
	}
	.drawer-list {
		flex: 1;
		overflow-y: auto;
		overscroll-behavior: contain;
		padding: 8px 8px 24px;
	}

	@media (min-width: 640px) {
		.drawer {
			right: auto;
			width: 360px;
		}
	}

	@media (min-width: 768px) {
		.veil {
			height: 106px;
		}
		.shell {
			padding: 106px 24px 0;
		}
		.menu-bar {
			top: 106px;
			margin: 0 -24px;
			padding: 10px 24px;
		}
		.drawer {
			top: 114px;
		}
		.main {
			padding-top: 24px;
		}
		h1 {
			font-size: 40px;
		}
		.lead {
			font-size: 19px;
		}
		.pager-link {
			padding: 14px 18px;
		}
		.pager-title {
			font-size: 16px;
		}
	}

	/* Desktop: the sidebar beside the page */
	@media (min-width: 1024px) {
		.shell {
			display: grid;
			grid-template-columns: 256px minmax(0, 1fr);
			column-gap: 48px;
		}
		.menu-bar {
			display: none;
		}
		.sidebar {
			display: block;
			position: sticky;
			top: 106px;
			align-self: start;
			max-height: calc(100vh - 106px);
			overflow-y: auto;
			overscroll-behavior: contain;
			padding: 30px 6px 32px 0;
		}
		.main {
			max-width: 820px;
			padding-top: 40px;
		}
		h1 {
			font-size: 44px;
		}
	}

	@media (min-width: 1280px) {
		.shell {
			grid-template-columns: 272px minmax(0, 1fr);
			column-gap: 64px;
		}
	}

	/* The article: HTML rendered from the markdown sources */
	.prose {
		font-size: 15px;
		line-height: 1.7;
		overflow-wrap: break-word;
	}
	.prose :global(:where(p, ul, ol, blockquote, figure, hr, .table-wrap, .code-block)),
	.prose :global(:where(.callout, .tabs, .ref-card)) {
		margin: 0 0 18px;
	}
	.prose > :global(:first-child) {
		margin-top: 0;
	}
	.prose :global(:where(h2, h3, h4, h5, h6)) {
		position: relative;
		scroll-margin-top: 150px;
	}
	.prose :global(h2) {
		margin: 44px 0 14px;
		font-size: 23px;
		line-height: 1.25;
	}
	.prose :global(h3) {
		margin: 32px 0 10px;
		font-size: 19px;
		line-height: 1.3;
	}
	.prose :global(:where(h4, h5, h6)) {
		margin: 26px 0 8px;
		font-size: 16.5px;
		line-height: 1.35;
	}
	.prose :global(.anchor) {
		margin-left: 0.4em;
		color: rgba(32, 34, 33, 0.4);
		font-weight: 400;
		text-decoration: none;
		opacity: 0;
		transition: opacity 0.15s;
	}
	.prose :global(:where(h2, h3, h4, h5, h6):hover .anchor),
	.prose :global(.anchor:focus-visible) {
		opacity: 1;
	}
	.prose :global(strong) {
		font-weight: 600;
	}
	.prose :global(a:not(.anchor):not(.ref-card)) {
		text-decoration: underline;
		text-underline-offset: 3px;
		text-decoration-thickness: 1px;
		border-radius: 3px;
		transition: background-color 0.15s;
	}
	.prose :global(a:not(.anchor):not(.ref-card):hover) {
		background: var(--primaty-green);
	}
	.prose :global(ul) {
		list-style: disc;
		padding-left: 1.4em;
	}
	.prose :global(ol) {
		list-style: decimal;
		padding-left: 1.6em;
	}
	.prose :global(ul ul) {
		list-style: circle;
	}
	.prose :global(ul ul ul) {
		list-style: square;
	}
	.prose :global(li) {
		margin: 5px 0;
		padding-left: 0.15em;
	}
	.prose :global(li::marker) {
		color: rgba(32, 34, 33, 0.65);
	}
	.prose :global(li > :where(ul, ol, p)) {
		margin: 5px 0 0;
	}
	.prose :global(hr) {
		margin: 34px 0;
		border: 0;
		border-top: 1px solid rgba(32, 34, 33, 0.22);
	}
	.prose :global(blockquote) {
		padding: 12px 16px;
		border-left: 3px solid var(--primary-dark);
		border-radius: 0 12px 12px 0;
		background: rgba(255, 255, 255, 0.22);
	}
	.prose :global(blockquote > :last-child) {
		margin-bottom: 0;
	}

	/* Inline code and code blocks */
	.prose :global(code) {
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;
	}
	.prose :global(:not(pre) > code) {
		padding: 0.12em 0.38em;
		border-radius: 6px;
		background: rgba(32, 34, 33, 0.08);
		font-size: 0.86em;
		-webkit-box-decoration-break: clone;
		box-decoration-break: clone;
	}
	.prose :global(:where(p, li, td) > code) {
		overflow-wrap: anywhere;
	}
	.prose :global(.code-block) {
		overflow: hidden;
		border-radius: 12px;
		background: var(--primary-dark);
		color: #e6e6e6;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}
	.prose :global(.code-bar) {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		min-height: 36px;
		padding: 6px 8px 0 16px;
		font-size: 12px;
		color: rgba(217, 217, 217, 0.6);
	}
	.prose :global(.code-copy) {
		height: 26px;
		padding: 0 10px;
		border: 1px solid rgba(217, 217, 217, 0.3);
		border-radius: 8px;
		color: #d9d9d9;
		font-size: 12px;
		transition:
			background-color 0.15s,
			color 0.15s,
			border-color 0.15s;
	}
	.prose :global(.code-copy:hover) {
		background: var(--primaty-green);
		border-color: var(--primaty-green);
		color: var(--primary-dark);
	}
	.prose :global(pre) {
		margin: 0;
		padding: 8px 16px 16px;
		overflow-x: auto;
		font-size: 13px;
		line-height: 1.6;
		tab-size: 4;
	}
	.prose :global(pre code) {
		white-space: pre;
	}

	/* Tables scroll sideways inside their own box; a soft shadow marks an edge
	   with more of the table beyond it */
	.prose :global(.table-wrap) {
		overflow-x: auto;
		border: 1px solid rgba(32, 34, 33, 0.3);
		border-radius: 12px;
		background:
			linear-gradient(to right, var(--primary-light) 30%, rgba(217, 217, 217, 0)) left / 24px 100%
				no-repeat local,
			linear-gradient(to left, var(--primary-light) 30%, rgba(217, 217, 217, 0)) right / 24px 100%
				no-repeat local,
			radial-gradient(farthest-side at 0 50%, rgba(32, 34, 33, 0.2), rgba(32, 34, 33, 0)) left /
				10px 100% no-repeat scroll,
			radial-gradient(farthest-side at 100% 50%, rgba(32, 34, 33, 0.2), rgba(32, 34, 33, 0)) right /
				10px 100% no-repeat scroll;
	}
	.prose :global(table) {
		width: 100%;
		border-collapse: collapse;
		font-size: 13.5px;
		line-height: 1.5;
	}
	.prose :global(th) {
		background: rgba(32, 34, 33, 0.06);
		font-weight: 600;
		text-align: left;
		white-space: nowrap;
	}
	.prose :global(:where(th, td)) {
		min-width: 6.5em;
		padding: 9px 14px;
		border-bottom: 1px solid rgba(32, 34, 33, 0.14);
		vertical-align: top;
	}
	.prose :global(:where(th, td) + :where(th, td)) {
		border-left: 1px solid rgba(32, 34, 33, 0.1);
	}
	.prose :global(tbody tr:last-child td) {
		border-bottom: 0;
	}

	/* Callouts ({% hint %}) */
	.prose :global(.callout) {
		display: flex;
		gap: 12px;
		padding: 14px 16px;
		border: 1px solid var(--primary-dark);
		border-radius: 15px;
		background: rgba(255, 255, 255, 0.24);
	}
	.prose :global(.callout-success) {
		background: rgba(205, 239, 51, 0.16);
	}
	.prose :global(.callout-icon) {
		display: grid;
		place-items: center;
		flex: none;
		width: 24px;
		height: 24px;
		margin-top: 1px;
		border-radius: 50%;
		background: var(--primary-dark);
		color: var(--primary-light);
		font-size: 13px;
		font-weight: 700;
		line-height: 1;
	}
	.prose :global(.callout-success .callout-icon) {
		color: var(--primaty-green);
	}
	.prose :global(.callout-warning .callout-icon) {
		color: #ffbd4a;
	}
	.prose :global(.callout-danger .callout-icon) {
		color: #ff7b6b;
	}
	.prose :global(.callout-body) {
		flex: 1;
		min-width: 0;
	}
	.prose :global(.callout-body > :last-child) {
		margin-bottom: 0;
	}

	/* Figures */
	.prose :global(figure img) {
		display: block;
		max-width: 100%;
		height: auto;
		margin: 0 auto;
		padding: 12px;
		border: 1px solid rgba(32, 34, 33, 0.2);
		border-radius: 12px;
		background: #fff;
	}
	.prose :global(figcaption) {
		margin-top: 8px;
		font-size: 13px;
		line-height: 1.5;
		text-align: center;
		opacity: 0.7;
	}
	.prose :global(figcaption p) {
		margin: 0;
	}

	/* {% tabs %}, {% content-ref %} and {% embed %} */
	.prose :global(.tabs) {
		padding: 2px 16px;
		border: 1px solid rgba(32, 34, 33, 0.3);
		border-radius: 15px;
	}
	.prose :global(.tab + .tab) {
		border-top: 1px solid rgba(32, 34, 33, 0.15);
	}
	.prose :global(.tab-title) {
		margin: 12px 0 8px;
		font-weight: 600;
	}
	.prose :global(.ref-card) {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 14px 16px;
		border: 1px solid var(--primary-dark);
		border-radius: 15px;
		font-weight: 500;
		transition:
			background-color 0.2s,
			color 0.2s;
	}
	.prose :global(.ref-card:hover) {
		background: var(--primary-dark);
		color: var(--primary-light);
	}

	@media (min-width: 768px) {
		.prose {
			font-size: 16px;
		}
		.prose :global(:where(h2, h3, h4, h5, h6)) {
			scroll-margin-top: 186px;
		}
		.prose :global(h2) {
			font-size: 27px;
		}
		.prose :global(h3) {
			font-size: 20.5px;
		}
		.prose :global(:where(h4, h5, h6)) {
			font-size: 17px;
		}
		.prose :global(table) {
			font-size: 14px;
		}
		.prose :global(.callout) {
			padding: 16px 20px;
		}
	}

	@media (min-width: 1024px) {
		.prose :global(:where(h2, h3, h4, h5, h6)) {
			scroll-margin-top: 130px;
		}
	}
</style>
