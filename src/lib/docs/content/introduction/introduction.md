# What is Nullmask?

Nullmask is a novel on-chain privacy architecture that enables users to transact privately from any existing multichain wallet. It requires no new wallets, seeds, backups, or special addresses — just a one-time setup that takes less than 20 seconds.

## The Virtual Network Approach

Instead of depending on wallets to implement new privacy features or requiring users to migrate to new wallets, Nullmask integrates seamlessly into any existing multichain wallet as a new **virtual network**.

This network is not a real network like Arbitrum; it is a mechanism that inserts a custom RPC proxy service between a wallet and a full RPC node. This proxy shields outgoing transactions and decrypts incoming transactions for wallet accounts. It can run either on a remote server or in the background on a user's device (mobile app, browser extension).

## Why Nullmask?

Current privacy solutions require users to:

* Install dedicated wallets with new seed phrases (Railgun, Zcash)
* Manage per-deposit note secrets (Tornado Cash)
* Re-enter seed phrases on every visit (Privacy Pools)

Nullmask eliminates all of these requirements. Users simply add the Nullmask virtual network to their existing wallet and transact as usual. The protocol handles everything else transparently.

## How is this possible?

Nullmask leverages recent breakthroughs in zk-SNARKs. Specifically, the UltraHonk prover enables proving the integrity of an EIP-1559 transaction and verifying its ECDSA signature on a consumer-grade device in approximately two seconds.

This means:

1. The user signs a standard EIP-1559 transaction in their wallet
2. The proxy intercepts the signed transaction
3. A ZK circuit proves the transaction is valid without revealing its contents
4. A relayer submits the proof on-chain, hiding the sender's identity
5. The smart contract verifies the proof and updates the privacy pool

The spending authority **never leaves the wallet**, making Nullmask more resilient to phishing attacks and fully compatible with hardware wallets.
