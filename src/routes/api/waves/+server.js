import { json } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'

/**
 * The withdrawal wave schedule, from the guard's public config. The guard
 * answers a browser only on the app's own origin, so the landing asks it from
 * its server and hands the browser just the schedule: whether waves run, how
 * often, and the offset from 00:00 UTC (boundary k = offset + k x interval).
 */
const GUARD_URL = (env.GUARD_URL || 'https://guard.nullmask.io').replace(/\/+$/, '')
const TIMEOUT_MS = 2500

export async function GET({ fetch, setHeaders }) {
	try {
		const response = await fetch(`${GUARD_URL}/v1/public-config`, {
			signal: AbortSignal.timeout(TIMEOUT_MS)
		})
		if (!response.ok) throw new Error(`HTTP ${response.status}`)
		const waves = (await response.json())?.withdrawals?.waves
		const interval = Number(waves?.intervalMinutes)
		const offset = Number(waves?.offsetMinutes)
		const valid = Number.isFinite(interval) && interval > 0 && Number.isFinite(offset) && offset >= 0
		// a minute at the edge, five more while the guard is asked again
		setHeaders({ 'cache-control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=300' })
		return json({
			enabled: waves?.enabled === true && valid,
			intervalMinutes: valid ? interval : null,
			offsetMinutes: valid ? offset : null
		})
	} catch {
		setHeaders({ 'cache-control': 'no-store' })
		return json({ enabled: false, intervalMinutes: null, offsetMinutes: null }, { status: 503 })
	}
}
