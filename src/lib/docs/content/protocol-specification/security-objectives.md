# Security Objectives

## Privacy Objective

All incoming and outgoing account transfers are completely private. No external observer can decrypt the fields of shielded transactions. Only the proxy that has access to the account's viewing key can inspect the account's transaction history.

Specifically:

* **Sender privacy** — Transaction sender always stays hidden
* **Recipient privacy** — Transaction recipient always stays hidden except for protocol withdrawals, which go to a public 0x address
* **Amount and token privacy** — Transaction token and amount stay private for shielded transfers (token and amount are visible for shielded swaps and withdrawals)

## Security Objective

Every shielded action must be authorized by an in-wallet-confirmed (signed) virtual transaction. Even a malicious actor with access to the account's Viewing Key and transaction history cannot initiate shielded actions or manipulate users' funds.

This is achieved through:

1. **ECDSA signature verification in-circuit** — The ZK proof includes verification of the user's EIP-1559 transaction signature
2. **Transaction nullifiers** — Each signed transaction produces a unique nullifier that prevents replay
3. **Note encryption verification** — The circuit verifies that output notes are correctly encrypted, preventing the proxy from producing unspendable notes

## Challenges and Solutions

| Challenge                                                                  | Solution                                                                                                                                       |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| The circuit that validates an Ethereum transaction has enormous complexity | Using the most advanced zk-SNARK prover (UltraHonk via Barretenberg)                                                                           |
| The proxy can replay virtual transactions                                  | Transaction nullifiers derived from (chainId, nonce, nullifying key) — see [Shielded Transfers](/docs/protocol-specification/shielded-transfers) |
| The proxy can produce unspendable notes                                    | Custom zk-verifiable note encryption scheme — see [Note Encryption](/docs/protocol-specification/note-encryption)                                |
| The proxy can tamper with the 0x-to-zk address translation                 | On-chain verifiable key registry with Merkle proof verification                                                                                |

## Trust Model

### What the user trusts

* **Wallet** — Standard trust in the wallet's key management
* **ZK circuit correctness** — The Noir circuits are open-source and auditable
* **Smart contract correctness** — The Solidity contracts are open-source and auditable

### What the user does NOT need to trust

* **Proxy (for security)** — A malicious proxy cannot steal funds; it can only observe transactions (in remote mode)
* **Relayer** — The relayer sees only opaque proofs and public inputs
* **Guard** — The guard can only approve/reject deposits; it cannot access shielded funds
