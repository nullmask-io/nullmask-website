<script>
	/** Exact text to put on the clipboard. */
	export let value = ''
	/** What is being copied, for screen readers ("Copy <label>"). */
	export let label = ''
	export let text = 'Copy'
	export let tone = 'light' // light (on the grey page) or dark (on a dark card)

	let copied = false
	let timer

	// Fallback for origins without the async clipboard API (plain http on a
	// LAN address, older browsers). A textarea keeps line breaks intact.
	const legacyCopy = (str) => {
		const ta = document.createElement('textarea')
		ta.value = str
		ta.setAttribute('readonly', '')
		ta.style.position = 'fixed'
		ta.style.top = '-1000px'
		document.body.appendChild(ta)
		ta.select()
		const ok = document.execCommand('copy')
		document.body.removeChild(ta)
		return ok
	}

	const copy = async () => {
		let ok = false
		try {
			await navigator.clipboard.writeText(value)
			ok = true
		} catch {
			try {
				ok = legacyCopy(value)
			} catch {
				ok = false
			}
		}
		if (!ok) return
		copied = true
		clearTimeout(timer)
		timer = setTimeout(() => (copied = false), 1600)
	}
</script>

<button
	type="button"
	class="copy"
	class:on-dark={tone === 'dark'}
	on:click={copy}
	aria-label={copied ? 'Copied' : `Copy ${label}`}
>
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		{#if copied}
			<path d="M20 6 9 17l-5-5" />
		{:else}
			<rect x="9" y="9" width="13" height="13" rx="2" />
			<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
		{/if}
	</svg>
	<span>{copied ? 'Copied' : text}</span>
</button>

<style>
	.copy {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		flex-shrink: 0;
		height: 30px;
		padding: 0 10px;
		border: 1px solid rgba(32, 34, 33, 0.35);
		border-radius: 8px;
		font-size: 13px;
		line-height: 1;
		color: var(--primary-dark);
		background: transparent;
		transition:
			background-color 0.2s,
			color 0.2s,
			border-color 0.2s;
		white-space: nowrap;
	}
	.copy:hover {
		background: var(--primary-dark);
		border-color: var(--primary-dark);
		color: var(--primary-light);
	}
	.copy:focus-visible {
		outline: 2px solid var(--primary-dark);
		outline-offset: 2px;
	}
	.copy svg {
		width: 14px;
		height: 14px;
	}

	.copy.on-dark {
		border-color: rgba(217, 217, 217, 0.35);
		color: var(--primary-light);
	}
	.copy.on-dark:hover {
		background: var(--primary-light);
		border-color: var(--primary-light);
		color: var(--primary-dark);
	}
	.copy.on-dark:focus-visible {
		outline-color: var(--primaty-green);
	}
</style>
