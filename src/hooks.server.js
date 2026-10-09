import { GTM_ID } from '$lib/const'

/**
 * Fills the Google Tag Manager container id into the page template
 * (src/app.html), so the id is kept in one place.
 *
 * @type {import('@sveltejs/kit').Handle}
 */
export async function handle({ event, resolve }) {
	return resolve(event, {
		transformPageChunk: ({ html }) => html.replaceAll('%gtm.id%', GTM_ID)
	})
}
