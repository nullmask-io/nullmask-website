import { error, redirect } from '@sveltejs/kit'

/** @param {import('@sveltejs/kit').RequestEvent} param0 */
export function load({ request, url }) {
	if (
		url.pathname !== '/' &&
		url.pathname !== '/compliance'
		// url.pathname !== '/litepaper' &&
		// url.pathname !== '/manifesto' &&
		// url.pathname !== '/spin' &&
		// url.pathname !== '/team'
	) {
		throw redirect(307, '/')
	}
}
