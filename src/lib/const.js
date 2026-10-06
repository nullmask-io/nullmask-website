export const HEADER = {
	height: {
		desktop: 106,
		mobile: 80
	},
	marginTop: {
		desktop: 20,
		mobile: 10
	}
}

export const SOCIALS = {
	x: 'https://x.com/NullMaskio',
	tg: 'https://t.me/+suNrRakrTwA1OTVh',
	email: 'mailto:hello@nullmask.io'
}

export const NULLMASK_LINK = 'https://app.nullmask.io'

/**
 * When the app opens to everyone: the hero counts down to it, in the
 * viewer's local time.
 */
export const LAUNCH_AT = '2026-10-01T17:00:00Z'

/**
 * A scheduled update: until then the hero counts down to it instead of to the
 * next wave, and goes back to the waves by itself once it has passed. Null when
 * none is scheduled.
 */
export const UPDATE_AT = '2026-10-07T17:00:00Z'

/**
 * The MASK mint on Solana.
 *
 * Publishing a token address invites look-alike sites with one character
 * swapped, so it lives in exactly one place here and is rendered through the
 * copy button rather than left for anyone to retype. Keep it identical to the
 * pinned posts on X and Telegram - those are what people check it against.
 */
export const MASK_TOKEN = {
	ticker: 'MASK',
	chain: 'solana',
	address: 'HuAXPyDWDaMYFKuwQHpqL1oPnj93zdzWmtvFGzCeCUa7',
	buyUrl: 'https://dexscreener.com/solana/4gwh5sakgzoukhhj4rh3p5fmpu6ypuaexv6fah5jqyfm'
}
