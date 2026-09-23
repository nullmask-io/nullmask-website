<script>
	import Mark from '$Components/AnimatedIcons/Logo/Mark.svelte'
	import { MASK_TOKEN } from '$lib/const'
	import { cn } from '$utils'

	export let className = ''

	let copied = false
	let copyTimer

	// A Solana mint is 44 characters - too wide for a phone, and nobody retypes
	// one by hand anyway. The short form is what people eyeball against the
	// pinned post; the copy button is what they actually use.
	const short = `${MASK_TOKEN.address.slice(0, 6)}…${MASK_TOKEN.address.slice(-4)}`

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(MASK_TOKEN.address)
			copied = true
			clearTimeout(copyTimer)
			copyTimer = setTimeout(() => (copied = false), 1600)
		} catch {
			// Clipboard is blocked (insecure origin, denied permission). The full
			// address is in the title attribute, so it stays selectable by hand.
			copied = false
		}
	}
</script>

<div
	class={cn(
		'mx-auto flex w-fit max-w-full items-center gap-2 rounded-[10px] border border-dark px-2 py-1.5 text-base md:ml-0 md:mr-0 md:gap-3 md:px-3 md:py-2 md:text-lg',
		className
	)}
>
	<span class="flex flex-shrink-0 items-center gap-1.5 font-[500]">
		<!-- The same mask mark as the header, so the token reads as ours at a glance -->
		<Mark className="h-5 w-5 md:h-6 md:w-6" theme="light" />
		{MASK_TOKEN.ticker}
	</span>

	<button
		type="button"
		on:click={copy}
		title={MASK_TOKEN.address}
		aria-label={copied ? 'Address copied' : `Copy ${MASK_TOKEN.ticker} address`}
		class="hover:bg-dark/5 flex items-center gap-1.5 rounded-[6px] px-1.5 py-0.5 font-[300] transition-colors"
	>
		<span class="tabular-nums">{copied ? 'Copied' : short}</span>
		<svg
			class="h-4 w-4 flex-shrink-0 opacity-60"
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
	</button>

	<a
		href={MASK_TOKEN.buyUrl}
		target="_blank"
		rel="noopener noreferrer"
		class="flex-shrink-0 rounded-[6px] bg-dark px-3 py-1 font-[400] text-light transition-opacity hover:opacity-80"
	>
		Buy
	</a>
</div>
