# Key Features

## Unified UX

Nullmask does not require any change in user behavior. Users continue using the wallets and workflows they are already accustomed to. The protocol installs as a new EVM network and operates transparently within the wallet.

## Ultimate Compatibility

Nullmask does not require any code modifications in wallets. It simply installs as a new EVM network and already works in MetaMask and any wallet that supports custom RPC endpoints and EIP-1559 transactions.

## Enhanced Security

Spending authority never leaves the wallet. Unlike other privacy protocols that extract private keys or require custom signing, Nullmask authorizes shielded transactions using standard EIP-1559 transactions. This makes the protocol more resilient to phishing attacks.

<figure><img src="/docs/images/architecture-comparison.png" width="691" height="739" alt="Architecture comparison showing Nullmask&#x27;s security advantage"><figcaption><p>Architecture comparison: Nullmask keeps spending authority inside the wallet</p></figcaption></figure>

## Hardware Wallet Support

Most privacy solutions extract spending authority from the wallet. Nullmask does not — the spending authority never leaves the wallet.

Nullmask authorizes shielded transactions using standard EIP-1559 transactions, which are already implemented in every hardware wallet. No modifications to the wallet's code are needed.

## Shielded Operations

| Operation               | Description                                                     |
| ----------------------- | --------------------------------------------------------------- |
| **Shielded Transfer**   | Send tokens privately between addresses                         |
| **Shielded Withdrawal** | Move funds out of the privacy pool to any address               |
| **Shielded Swap**       | Execute Uniswap V2 swaps without exposing user identity         |
| **Private Deposit**     | Move funds into the shielded pool with guard-approved screening |

## Multi-Chain Deployment

Nullmask is deployed across multiple EVM chains:

* Ethereum Mainnet
* Ethereum Sepolia (testnet)
* Arbitrum One
* MegaETH
* Base
* BSC

## Built-in Compliance

Every deposit is screened by chain analysis tools before approval. The guard service ensures illicit funds cannot enter the privacy pool. A novel revocation key mechanism enables retrospective taint recovery if deposits are flagged after approval.

## ERC-20 Support

Shield any whitelisted ERC-20 token alongside native ETH. The protocol supports fee-on-transfer tokens with automatic delta-accounting.
