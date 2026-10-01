<script>
	import { onMount } from 'svelte'
	import CrowdDigits from '$UI/CrowdDigits.svelte'
	import { LAUNCH_AT, NULLMASK_LINK } from '$lib/const'
	import { cn } from '$utils'

	export let className = ''
	/** The moment it counts down to: an ISO string or unix ms. */
	export let at = LAUNCH_AT

	/** The last stretch before launch, or before a wave: every digit lights up. */
	const URGENT_SECONDS = 10
	/** How long the crowd holds the word LIVE for whoever watched the launch. */
	const LIVE_HOLD_MS = 3200
	/** How long the card says «Leaving now» after a wave has gone. */
	const LEAVING_MS = 2400
	/** The admin can change the schedule at any time: ask again this often. */
	const SCHEDULE_REFRESH_MS = 5 * 60_000

	let target = new Date(at).getTime()
	/** Whether waves run, as the guard says; null until the landing's server has asked it. */
	let wavesOn = null
	let waveMs = 15 * 60_000
	/** Wave boundaries: offset + k x interval from 00:00 UTC, or from the launch in the preview. */
	let waveBase = 0

	/** Unix ms on this device's clock; null until the page runs in the browser. */
	let now = null
	/** Whether this visitor watched the countdown reach zero: only they see LIVE. */
	let sawCountdown = false
	/** Counts the waves that left while the page was open. */
	let departures = 0
	let leavingUntil = 0
	let lastWave = null

	onMount(() => {
		// Preview: ?demo = launch in 3 s and a wave every 20 s; or ?launch=<s>&wave=<s>.
		const params = new URLSearchParams(window.location.search)
		const demo = params.has('demo')
		const launchIn = Number(params.get('launch') ?? (demo ? 3 : NaN))
		const waveEvery = Number(params.get('wave') ?? (demo ? 20 : NaN))
		if (launchIn > 0) target = Date.now() + launchIn * 1000
		if (waveEvery > 0) {
			waveMs = waveEvery * 1000
			waveBase = target
		}
		sawCountdown = Date.now() < target

		// The schedule from the guard, through the landing's own server (/api/waves)
		let refresh
		const loadSchedule = async () => {
			try {
				const response = await fetch('/api/waves')
				const body = await response.json()
				if (body.enabled) {
					waveMs = body.intervalMinutes * 60_000
					waveBase = body.offsetMinutes * 60_000
				}
				wavesOn = body.enabled === true
			} catch {
				wavesOn = false
			}
		}
		if (waveEvery > 0) wavesOn = true
		else {
			loadSchedule()
			refresh = setInterval(loadSchedule, SCHEDULE_REFRESH_MS)
		}

		let timer
		// Tick just after each second boundary, so the digits turn with the wall clock.
		const tick = () => {
			now = Date.now()
			timer = setTimeout(tick, 1000 - (now % 1000) + 5)
		}
		tick()
		return () => {
			clearTimeout(timer)
			clearInterval(refresh)
		}
	})

	const pad = (n) => String(n).padStart(2, '0')

	$: left = now === null ? null : Math.max(0, Math.ceil((target - now) / 1000 - 1e-6))
	$: launched = left === 0
	// LIVE only for the few seconds after zero, and only for whoever was watching
	$: hello = launched && sawCountdown && now < target + LIVE_HOLD_MS
	$: waves = launched && !hello && wavesOn === true
	// waves off, or the guard did not answer: the crowd holds the mask, no countdown
	$: still = launched && !hello && !waves

	// The wave the crowd is waiting for
	$: waveIndex = now === null ? 0 : Math.floor((now - waveBase) / waveMs)
	$: nextWave = waveBase + (waveIndex + 1) * waveMs
	// A wave left when the one we were waiting for is in the past. Keyed by its time,
	// so a schedule changed in the admin does not count as a departure.
	$: if (waves) {
		if (lastWave !== null && now >= lastWave) {
			departures += 1
			leavingUntil = now + LEAVING_MS
		}
		lastWave = nextWave
	} else lastWave = null
	$: leaving = waves && now < leavingUntil

	$: toWave = now === null ? 0 : Math.max(0, Math.ceil((nextWave - now) / 1000 - 1e-6))
	$: shown = waves ? toWave : (left ?? 0)
	$: urgent = now !== null && !hello && shown > 0 && shown <= URGENT_SECONDS

	$: days = Math.floor(shown / 86400)
	$: hours = Math.floor((shown % 86400) / 3600)
	$: minutes = Math.floor((shown % 3600) / 60)
	$: seconds = shown % 60

	// Nothing until the page runs in the browser: the server's clock and time
	// zone are not the viewer's.
	$: groups =
		now === null || hello
			? null
			: waves
				? [
						...(hours > 0 ? [{ unit: 'hrs', text: pad(hours) }] : []),
						{ unit: 'min', text: pad(minutes) },
						{ unit: 'sec', text: pad(seconds) }
					]
				: [
						...(days > 0 ? [{ unit: 'days', text: pad(days) }] : []),
						{ unit: 'hrs', text: pad(hours) },
						{ unit: 'min', text: pad(minutes) },
						{ unit: 'sec', text: pad(seconds) }
					]

	const timeLabel = (ms, withSeconds) =>
		new Date(ms).toLocaleTimeString('en-GB', {
			hour: '2-digit',
			minute: '2-digit',
			...(withSeconds ? { second: '2-digit' } : {}),
			hour12: false
		})
	const whenLabel = (ms) => {
		const day = new Date(ms).toLocaleDateString('en-GB', {
			weekday: 'short',
			day: 'numeric',
			month: 'short'
		})
		return `${day}, ${timeLabel(ms, false)}`
	}
	$: when = now === null ? '' : whenLabel(target)
	$: leavesAt = now === null ? '' : timeLabel(nextWave, waveMs < 60_000)

	/** The viewer's own offset from UTC, e.g. «GMT+2», «GMT-4», «GMT+5:30». */
	const zoneLabel = (ms) => {
		const offset = -new Date(ms).getTimezoneOffset()
		const h = Math.floor(Math.abs(offset) / 60)
		const m = Math.abs(offset) % 60
		return `GMT${offset < 0 ? '-' : '+'}${h}${m ? `:${pad(m)}` : ''}`
	}
	$: zone = now === null ? '' : zoneLabel(target)

	$: headline = !launched
		? 'Launching in'
		: hello || still
			? 'Now live'
			: leaving
				? 'Leaving now'
				: 'Next wave in'

	$: srText =
		left === null
			? 'Launching soon'
			: !launched
				? `Launching in ${days} days, ${hours} hours, ${minutes} minutes`
				: hello || still
					? 'Now live'
					: `Live. Next withdrawal wave in ${minutes} minutes`
</script>

<div
	class={cn(
		'launch-timer relative w-full max-w-[500px] overflow-hidden rounded-[10px] border border-dark text-light',
		className
	)}
	class:urgent
	class:live={launched}
	role="timer"
>
	<span class="sr-only">{srText}</span>

	<div class="relative flex items-center justify-between gap-3 px-4 pt-3 md:px-5 md:pt-4">
		<span class="label flex items-center gap-2">
			<span class="pulse" class:leaving aria-hidden="true" />
			{headline}
		</span>
		{#if waves}
			<span class="label lime">Live</span>
		{:else if launched}
			<span />
		{:else}
			<span class="label muted">Beta closed</span>
		{/if}
	</div>

	<CrowdDigits
		className="crowd"
		{groups}
		{urgent}
		live={still}
		word={hello ? 'LIVE' : null}
		{departures}
	/>

	<div class="relative flex items-center justify-between gap-3 px-4 pb-3 md:px-5 md:pb-4">
		<!-- The time is the viewer's own, and the card says so -->
		<span class="note flex flex-col">
			<span class="line"
				>{#if waves}Leaves at {leavesAt}{:else if still && wavesOn === null}&nbsp;{:else if when}{launched ? 'Opened' : 'Opens'}
					{when}{/if}</span
			>
			<span class="line zone"
				>{#if zone}Your time · {zone}{/if}</span
			>
		</span>
		{#if launched}
			<a class="open-app" href={NULLMASK_LINK}>
				Open app
				<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
					<path d="M3.5 8h8.5M8.5 4.5 12 8l-3.5 3.5" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
			</a>
		{:else}
			<span class="note hint" aria-hidden="true">
				<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3">
					<circle cx="8" cy="8" r="5.5" stroke-dasharray="1.6 2.2" />
					<circle cx="8" cy="8" r="1.4" fill="currentColor" stroke="none" />
				</svg>
				Hover to part the crowd
			</span>
		{/if}
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
	.label.lime {
		color: #cdef33;
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
	.pulse.leaving::after {
		animation-duration: 0.6s;
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

	/* After launch the card's one action: into the app */
	.open-app {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		height: 32px;
		padding: 0 12px 0 14px;
		border-radius: 999px;
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0.01em;
		color: #1a1c1b;
		white-space: nowrap;
		background: linear-gradient(180deg, #dcf75c 0%, #cdef33 55%, #b9db22 100%);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.55),
			inset 0 -1px 0 rgba(0, 0, 0, 0.12),
			0 0 0 1px rgba(205, 239, 51, 0.4),
			0 6px 18px -6px rgba(205, 239, 51, 0.55);
		transition:
			transform 0.15s,
			box-shadow 0.2s,
			filter 0.2s;
		animation: arrive 0.7s cubic-bezier(0.2, 0.9, 0.25, 1.2) both;
	}
	/* a finger needs more room than the button shows */
	.open-app::after {
		content: '';
		position: absolute;
		inset: -8px -4px;
	}
	.open-app svg {
		width: 14px;
		height: 14px;
		transition: transform 0.2s;
	}
	.open-app:hover {
		filter: brightness(1.05);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.6),
			inset 0 -1px 0 rgba(0, 0, 0, 0.12),
			0 0 0 1px rgba(205, 239, 51, 0.6),
			0 8px 24px -6px rgba(205, 239, 51, 0.75);
	}
	.open-app:hover svg {
		transform: translateX(2px);
	}
	.open-app:active {
		transform: scale(0.96);
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
		.open-app {
			height: 34px;
			font-size: 13px;
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
	@keyframes arrive {
		0% {
			opacity: 0;
			transform: translateY(6px) scale(0.92);
		}
		100% {
			opacity: 1;
			transform: none;
		}
	}
</style>
