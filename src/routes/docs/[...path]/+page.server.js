import { redirect } from '@sveltejs/kit'

import { docsNav, docsPaths, getDocsPage } from '$lib/docs/docs.server.js'

// Every docs page is built ahead of time; the route stays on the server too,
// so an unknown /docs/... address can be sent to the docs home
export const prerender = 'auto'

export function entries() {
	return docsPaths().map((path) => ({ path }))
}

/** @type {import('./$types').PageServerLoad} */
export function load({ params }) {
	const page = getDocsPage(params.path)
	if (!page) throw redirect(307, '/docs')
	return { page, nav: docsNav() }
}
