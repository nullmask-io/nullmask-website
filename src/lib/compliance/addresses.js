/**
 * Nullmask on-chain addresses, Ethereum mainnet (chain ID 1).
 *
 * These are published for blockchain analytics providers and investigators
 * to label. Keep them identical to the deployment and to the signed
 * ownership statement in ./ownership-statement.json - that file is what the
 * deployer key signed, so any change there needs a fresh signature.
 */

export const CHAIN = {
	name: 'Ethereum mainnet',
	id: 1,
	deployBlock: 26097579
}

export const ETHERSCAN = 'https://etherscan.io'

/** @param {string} address */
export const etherscanAddress = (address) => `${ETHERSCAN}/address/${address}`

export const CONTRACTS = [
	{
		name: 'Nullmask pool (proxy)',
		kind: 'Proxy',
		note: 'The address users deposit to and withdraw from.',
		addresses: ['0xd64EF1417EB047ed0b54736a5a41F01178C391c6']
	},
	{
		name: 'Nullmask implementation',
		kind: 'Implementation',
		note: 'Logic contract behind the pool proxy.',
		addresses: ['0x503DE8FAcCee7993ad21d06066C740367c773e0E']
	},
	{
		name: 'AdminUpgradeController',
		kind: 'Admin',
		addresses: ['0xcD12496c9821075fD807c3488F3E0020715DED27']
	},
	{
		name: 'ShieldedTransferVerifier',
		kind: 'Verifier',
		addresses: ['0x56eEFC4fd0B1464d4A17BB95d6D2d6fefdeA477C']
	},
	{
		name: 'ShieldedWithdrawalVerifier',
		kind: 'Verifier',
		addresses: ['0x8eF11508eE2Bdb615AF89a10e9f8b020c9c28d2d']
	},
	{
		name: 'ShieldedSwapVerifier',
		kind: 'Verifier',
		addresses: ['0xec5700f2Cf0fe43C1F6c2a226FA323583F9453a6']
	},
	{
		name: 'NullmaskSwap',
		kind: 'Swap',
		addresses: ['0xc80869aF3a2f9521030f5B2eF75FE69455d18fdb']
	},
	{
		name: 'Poseidon2T4Unrolled',
		kind: 'Library',
		addresses: ['0x6f6a5cfe55528303a61C2dE7C041Ac467DcC9674']
	},
	{
		name: 'ZKTranscriptLib',
		kind: 'Library',
		addresses: ['0x06273159A1F8177eb513203b85a365a2BDd3088B']
	},
	{
		name: 'RelationsLib',
		kind: 'Library',
		addresses: ['0xa795F3acF1a2a632E4EF29C41F6C3E9862CeF474']
	}
]

export const OPERATIONAL = [
	{
		name: 'Deployer',
		kind: 'EOA',
		note: 'Deployed the contracts and signed the ownership statement below.',
		addresses: ['0x7Ae7D955feB681109299982f2770292Bb1482b4D']
	},
	{
		name: 'Contract admin',
		kind: 'EOA',
		note: 'Holds the admin role on the contracts.',
		addresses: ['0x51429d3A233579e7a46E3848E331dd0FD34674e0']
	},
	{
		name: 'Guard',
		kind: 'EOA',
		note: 'Approves or refuses each deposit.',
		addresses: ['0x0558E584846D1c913205c33588575CF5a20Bf856']
	},
	{
		name: 'Relayers',
		kind: 'EOA',
		note: 'Send withdrawals to the recipient. A withdrawal on-chain comes from one of these addresses.',
		addresses: [
			'0xb3d4518CAdC7054ec43C61A668C21c3772353F9D',
			'0xf5994B65903F19D839d49f24F873b6Bf54c78393',
			'0x6EA32B26b423cEB1b96759c78006a30FddFC71ff',
			'0x5592574f28B5225bFe00d8D3d6efAF97d1E98253',
			'0xdB0dF73A34C5924Eb126945E71d62c4f521b8c09',
			'0x58aDb1AF85E9BA8179D475225A112757e2673508'
		]
	}
]

/**
 * Every address as CSV (entity, name, group, address), one row per address,
 * so a labeling team can paste the whole set in one go.
 */
export const addressesCsv = () => {
	const rows = [['entity', 'name', 'group', 'address']]
	const add = (group, items) =>
		items.forEach((item) =>
			item.addresses.forEach((address, i) => {
				const name =
					item.addresses.length > 1 ? `${item.name.replace(/s$/, '')} ${i + 1}` : item.name
				rows.push(['Nullmask', name, group, address])
			})
		)
	add('contract', CONTRACTS)
	add('operational', OPERATIONAL)
	return rows.map((r) => r.map((v) => (/[",]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)).join(',')).join('\n')
}
