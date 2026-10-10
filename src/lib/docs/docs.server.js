import { Marked } from 'marked'

import { DOCS_NAV, docsHref } from './nav.js'

/**
 * Renders the documentation in src/lib/docs/content to HTML. The sources are
 * GitBook-flavoured markdown: besides GitHub markdown they may use
 * {% hint %}, {% tabs %}, {% code %}, {% content-ref %} and {% embed %}
 * blocks.
 */

const sources = import.meta.glob('./content/**/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
})

const SITE = 'https://nullmask.io'
const DESCRIPTION_MAX = 160

/** @param {string} key */
const pathOf = (key) => {
	const path = key.replace(/^\.\/content\//, '').replace(/\.md$/, '')
	return path === 'index' ? '' : path
}

const files = new Map(Object.entries(sources).map(([key, raw]) => [pathOf(key), raw]))
const order = DOCS_NAV.flatMap((group) => group.pages)

for (const path of order) {
	if (!files.has(path))
		throw new Error(
			`docs: the sidebar lists "${path}" but there is no content/${path || 'index'}.md`
		)
}
for (const path of files.keys()) {
	if (!order.includes(path))
		console.warn(`docs: content/${path}.md is not in the sidebar (src/lib/docs/nav.js)`)
}

// --- helpers -----------------------------------------------------------------

const escapeHtml = (s) =>
	String(s)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')

const decodeEntities = (s) =>
	String(s)
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;|&#x27;/g, "'")
		.replace(/&amp;/g, '&')

const isExternal = (href) => /^https?:\/\//i.test(href)

/** As marked does for link and image URLs. */
const cleanUrl = (href) => {
	try {
		return encodeURI(href).replace(/%25/g, '%')
	} catch {
		return href
	}
}

/**
 * Heading anchors as GitBook makes them, so old links with #anchors still land
 * on the right heading: "Phase 2 — Community & Incentives" ->
 * "phase-2-community-and-incentives", "1. Connect Wallet" -> "id-1.-connect-wallet",
 * repeats get -1, -2...
 */
const slugify = (text) => {
	let s = text.toLowerCase().replace(/&/g, 'and').replace(/['’]/g, '')
	s = s.replace(/[^a-z0-9_.]+/g, '-').replace(/^[-.]+|[-.]+$/g, '')
	return /^[0-9]/.test(s) ? `id-${s}` : s
}

/** A GitBook-style link to another page's .md file, as a /docs URL. */
const resolveHref = (href, from) => {
	if (isExternal(href) || /^(mailto:|tel:|#)/i.test(href)) return href
	const m = /^([^#?]*?)\.md(#.*)?$/i.exec(href)
	if (!m) return href
	let target = m[1]
	if (target.startsWith('/')) {
		target = target.slice(1)
	} else {
		const parts = from.split('/').slice(0, -1)
		for (const part of target.split('/')) {
			if (part === '..') parts.pop()
			else if (part && part !== '.') parts.push(part)
		}
		target = parts.join('/')
	}
	target = target.replace(/(^|\/)(readme|index)$/i, '')
	return docsHref(target) + (m[2] || '')
}

const attr = (attrs, name) => new RegExp(`${name}="([^"]*)"`).exec(attrs)?.[1]

// --- per-render state (rendering is synchronous) ------------------------------

let current = ''
let slugCounts = new Map()

const uniqueSlug = (text) => {
	const base = slugify(text) || 'section'
	const n = slugCounts.get(base)
	slugCounts.set(base, n === undefined ? 0 : n + 1)
	return n === undefined ? base : `${base}-${n + 1}`
}

const codeBlock = (text, lang, title) => {
	const label = title || lang
	return (
		`<div class="code-block">` +
		`<div class="code-bar"><span class="code-label">${escapeHtml(label || '')}</span>` +
		`<button type="button" class="code-copy" aria-label="Copy code">Copy</button></div>` +
		`<pre><code${lang ? ` class="language-${escapeHtml(lang)}"` : ''}>${escapeHtml(text)}</code></pre>` +
		`</div>\n`
	)
}

/** Plain text of inline tokens, for the meta description. */
const plainText = (tokens = []) =>
	tokens
		.map((t) => {
			if (t.type === 'br') return ' '
			if (t.type === 'html') return ''
			if (t.tokens) return plainText(t.tokens)
			return decodeEntities(t.text ?? '')
		})
		.join('')

// --- markdown ------------------------------------------------------------------

const HINT_ICONS = { info: 'i', success: '✓', warning: '!', danger: '!' }

// GitBook blocks: {% name attrs %} ... {% endname %}, each starting a line
const BLOCK_START = /^\{% (hint|tabs|code|content-ref|embed)\b/m
const END = String.raw`\n[ \t]*\{% end`
const AFTER = String.raw` %\}[ \t]*(?:\n+|$)`
const NOT_A_TAG = String.raw`(?:(?!\{%)[\s\S])*?`
const HINT = new RegExp(String.raw`^\{% hint style="(\w+)" %\}[ \t]*\n([\s\S]*?)${END}hint${AFTER}`)
const TABS = new RegExp(String.raw`^\{% tabs %\}[ \t]*\n([\s\S]*?)${END}tabs${AFTER}`)
const TAB = new RegExp(String.raw`\{% tab title="([^"]*)" %\}[ \t]*\n([\s\S]*?)${END}tab %\}`, 'g')
const CODE = new RegExp(String.raw`^\{% code([^%]*)%\}[ \t]*\n([\s\S]*?)${END}code${AFTER}`)
const CONTENT_REF = new RegExp(
	String.raw`^\{% content-ref url="([^"]+)" %\}[ \t]*\n?(${NOT_A_TAG})\n?[ \t]*\{% endcontent-ref${AFTER}`
)
const EMBED = new RegExp(
	String.raw`^\{% embed url="([^"]+)"[^%]*%\}[ \t]*(?:\n(${NOT_A_TAG})\n?[ \t]*\{% endembed %\})?[ \t]*(?:\n+|$)`
)

const gitbookBlocks = {
	name: 'gitbookBlock',
	level: 'block',
	start(src) {
		const i = src.search(BLOCK_START)
		return i < 0 ? undefined : i
	},
	tokenizer(src) {
		let m = HINT.exec(src)
		if (m) {
			const token = { type: 'gitbookBlock', kind: 'hint', raw: m[0], style: m[1], tokens: [] }
			this.lexer.blockTokens(m[2], token.tokens)
			return token
		}
		m = TABS.exec(src)
		if (m) {
			const tabs = [...m[1].matchAll(TAB)].map((t) => {
				const tab = { title: t[1], tokens: [] }
				this.lexer.blockTokens(t[2], tab.tokens)
				return tab
			})
			return { type: 'gitbookBlock', kind: 'tabs', raw: m[0], tabs }
		}
		m = CODE.exec(src)
		if (m) {
			const token = { type: 'gitbookBlock', kind: 'code', raw: m[0], tokens: [] }
			this.lexer.blockTokens(m[2], token.tokens)
			const code = token.tokens.find((t) => t.type === 'code')
			if (code) code.title = attr(m[1], 'title')
			return token
		}
		m = CONTENT_REF.exec(src)
		if (m) {
			// A card to another docs page shows that page's title, as GitBook does
			const href = resolveHref(m[1], current)
			const target = href.startsWith('/docs') ? href.replace(/^\/docs\/?/, '').split('#')[0] : null
			const label =
				(target !== null && titles.get(target)) || /\[([^\]]*)\]/.exec(m[2])?.[1] || m[1]
			return { type: 'gitbookBlock', kind: 'card', raw: m[0], href, label }
		}
		m = EMBED.exec(src)
		if (m) {
			const label = m[2]?.trim() || m[1]
			return { type: 'gitbookBlock', kind: 'card', raw: m[0], href: m[1], label }
		}
	},
	renderer(token) {
		if (token.kind === 'hint') {
			const style = HINT_ICONS[token.style] ? token.style : 'info'
			return (
				`<div class="callout callout-${style}" role="note">` +
				`<span class="callout-icon" aria-hidden="true">${HINT_ICONS[style]}</span>` +
				`<div class="callout-body">${this.parser.parse(token.tokens)}</div></div>\n`
			)
		}
		if (token.kind === 'tabs') {
			const tabs = token.tabs
				.map(
					(tab) =>
						`<section class="tab"><p class="tab-title">${escapeHtml(tab.title)}</p>${this.parser.parse(tab.tokens)}</section>`
				)
				.join('')
			return `<div class="tabs">${tabs}</div>\n`
		}
		if (token.kind === 'code') return this.parser.parse(token.tokens)
		const external = isExternal(token.href)
		return (
			`<a class="ref-card" href="${escapeHtml(token.href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>` +
			`<span class="ref-label">${escapeHtml(token.label)}</span>` +
			`<span class="ref-arrow" aria-hidden="true">${external ? '↗' : '→'}</span></a>\n`
		)
	}
}

const marked = new Marked({
	gfm: true,
	extensions: [gitbookBlocks],
	renderer: {
		heading({ tokens, depth }) {
			const html = this.parser.parseInline(tokens)
			const id = uniqueSlug(plainText(tokens))
			return `<h${depth} id="${id}">${html}<a class="anchor" href="#${id}" aria-hidden="true" tabindex="-1">#</a></h${depth}>\n`
		},
		code(token) {
			const lang = (token.lang || '').trim().split(/\s+/)[0]
			return codeBlock(token.text, lang, token.title)
		},
		link({ href, title, tokens }) {
			const url = cleanUrl(resolveHref(href, current))
			const external = isExternal(url)
			return (
				`<a href="${escapeHtml(url)}"${title ? ` title="${escapeHtml(title)}"` : ''}` +
				`${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${this.parser.parseInline(tokens)}</a>`
			)
		},
		image({ href, title, text }) {
			return `<img src="${escapeHtml(cleanUrl(href))}" alt="${escapeHtml(text)}"${title ? ` title="${escapeHtml(title)}"` : ''}>`
		}
	}
})

// Tables scroll inside their own box, and a header row with no text in it (a
// table written without headings) is left out; images load lazily
const finish = (html) =>
	html
		.replace(/<thead>\s*<tr>\s*(?:<th(?: align="\w+")?>\s*<\/th>\s*)+<\/tr>\s*<\/thead>\s*/g, '')
		.replace(/<table>/g, '<div class="table-wrap"><table>')
		.replace(/<\/table>/g, '</table></div>')
		.replace(/<img (?![^>]*\bloading=)/g, '<img loading="lazy" decoding="async" ')

// --- pages ---------------------------------------------------------------------

/** Front matter (only "key: value" lines and folded "key: >-" values) and body. */
const splitFrontMatter = (raw) => {
	const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(raw)
	if (!m) return { meta: {}, body: raw }
	const meta = {}
	const lines = m[1].split(/\r?\n/)
	for (let i = 0; i < lines.length; i++) {
		const kv = /^([\w-]+):\s*(.*)$/.exec(lines[i])
		if (!kv) continue
		let value = kv[2].trim()
		if (/^[>|][-+]?$/.test(value)) {
			const folded = []
			while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1])) folded.push(lines[++i].trim())
			value = folded.join(' ')
		}
		meta[kv[1]] = value.replace(/^(['"])(.*)\1$/, '$2')
	}
	return { meta, body: raw.slice(m[0].length) }
}

// The page title is the "# " line the page starts with
const TITLE = /^(?:[ \t]*\r?\n)*# ([^\r\n]+)/

const titles = new Map(
	order.map((path) => {
		const h1 = TITLE.exec(splitFrontMatter(files.get(path)).body)
		if (!h1) {
			throw new Error(`docs: content/${path || 'index'}.md does not start with a "# Title" line`)
		}
		return [path, h1[1].trim()]
	})
)

const nav = DOCS_NAV.map((group) => ({
	title: group.title || null,
	pages: group.pages.map((path) => ({ path, href: docsHref(path), title: titles.get(path) }))
}))

const groupOf = new Map(
	DOCS_NAV.flatMap((group) => group.pages.map((path) => [path, group.title || null]))
)

const cache = new Map()

const render = (path) => {
	const { meta, body } = splitFrontMatter(files.get(path))
	const markdown = body.replace(TITLE, '')

	current = path
	slugCounts = new Map()
	const tokens = marked.lexer(markdown)
	const html = finish(marked.parser(tokens))

	// The first paragraph, unless it is only a lead-in to a list or code ("...:")
	const first = tokens.find((t) => t.type === 'paragraph')
	let description = first ? plainText(first.tokens).replace(/\s+/g, ' ').trim() : ''
	if (description.length < 40 || description.endsWith(':')) {
		const group = groupOf.get(path)
		description = `Nullmask documentation: ${group ? `${group} — ` : ''}${titles.get(path)}.`
	}
	if (description.length > DESCRIPTION_MAX) {
		const cut = description.slice(0, DESCRIPTION_MAX - 1)
		description = `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:.—-]+$/, '')}…`
	}

	const i = order.indexOf(path)
	const link = (p) => (p === undefined ? null : { href: docsHref(p), title: titles.get(p) })

	return {
		path,
		title: titles.get(path),
		lead: meta.description || null,
		group: groupOf.get(path),
		description,
		canonical: SITE + docsHref(path),
		html,
		prev: link(order[i - 1]),
		next: link(order[i + 1])
	}
}

/** Every docs page path, in sidebar order ('' is the docs home). */
export const docsPaths = () => [...order]

/** The sidebar: groups of { path, href, title }. */
export const docsNav = () => nav

/** A rendered docs page, or null when there is no page at that path. */
export const getDocsPage = (path) => {
	if (!files.has(path) || !order.includes(path)) return null
	if (!cache.has(path)) cache.set(path, render(path))
	return cache.get(path)
}
