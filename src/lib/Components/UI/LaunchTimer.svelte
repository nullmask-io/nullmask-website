<script>
	import { onMount } from 'svelte'
	import CrowdDigits from '$UI/CrowdDigits.svelte'
	import { LAUNCH_AT } from '$lib/const'
	import { cn } from '$utils'

	export let className = ''
	/** The moment it counts down to: an ISO string or unix ms. */
	export let at = LAUNCH_AT

	/** The last stretch before launch: every digit lights up. */
	const URGENT_SECONDS = 10

	const target = new Date(at).getTime()

	/** Unix ms on this device's clock; null until the page runs in the browser. */
	let now = null

	onMount(() => {
		let timer
		// Tick just after each second boundary, so the digits turn with the wall clock.
		const tick = () => {
			now = Date.now()
			timer = setTimeout(tick, 1000 - (now % 1000) + 5)
		}
		tick()
		return () => clearTimeout(timer)
	})

	const pad = (n) => String(n).padStart(2, '0')

	$: left = now === null ? null : Math.max(0, Math.ceil((target - now) / 1000 - 1e-6))
	$: live = left === 0
	$: urgent = left !== null && left > 0 && left <= URGENT_SECONDS
	$: days = left === null ? 0 : Math.floor(left / 86400)
	$: hours = left === null ? 0 : Math.floor((left % 86400) / 3600)
	$: minutes = left === null ? 0 : Math.floor((left % 3600) / 60)
	$: seconds = left === null ? 0 : left % 60

	// Nothing until the page runs in the browser: the server's clock and time
	// zone are not the viewer's.
	$: groups =
		left === null
			? null
			: [
					...(days > 0 ? [{ unit: 'days', text: pad(days) }] : []),
					{ unit: 'hrs', text: pad(hours) },
					{ unit: 'min', text: pad(minutes) },
					{ unit: 'sec', text: pad(seconds) }
				]

	const whenLabel = (ms) => {
		const date = new Date(ms)
		const day = date.toLocaleDateString('en-GB', {
			weekday: 'short',
			day: 'numeric',
			month: 'short'
		})
		const time = date.toLocaleTimeString('en-GB', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		})
		return `${day}, ${time}`
	}
	$: when = now === null ? '' : whenLabel(target)

	/** The viewer's own offset from UTC on the launch day, e.g. «GMT+2», «GMT-4», «GMT+5:30». */
	const zoneLabel = (ms) => {
		const offset = -new Date(ms).getTimezoneOffset()
		const h = Math.floor(Math.abs(offset) / 60)
		const m = Math.abs(offset) % 60
		return `GMT${offset < 0 ? '-' : '+'}${h}${m ? `:${pad(m)}` : ''}`
	}
	$: zone = now === null ? '' : zoneLabel(target)

	$: srText =
		left === null
			? 'Launching soon'
			: live
				? 'Now live'
				: `Launching in ${days} days, ${hours} hours, ${minutes} minutes`
</script>

<div
	class={cn(
		'launch-timer relative w-full max-w-[500px] overflow-hidden rounded-[10px] border border-dark text-light',
		className
	)}
	class:urgent
	class:live
	role="timer"
>
	<span class="sr-only">{srText}</span>

	<div class="relative flex items-center justify-between gap-3 px-4 pt-3 md:px-5 md:pt-4">
		<span class="label flex items-center gap-2">
			<span class="pulse" aria-hidden="true" />
			{live ? 'Now live' : 'Launching in'}
		</span>
		{#if !live}<span class="label muted">Beta closed</span>{/if}
	</div>

	<CrowdDigits className="crowd" {groups} {urgent} {live} />

	<div class="relative flex items-center justify-between gap-3 px-4 pb-3 md:px-5 md:pb-4">
		<!-- The time is the viewer's own, and the card says so -->
		<span class="note flex flex-col">
			<span class="line"
				>{#if when}{live ? 'Opened' : 'Opens'} {when}{/if}</span
			>
			<span class="line zone"
				>{#if zone}Your time · {zone}{/if}</span
			>
		</span>
		<span class="note hint" aria-hidden="true">
			<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3">
				<circle cx="8" cy="8" r="5.5" stroke-dasharray="1.6 2.2" />
				<circle cx="8" cy="8" r="1.4" fill="currentColor" stroke="none" />
			</svg>
			Hover to part the crowd
		</span>
	</div>
</div>

<style>
	.launch-timer {
		background:
			radial-gradient(120% 90% at 50% 55%, rgba(205, 239, 51, 0.07), rgba(205, 239, 51, 0) 60%),
			#202221;
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.05),
			0 18px 40px -24px rgba(32, 34, 33, 0.7);
		transition: box-shadow 0.6s;
	}
	.launch-timer.urgent,
	.launch-timer.live {
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.05),
			0 0 0 1px rgba(205, 239, 51, 0.35),
			0 0 36px -6px rgba(205, 239, 51, 0.45);
	}

	.launch-timer :global(.crowd) {
		height: 112px;
	}

	.label {
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: rgba(217, 217, 217, 0.8);
		white-space: nowrap;
	}
	.label.muted {
		color: rgba(217, 217, 217, 0.45);
	}
	.pulse {
		position: relative;
		width: 6px;
		height: 6px;
		border-radius: 999px;
		background: #cdef33;
		box-shadow: 0 0 8px rgba(205, 239, 51, 0.8);
	}
	.pulse::after {
		content: '';
		position: absolute;
		inset: -4px;
		border-radius: 999px;
		border: 1px solid rgba(205, 239, 51, 0.7);
		animation: ping 1.6s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
	}

	.note {
		font-size: 11px;
		font-weight: 300;
		color: rgba(217, 217, 217, 0.6);
		white-space: nowrap;
	}
	/* both lines keep their height before the page knows the viewer's time */
	.line {
		min-height: 1.35em;
		line-height: 1.35;
	}
	.zone {
		font-size: 10px;
		font-weight: 400;
		letter-spacing: 0.04em;
		color: rgba(205, 239, 51, 0.7);
	}
	.hint {
		display: none;
		align-items: center;
		gap: 6px;
		color: rgba(205, 239, 51, 0.6);
	}
	.hint svg {
		width: 13px;
		height: 13px;
	}
	/* Only where there is a pointer to hover with */
	@media (hover: hover) and (pointer: fine) {
		.hint {
			display: inline-flex;
		}
	}

	@media (min-width: 768px) {
		/* beside the illustration: narrow enough to stay clear of it */
		.launch-timer {
			max-width: 440px;
		}
		.launch-timer :global(.crowd) {
			height: 124px;
		}
		.label {
			font-size: 11px;
		}
		.note {
			font-size: 12px;
		}
	}

	/* A big screen has the room for a bigger card */
	@media (min-width: 1440px) and (min-height: 860px) {
		.launch-timer {
			max-width: 540px;
		}
		.launch-timer :global(.crowd) {
			height: 140px;
		}
	}

	/* A short laptop screen: the hero must still clear the header */
	@media (min-width: 768px) and (max-height: 820px) {
		.launch-timer :global(.crowd) {
			height: 104px;
		}
	}

	@keyframes ping {
		0% {
			transform: scale(0.6);
			opacity: 1;
		}
		100% {
			transform: scale(1.6);
			opacity: 0;
		}
	}
</style>
