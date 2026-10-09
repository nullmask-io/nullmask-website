/**
 * Nullmask on-chain addresses on Ethereum mainnet (chain ID 1) and Base
 * (chain ID 8453).
 *
 * These are published for blockchain analytics providers and investigators
 * to label. Keep them identical to the deployment records
 * (contracts/deployments/<network>/nullmask.json) and to the chain.
 * ./ownership-statement.json is what the deployer key signed on 1 October
 * 2026 for Ethereum; it is shown as signed, so any change there needs a fresh
 * signature.
 */

/** @typedef {{ name: string, url: string }} Explorer */
/** @typedef {{ address: string, label: string, tag?: string }} Entry */
/** @typedef {{ name: string, kind?: string, note?: string, entries: Entry[] }} Item */

/** @type {Explorer} */
export const ETHERSCAN = { name: 'Etherscan', url: 'https://etherscan.io' }
/** @type {Explorer} */
export const BASESCAN = { name: 'Basescan', url: 'https://basescan.org' }

/**
 * @param {Explorer} explorer
 * @param {string} address
 * @param {'address' | 'token'} [page]
 */
export const explorerLink = (explorer, address, page = 'address') =>
	`${explorer.url}/${page}/${address}`

/** One address shown under its own name. */
const one = (name, kind, address, note) => ({
	name,
	kind,
	note,
	entries: [{ address, label: name }]
})

const RELAYERS = [
	'0xb3d4518CAdC7054ec43C61A668C21c3772353F9D',
	'0xf5994B65903F19D839d49f24F873b6Bf54c78393',
	'0x6EA32B26b423cEB1b96759c78006a30FddFC71ff',
	'0x5592574f28B5225bFe00d8D3d6efAF97d1E98253',
	'0xdB0dF73A34C5924Eb126945E71d62c4f521b8c09',
	'0x58aDb1AF85E9BA8179D475225A112757e2673508'
]

/** @param {string} implementation @param {Item} swap @returns {Item[]} */
const contracts = (implementation, swap) => [
	one(
		'Nullmask pool (proxy)',
		'Proxy',
		'0xd64EF1417EB047ed0b54736a5a41F01178C391c6',
		'The address users deposit to and withdraw from.'
	),
	one(
		'Nullmask implementation',
		'Implementation',
		implementation,
		'Logic contract behind the pool proxy.'
	),
	one('AdminUpgradeController', 'Admin', '0xcD12496c9821075fD807c3488F3E0020715DED27'),
	one('ShieldedTransferVerifier', 'Verifier', '0x56eEFC4fd0B1464d4A17BB95d6D2d6fefdeA477C'),
	one('ShieldedWithdrawalVerifier', 'Verifier', '0x8eF11508eE2Bdb615AF89a10e9f8b020c9c28d2d'),
	one('ShieldedSwapVerifier', 'Verifier', '0xec5700f2Cf0fe43C1F6c2a226FA323583F9453a6'),
	swap,
	one('Poseidon2T4Unrolled', 'Library', '0x6f6a5cfe55528303a61C2dE7C041Ac467DcC9674'),
	one('ZKTranscriptLib', 'Library', '0x06273159A1F8177eb513203b85a365a2BDd3088B'),
	one('RelationsLib', 'Library', '0xa795F3acF1a2a632E4EF29C41F6C3E9862CeF474')
]

/** @param {string} deployerNote @returns {Item[]} */
const operational = (deployerNote) => [
	one('Deployer', undefined, '0x7Ae7D955feB681109299982f2770292Bb1482b4D', deployerNote),
	one(
		'Contract admin',
		undefined,
		'0x51429d3A233579e7a46E3848E331dd0FD34674e0',
		'Holds the admin role on the contracts.'
	),
	one(
		'Guard',
		undefined,
		'0x0558E584846D1c913205c33588575CF5a20Bf856',
		'Approves or refuses each deposit.'
	),
	{
		name: 'Relayers',
		kind: `${RELAYERS.length} addresses`,
		note: 'Send withdrawals to the recipient. A withdrawal on-chain comes from one of these addresses.',
		entries: RELAYERS.map((address, i) => ({
			address,
			label: `Relayer ${i + 1}`,
			tag: `Relayer ${i + 1}`
		}))
	}
]

export const NETWORKS = [
	{
		id: 'ethereum',
		name: 'Ethereum mainnet',
		short: 'Ethereum',
		chainId: 1,
		deployBlock: 26097579,
		explorer: ETHERSCAN,
		contracts: contracts(
			'0x8b5E7C7399A1b4C15D2ae9ee3cffF40a2468797b',
			one('NullmaskSwap', 'Swap', '0x3240aB784Aac29ad6ff557ccd50764046911D42B')
		),
		operational: operational('Deployed the pool and signed the ownership statement below.'),
		assets: [
			{ symbol: 'ETH', kind: 'Native' },
			{ symbol: 'USDT', kind: 'ERC-20', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' }
		]
	},
	{
		id: 'base',
		name: 'Base',
		short: 'Base',
		chainId: 8453,
		deployBlock: 52288192,
		explorer: BASESCAN,
		contracts: contracts(
			'0xc763e8212e5C4143b8404c19f848C7D18e1aE5a1',
			one('NullmaskSwapSlipstream', 'Swap', '0x4dbEB1963dCB8524De81950bdd8adfF8e1c526D1')
		),
		operational: operational('Deployed the contracts.'),
		assets: [
			{ symbol: 'ETH', kind: 'Native' },
			{ symbol: 'USDC', kind: 'ERC-20', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' }
		]
	}
]

/** The deployer's transaction that created the Base pool (block 52288192). */
export const BASE_POOL_CREATION_TX =
	'0xceb726fef469abeaf59d76d24a2a4ffa55ac2a6cd938b0d9c9c0255db8c4c23e'

/** Nullmask's treasury account inside NEAR Intents: bridge order fees are paid to it. */
export const BRIDGE_FEE_ACCOUNT = '0xdd85f4afde114dc7c480b012feaa83152a0c0d09'

/**
 * Every Nullmask address as CSV (entity, network, name, group, address), one
 * row per address, so a labeling team can paste the whole set in one go.
 * Token contracts of the accepted assets are not Nullmask's and are left out.
 */
export const addressesCsv = () => {
	const rows = [['entity', 'network', 'name', 'group', 'address']]
	for (const net of NETWORKS) {
		for (const [group, items] of [
			['contract', net.contracts],
			['operational', net.operational]
		]) {
			for (const item of items) {
				for (const e of item.entries) rows.push(['Nullmask', net.short, e.label, group, e.address])
			}
		}
	}
	rows.push(['Nullmask', 'NEAR Intents', 'Treasury account', 'bridge', BRIDGE_FEE_ACCOUNT])
	return rows
		.map((r) => r.map((v) => (/[",]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)).join(','))
		.join('\n')
}
