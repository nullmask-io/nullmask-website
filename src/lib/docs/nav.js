/**
 * The documentation sidebar, in reading order: groups of page paths under
 * /docs. Each path is a file in ./content (the docs home is index.md) and the
 * page's title is the first "# " heading of that file. A group without a
 * title is a page listed on its own. Previous / next links follow this order.
 */
export const DOCS_NAV = [
	{ pages: [''] },
	{
		title: 'Introduction',
		pages: [
			'introduction/introduction',
			'introduction/key-features',
			'introduction/how-it-works',
			'introduction/comparison'
		]
	},
	{ pages: ['project-roadmap'] },
	{
		title: 'Architecture',
		pages: [
			'architecture/architecture',
			'architecture/virtual-network',
			'architecture/components',
			'architecture/supported-networks'
		]
	},
	{
		title: 'Protocol Specification',
		pages: [
			'protocol-specification/protocol',
			'protocol-specification/security-objectives',
			'protocol-specification/key-derivation',
			'protocol-specification/notes',
			'protocol-specification/note-encryption',
			'protocol-specification/transaction-nullifiers',
			'protocol-specification/shielded-transfers',
			'protocol-specification/shielded-withdrawals',
			'protocol-specification/shielded-swaps',
			'protocol-specification/cryptographic-primitives'
		]
	},
	{
		title: 'Smart Contract Reference',
		pages: [
			'smart-contract-reference/contracts',
			'smart-contract-reference/deposit',
			'smart-contract-reference/shielded-transfer',
			'smart-contract-reference/shielded-withdrawal',
			'smart-contract-reference/shielded-swap',
			'smart-contract-reference/key-registry',
			'smart-contract-reference/token-whitelist',
			'smart-contract-reference/events',
			'smart-contract-reference/errors',
			'smart-contract-reference/addresses'
		]
	},
	{
		title: 'RPC API Reference',
		pages: [
			'rpc-api-reference/rpc',
			'rpc-api-reference/modified-methods',
			'rpc-api-reference/custom-methods',
			'rpc-api-reference/forwarded-methods'
		]
	},
	{
		title: 'Circuits Reference',
		pages: [
			'circuits-reference/circuits',
			'circuits-reference/shared-library',
			'circuits-reference/shielded-transfer',
			'circuits-reference/shielded-withdrawal',
			'circuits-reference/shielded-swap',
			'circuits-reference/constraints'
		]
	},
	{
		title: 'Developer Guide',
		pages: [
			'developer-guide/developer',
			'developer-guide/local-setup',
			'developer-guide/monorepo-structure',
			'developer-guide/backend-services',
			'developer-guide/core-packages',
			'developer-guide/testing',
			'developer-guide/code-quality'
		]
	},
	{
		title: 'User Guide',
		pages: [
			'user-guide/guide',
			'user-guide/depositing',
			'user-guide/sending',
			'user-guide/withdrawing',
			'user-guide/swapping',
			'user-guide/wallet-only-mode',
			'user-guide/fees'
		]
	},
	{
		title: 'Compliance',
		pages: ['compliance/compliance', 'compliance/guard-service', 'compliance/revocation-keys']
	},
	{
		title: 'Security',
		pages: [
			'security/security',
			'security/hardware-wallets',
			'security/access-tokens',
			'security/on-chain-guarantees'
		]
	},
	{ title: 'Appendix', pages: ['appendix/glossary', 'appendix/constants'] }
]

/** The URL of a docs page path ('' is the docs home). */
export const docsHref = (path) => (path ? `/docs/${path}` : '/docs')
