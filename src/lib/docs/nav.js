/**
 * The documentation sidebar, in reading order: groups of page paths under
 * /docs, in the order and with the group titles of the user documentation's
 * table of contents (its SUMMARY.md). Each path is a file in ./content (the
 * docs home is index.md, that documentation's README.md) and the page's title
 * is the first "# " heading of that file. A group without a title is a page
 * listed on its own. Previous / next links follow this order.
 */
export const DOCS_NAV = [
	{ pages: [''] },
	{ title: 'Getting started', pages: ['getting-started', 'networks'] },
	{
		title: 'Using Nullmask',
		pages: ['deposit', 'send', 'withdraw', 'swap', 'bridge', 'gas']
	},
	{ title: 'Fees', pages: ['fees'] },
	{ title: 'Privacy and safety', pages: ['privacy', 'deposit-checks', 'security'] },
	{ title: 'More', pages: ['faq', 'project-roadmap'] }
]

/** The URL of a docs page path ('' is the docs home). */
export const docsHref = (path) => (path ? `/docs/${path}` : '/docs')
