<script>
	import { onMount } from 'svelte'
	import { cn } from '$utils'

	/** The countdown as groups, e.g. [{ unit: 'days', text: '03' }, …]; null until the clock is known. */
	export let groups = null
	/** The last seconds: every digit lights up. */
	export let urgent = false
	/** Past zero: the crowd forms the mask. */
	export let live = false
	export let className = ''

	/**
	 * The countdown drawn by a crowd. Hundreds of dots drift over the card;
	 * the digits are nothing but dots of that same crowd holding a shape. When
	 * a digit changes it scatters back into the crowd and the new one is
	 * gathered from the dots around it, streaking in. A cursor is a lens the
	 * crowd moves away from - the digits come apart under it and gather again
	 * once it has passed; a click sends a ripple. Every minute a ripple runs
	 * through the whole crowd, and at launch all of it forms the mask.
	 */

	let canvas
	let engine = null

	$: if (engine) engine.show(groups, urgent, live)

	const TAU = Math.PI * 2
	const LIME = '#cdef33'
	const INK = '#f2f3ef'

	// How a dot is drawn: the crowd far and near, just let go, held in a digit, lit, a colon, flying in.
	const FAR = 0
	const NEAR = 1
	const WARM = 2
	const INKED = 3
	const LIT = 4
	const COLON = 5
	const STREAK = 6

	const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
	const shuffle = (list) => {
		for (let i = list.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1))
			const tmp = list[i]
			list[i] = list[j]
			list[j] = tmp
		}
		return list
	}

	onMount(() => {
		const ctx = canvas.getContext('2d')
		const scratch = document.createElement('canvas')
		const sctx = scratch.getContext('2d', { willReadFrequently: true })

		let W = 0
		let H = 0
		let dpr = 1
		let fontReady = false
		let mask = null
		let clock = performance.now()

		/** Every dot. `slot` is the shape it holds, or null while it drifts with the crowd. */
		const dots = []
		/** The characters on the card, each with the dots holding it. */
		let slots = []
		let units = []
		let layoutKey = ''
		let geo = null
		let seconds = -1
		let lit = false
		let masked = false
		const ripples = []
		const lens = { x: 0, y: 0, ex: 0, ey: 0, on: false, a: 0 }
		let want = { groups: null, urgent: false, live: false }

		// Glyph widths of Poppins Bold, as shares of the font size (measured once the font is in).
		let digitW = 0.64
		let colonW = 0.3

		const spawn = (x, y) => {
			const dot = {
				x,
				y,
				vx: (Math.random() - 0.5) * 20,
				vy: (Math.random() - 0.5) * 20,
				tx: 0,
				ty: 0,
				slot: null,
				seed: Math.random(),
				heat: 0,
				freedAt: -1e9,
				born: clock,
				speed: 0,
				kind: FAR
			}
			dots.push(dot)
			return dot
		}

		// A phone gets a thinner crowd and coarser digits: fewer dots to move and draw.
		const crowdSize = () =>
			Math.round(W < 400 ? clamp((W * H) / 200, 160, 400) : clamp((W * H) / 150, 260, 1100))

		const geometry = (chars) => {
			const digits = chars.filter((c) => c.ch !== ':').length
			const colons = chars.length - digits
			const padX = W < 400 ? 12 : 18
			const byWidth = (W - padX * 2) / (digits * digitW + colons * colonW)
			const byHeight = (H - 26) / 0.74
			const fs = clamp(Math.min(byWidth, byHeight), 18, 130)
			const pitch = Math.max(2.5, fs / (W < 400 ? 16 : 19))
			const capH = fs * 0.7
			const blockTop = (H - (capH + 20)) / 2
			return {
				fs,
				pitch,
				dot: pitch * 0.4,
				// the scratch glyph's top edge on the card: its cap height starts 0.1 em below it
				textTop: blockTop - fs * 0.1,
				unitsY: blockTop + capH + 15
			}
		}

		const glyphs = new Map()
		const glyphPoints = (ch) => {
			const key = `${ch}|${geo.fs.toFixed(2)}`
			const hit = glyphs.get(key)
			if (hit) return hit
			const w = Math.ceil(geo.fs * (ch === ':' ? colonW : digitW))
			const h = Math.ceil(geo.fs * 0.9)
			scratch.width = w
			scratch.height = h
			sctx.clearRect(0, 0, w, h)
			sctx.fillStyle = '#fff'
			sctx.font = `700 ${geo.fs}px Poppins, sans-serif`
			sctx.textAlign = 'center'
			sctx.textBaseline = 'alphabetic'
			sctx.fillText(ch, w / 2, geo.fs * 0.8)
			const data = sctx.getImageData(0, 0, w, h).data
			const points = []
			// a halftone grid: every other row shifted by half a step
			let row = 0
			for (let y = geo.pitch / 2; y < h; y += geo.pitch * 0.866, row++) {
				for (let x = row % 2 ? geo.pitch : geo.pitch / 2; x < w; x += geo.pitch) {
					if (data[(Math.floor(y) * w + Math.floor(x)) * 4 + 3] > 120) points.push({ x, y })
				}
			}
			glyphs.set(key, points)
			return points
		}

		const maskPoints = () => {
			if (!mask) return []
			const h = H * 0.86
			const w = (h * mask.naturalWidth) / mask.naturalHeight
			const cw = Math.ceil(w)
			const ch = Math.ceil(h)
			scratch.width = cw
			scratch.height = ch
			sctx.clearRect(0, 0, cw, ch)
			sctx.drawImage(mask, 0, 0, cw, ch)
			const data = sctx.getImageData(0, 0, cw, ch).data
			const step = Math.max(2.6, geo ? geo.pitch * 0.9 : 3.2)
			const points = []
			let row = 0
			for (let y = step / 2; y < ch; y += step * 0.866, row++) {
				for (let x = row % 2 ? step : step / 2; x < cw; x += step) {
					if (data[(Math.floor(y) * cw + Math.floor(x)) * 4 + 3] > 120) {
						points.push({ x: (W - w) / 2 + x, y: (H - h) / 2 + y })
					}
				}
			}
			return points
		}

		/** The dot lets go of its shape and drifts off with the crowd; a burst throws it out first. */
		const release = (slot, burst) => {
			for (const dot of slot.dots) {
				dot.slot = null
				dot.freedAt = clock
				if (!burst) continue
				const dx = dot.x - slot.cx
				const dy = dot.y - slot.cy
				const d = Math.hypot(dx, dy) || 1
				const v = 80 + Math.random() * 170
				dot.vx += (dx / d) * v + (Math.random() - 0.5) * 70
				dot.vy += (dy / d) * v + (Math.random() - 0.5) * 70 - 30
				dot.heat = 1
			}
			slot.dots = []
		}

		/**
		 * The new shape is gathered from the crowd: mostly the dots nearest to it,
		 * with some chance for ones further off, so a few streak in from afar.
		 * `reuse` lets it take dots that have only just been let go (a resize).
		 */
		const gather = (slot, points, reuse) => {
			const free = dots.filter((dot) => !dot.slot && (reuse || clock - dot.freedAt > 140))
			const scored = free.map((dot) => ({
				dot,
				score: Math.hypot(dot.x - slot.cx, dot.y - slot.cy) * (0.55 + Math.random() * 0.9)
			}))
			scored.sort((a, b) => a.score - b.score)
			const targets = shuffle(points.slice())
			for (let k = 0; k < targets.length; k++) {
				const dot = scored[k]?.dot ?? spawn(Math.random() < 0.5 ? -4 : W + 4, Math.random() * H)
				dot.slot = slot
				dot.tx = targets[k].x
				dot.ty = targets[k].y
				dot.heat = Math.max(dot.heat, 0.85)
				slot.dots.push(dot)
			}
		}

		const glyphTargets = (slot) =>
			glyphPoints(slot.ch).map((p) => ({ x: slot.x0 + p.x, y: geo.textTop + p.y }))

		const ripple = (x, y, power, speed, width, life) =>
			ripples.push({ x, y, at: clock, power, speed, width, life })

		const flatten = (list) => {
			const chars = []
			list.forEach((group, gi) => {
				if (gi > 0) chars.push({ ch: ':', group: -1 })
				for (const ch of group.text) chars.push({ ch, group: gi })
			})
			return chars
		}

		/** Places every character anew (first frame, a resize, a group dropping out) and gathers them all. */
		const relayout = (list) => {
			for (const slot of slots) release(slot, false)
			const chars = flatten(list)
			geo = geometry(chars)
			const total = chars.reduce((sum, c) => sum + geo.fs * (c.ch === ':' ? colonW : digitW), 0)
			let x = (W - total) / 2
			slots = chars.map((c) => {
				const w = geo.fs * (c.ch === ':' ? colonW : digitW)
				const slot = {
					ch: c.ch,
					group: c.group,
					unit: c.group >= 0 ? list[c.group].unit : '',
					x0: x,
					w,
					cx: x + w / 2,
					cy: geo.textTop + geo.fs * 0.45,
					dots: []
				}
				x += w
				return slot
			})
			units = list.map((group, gi) => {
				const own = slots.filter((s) => s.group === gi)
				return {
					text: group.unit.toUpperCase(),
					x: own.reduce((sum, s) => sum + s.cx, 0) / own.length
				}
			})
			for (const slot of slots) gather(slot, glyphTargets(slot), true)
			// keep the crowd around the digits as thick as the card's size asks
			const drifting = dots.filter((dot) => !dot.slot).length
			for (let i = drifting; i < crowdSize(); i++) spawn(Math.random() * W, Math.random() * H)
		}

		const toMask = () => {
			const points = maskPoints()
			if (!points.length) return false
			for (const slot of slots) release(slot, true)
			const slot = { ch: 'mask', group: -2, unit: '', x0: 0, w: W, cx: W / 2, cy: H / 2, dots: [] }
			slots = [slot]
			units = []
			gather(slot, points, true)
			ripple(W / 2, H / 2, 4200, 520, 34, 1.6)
			ripple(W / 2, H / 2, 2400, 300, 26, 1.8)
			return true
		}

		const show = (list, isUrgent, isLive) => {
			want = { groups: list, urgent: isUrgent, live: isLive }
			if (!fontReady || !W) return
			if (isLive) {
				if (!masked) masked = toMask()
				return
			}
			if (masked) {
				masked = false
				layoutKey = ''
			}
			lit = isUrgent
			if (!list) return
			const sec = list.find((g) => g.unit === 'sec')
			seconds = sec ? Number(sec.text) : -1
			const key = `${W}|${H}|${list.map((g) => `${g.unit}:${g.text.length}`).join(',')}`
			if (key !== layoutKey) {
				layoutKey = key
				relayout(list)
				return
			}
			const chars = flatten(list)
			let minuteTurned = false
			chars.forEach((c, i) => {
				const slot = slots[i]
				if (slot.ch === c.ch) return
				release(slot, true)
				slot.ch = c.ch
				gather(slot, glyphTargets(slot), false)
				ripple(slot.cx, slot.cy, isUrgent ? 1500 : 800, 230, 12, 0.55)
				if (slot.unit === 'min') minuteTurned = true
			})
			if (minuteTurned) ripple(W / 2, H / 2, 1600, 540, 24, 1)
		}

		engine = { show }

		// ---- the frame
		let last = performance.now()
		const step = (now) => {
			const dt = Math.min(1 / 30, Math.max(0, (now - last) / 1000))
			last = now
			clock = now
			const t = now / 1000

			lens.ex += (lens.x - lens.ex) * 0.3
			lens.ey += (lens.y - lens.ey) * 0.3
			lens.a += ((lens.on ? 1 : 0) - lens.a) * 0.12
			const lensR = W < 400 ? 42 : 58
			const lensOn = lens.a > 0.02

			for (let i = ripples.length - 1; i >= 0; i--) {
				if ((now - ripples[i].at) / 1000 > ripples[i].life) ripples.splice(i, 1)
			}

			for (const dot of dots) {
				let ax
				let ay
				if (dot.slot) {
					// held in the shape: a spring to its place, with a faint shimmer
					const jx = Math.sin(t * 1.7 + dot.seed * 40) * 0.3
					const jy = Math.cos(t * 1.3 + dot.seed * 57) * 0.3
					ax = (dot.tx + jx - dot.x) * 95 - dot.vx * 14
					ay = (dot.ty + jy - dot.y) * 95 - dot.vy * 14
				} else {
					// drifting with the crowd along a slow, swirling current
					const angle =
						Math.sin(dot.x * 0.011 + t * 0.3) * 1.7 +
						Math.cos(dot.y * 0.014 - t * 0.23) * 1.7 +
						Math.sin((dot.x + dot.y) * 0.004 + t * 0.1) * 2
					// the near half of the crowd moves faster than the far one
					const speed = dot.seed < 0.55 ? 5 + dot.seed * 6 : 10 + dot.seed * 10
					// a dot just thrown out of a digit slows down quickly and stays near it
					const settle = 1.1 + 3.2 * dot.heat
					ax = (Math.cos(angle) * speed - dot.vx) * settle
					ay = (Math.sin(angle) * speed - dot.vy) * settle
					// soft walls: the card's edge turns a burst back instead of letting it
					// come out on the far side, where the next digit would pull it across
					if (dot.heat > 0.05) {
						const edge = 10
						if (dot.x < edge) ax += (edge - dot.x) * 60
						else if (dot.x > W - edge) ax -= (dot.x - W + edge) * 60
						if (dot.y < edge) ay += (edge - dot.y) * 60
						else if (dot.y > H - edge) ay -= (dot.y - H + edge) * 60
					}
				}
				if (lensOn) {
					const dx = dot.x - lens.ex
					const dy = dot.y - lens.ey
					const d2 = dx * dx + dy * dy
					if (d2 < lensR * lensR) {
						const d = Math.sqrt(d2) + 0.01
						const f = (1 - d / lensR) ** 2 * 5200 * lens.a
						ax += (dx / d) * f
						ay += (dy / d) * f
					}
				}
				for (const r of ripples) {
					const age = (now - r.at) / 1000
					const dx = dot.x - r.x
					const dy = dot.y - r.y
					const d = Math.sqrt(dx * dx + dy * dy) + 0.01
					const band = (d - age * r.speed) / r.width
					if (band > 2.5 || band < -2.5) continue
					const f = r.power * Math.exp(-band * band) * (1 - age / r.life)
					ax += (dx / d) * f
					ay += (dy / d) * f
				}
				dot.vx += ax * dt
				dot.vy += ay * dt
				let v = Math.sqrt(dot.vx * dot.vx + dot.vy * dot.vy)
				if (v > 1400) {
					dot.vx *= 1400 / v
					dot.vy *= 1400 / v
					v = 1400
				}
				dot.x += dot.vx * dt
				dot.y += dot.vy * dt
				dot.speed = v
				dot.heat = Math.max(0, dot.heat - dt * 1.3)
				const slot = dot.slot
				if (!slot) {
					if (dot.x < -6) dot.x += W + 12
					else if (dot.x > W + 6) dot.x -= W + 12
					if (dot.y < -6) dot.y += H + 12
					else if (dot.y > H + 6) dot.y -= H + 12
				}
				// how the dot is drawn this frame
				dot.kind = !slot
					? dot.heat > 0.2
						? WARM
						: dot.seed < 0.55
							? FAR
							: NEAR
					: v > 70
						? STREAK
						: slot.ch === ':'
							? COLON
							: slot.group === -2 || lit || slot.unit === 'sec'
								? LIT
								: INKED
			}

			draw(now)
		}

		const draw = (now) => {
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
			ctx.clearRect(0, 0, W, H)
			const r = geo ? geo.dot : 1.2
			const crowdR = Math.max(0.8, r * 0.62)
			const beat = seconds >= 0 ? (1 - (Date.now() % 1000) / 1000) ** 3 : 0

			// One path per kind of dot, built straight on the context: no objects made per
			// frame, and no canvas shadows (a soft halo drawn as a wider dot is far cheaper).
			const dotsOf = (kind, radius, fade) => {
				ctx.beginPath()
				for (const dot of dots) {
					if (dot.kind !== kind) continue
					const s = fade ? radius * clamp((now - dot.born) / 500, 0, 1) : radius
					ctx.moveTo(dot.x + s, dot.y)
					ctx.arc(dot.x, dot.y, s, 0, TAU)
				}
			}

			// the crowd, in two depths: far dots smaller and dimmer, near ones larger
			dotsOf(FAR, crowdR * 0.75, true)
			ctx.fillStyle = 'rgba(217,217,217,0.2)'
			ctx.fill()
			dotsOf(NEAR, crowdR * 1.25, true)
			ctx.fillStyle = 'rgba(217,217,217,0.42)'
			ctx.fill()

			// just let go: still warm, cooling back into the crowd
			dotsOf(WARM, crowdR * 1.2, false)
			ctx.fillStyle = 'rgba(205,239,51,0.55)'
			ctx.fill()

			// held dots: the digits, the lit ones with a halo, the colons beating with the seconds
			dotsOf(INKED, r, false)
			ctx.fillStyle = INK
			ctx.fill()
			dotsOf(LIT, r * 2.1, false)
			ctx.fillStyle = 'rgba(205,239,51,0.13)'
			ctx.fill()
			dotsOf(LIT, r, false)
			ctx.fillStyle = LIME
			ctx.fill()
			dotsOf(COLON, r, false)
			ctx.globalAlpha = 0.35 + 0.65 * beat
			ctx.fill()
			ctx.globalAlpha = 1

			// the ones still flying in, as streaks
			ctx.beginPath()
			for (const dot of dots) {
				if (dot.kind !== STREAK) continue
				const k = Math.min(0.05, 16 / dot.speed)
				ctx.moveTo(dot.x - dot.vx * k, dot.y - dot.vy * k)
				ctx.lineTo(dot.x, dot.y)
			}
			ctx.strokeStyle = LIME
			ctx.lineWidth = r * 1.5
			ctx.lineCap = 'round'
			ctx.stroke()

			// the units under each group
			if (units.length && geo) {
				ctx.font = `600 ${W < 400 ? 8.5 : 9.5}px Poppins, sans-serif`
				if ('letterSpacing' in ctx) ctx.letterSpacing = '0.16em'
				ctx.fillStyle = 'rgba(217,217,217,0.45)'
				ctx.textAlign = 'center'
				ctx.textBaseline = 'middle'
				for (const unit of units) ctx.fillText(unit.text, unit.x, geo.unitsY)
				if ('letterSpacing' in ctx) ctx.letterSpacing = '0px'
			}

			// the lens
			if (lens.a > 0.02) {
				const glow = ctx.createRadialGradient(lens.ex, lens.ey, 0, lens.ex, lens.ey, lensRadius())
				glow.addColorStop(0, `rgba(205,239,51,${(0.07 * lens.a).toFixed(3)})`)
				glow.addColorStop(1, 'rgba(205,239,51,0)')
				ctx.fillStyle = glow
				ctx.beginPath()
				ctx.arc(lens.ex, lens.ey, lensRadius(), 0, TAU)
				ctx.fill()
				ctx.strokeStyle = `rgba(205,239,51,${(0.45 * lens.a).toFixed(3)})`
				ctx.lineWidth = 1
				ctx.setLineDash([2, 4])
				ctx.lineDashOffset = -now / 60
				ctx.beginPath()
				ctx.arc(lens.ex, lens.ey, lensRadius() * (0.94 + 0.06 * lens.a), 0, TAU)
				ctx.stroke()
				ctx.setLineDash([])
			}
		}
		const lensRadius = () => (W < 400 ? 42 : 58)

		// ---- size, font, the mask picture
		const resize = () => {
			const box = canvas.getBoundingClientRect()
			dpr = Math.min(2, window.devicePixelRatio || 1)
			const first = !W
			W = box.width
			H = box.height
			canvas.width = Math.max(1, Math.round(W * dpr))
			canvas.height = Math.max(1, Math.round(H * dpr))
			if (first) for (let i = 0; i < crowdSize(); i++) spawn(Math.random() * W, Math.random() * H)
			layoutKey = ''
			glyphs.clear()
			show(want.groups, want.urgent, want.live)
		}

		const fontsIn = () => {
			if (fontReady) return
			fontReady = true
			sctx.font = '700 100px Poppins, sans-serif'
			digitW = sctx.measureText('0').width / 100 + 0.05
			colonW = sctx.measureText(':').width / 100 + 0.1
			show(want.groups, want.urgent, want.live)
		}
		if (document.fonts?.load) {
			document.fonts.load('700 64px Poppins').then(fontsIn, fontsIn)
			setTimeout(fontsIn, 1500)
		} else fontsIn()

		const picture = new Image()
		picture.onload = () => {
			mask = picture
			show(want.groups, want.urgent, want.live)
		}
		picture.src = '/nullmask-mask.png'

		// ---- the pointer: a lens; a click or a tap sends a ripple
		const at = (event) => {
			const box = canvas.getBoundingClientRect()
			return { x: event.clientX - box.left, y: event.clientY - box.top }
		}
		const onMove = (event) => {
			const p = at(event)
			if (!lens.on) {
				lens.ex = p.x
				lens.ey = p.y
			}
			lens.x = p.x
			lens.y = p.y
			lens.on = true
		}
		const onLeave = () => (lens.on = false)
		const onDown = (event) => {
			const p = at(event)
			ripple(p.x, p.y, 3000, 340, 18, 0.9)
		}
		canvas.addEventListener('pointermove', onMove)
		canvas.addEventListener('pointerleave', onLeave)
		canvas.addEventListener('pointercancel', onLeave)
		canvas.addEventListener('pointerdown', onDown)

		// ---- the loop: it stops off screen and in a hidden tab
		let raf = 0
		let onScreen = true
		let drawnAt = 0
		const frame = (now) => {
			raf = 0
			if (!onScreen || document.hidden || !W) return
			raf = requestAnimationFrame(frame)
			// at most 60 frames a second, also on a 120 Hz screen
			if (now - drawnAt < 15) return
			drawnAt = now
			step(now)
		}
		const wake = () => {
			if (!raf && onScreen && !document.hidden) {
				last = performance.now()
				raf = requestAnimationFrame(frame)
			}
		}
		const resizer = new ResizeObserver(resize)
		resizer.observe(canvas)
		const watcher = new IntersectionObserver(([entry]) => {
			onScreen = entry.isIntersecting
			wake()
		})
		watcher.observe(canvas)
		document.addEventListener('visibilitychange', wake)
		wake()

		return () => {
			cancelAnimationFrame(raf)
			resizer.disconnect()
			watcher.disconnect()
			document.removeEventListener('visibilitychange', wake)
			canvas.removeEventListener('pointermove', onMove)
			canvas.removeEventListener('pointerleave', onLeave)
			canvas.removeEventListener('pointercancel', onLeave)
			canvas.removeEventListener('pointerdown', onDown)
			engine = null
		}
	})
</script>

<canvas bind:this={canvas} aria-hidden="true" class={cn('block w-full touch-pan-y', className)} />
