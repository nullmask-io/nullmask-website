import { error, redirect } from '@sveltejs/kit'

/** @param {import('@sveltejs/kit').RequestEvent} param0 */
export function load({ request, url }) {
	if (
		url.pathname !== '/' &&
		url.pathname !== '/compliance' &&
		// the docs route sends unknown /docs/... addresses to /docs itself
		url.pathname !== '/docs' &&
		!url.pathname.startsWith('/docs/')
		// url.pathname !== '/litepaper' &&
		// url.pathname !== '/manifesto' &&
		// url.pathname !== '/spin' &&
		// url.pathname !== '/team'
	) {
		throw redirect(307, '/')
	}
}
