---
description: Privacy-preserving DeFi protocol powered by zero-knowledge proofs
---

# Nullmask

Nullmask enables shielded deposits, transfers, withdrawals, and swaps on EVM chains. Users interact with a standard wallet — the protocol intercepts transactions, generates zero-knowledge proofs client-side, and submits them through a relayer to hide the sender's identity.

Funds are held in a UTXO-based privacy pool secured by Poseidon2 commitments and Merkle membership proofs.

## Quick Links

| Section                                                            | Description                                     |
| ------------------------------------------------------------------ | ----------------------------------------------- |
| [What is Nullmask?](/docs/introduction/introduction)                 | High-level introduction to the protocol         |
| [How It Works](/docs/introduction/how-it-works)                      | End-to-end architecture walkthrough             |
| [Protocol Specification](/docs/protocol-specification/protocol)      | Cryptographic details, algorithms, and proofs   |
| [Smart Contract Reference](/docs/smart-contract-reference/contracts) | Solidity API for deposits, transfers, and swaps |
| [RPC API Reference](/docs/rpc-api-reference/rpc)                     | JSON-RPC methods exposed by the proxy           |
| [Developer Guide](/docs/developer-guide/developer)                   | Build and run locally                           |
| [User Guide](/docs/user-guide/guide)                                 | Step-by-step instructions for end users         |

## Key Features

* **Shielded Transfers** — Send tokens privately without revealing sender, recipient, or amount on-chain
* **Shielded Swaps** — Execute Uniswap V2 swaps without exposing user identity
* **Private Deposits & Withdrawals** — Move funds in and out of the shielded pool with ZK-verified proofs
* **Multi-Chain** — Deployed on Ethereum, Arbitrum, MegaETH, Base, and BSC
* **Standard Wallet UX** — No special wallet needed; works with MetaMask and any EIP-1559 compatible wallet
* **Hardware Wallet Support** — Full security without extracting spending authority from the device
* **ERC-20 Support** — Shield any supported ERC-20 token alongside native ETH
* **Built-in Compliance** — Deposit screening with retrospective taint recovery via revocation keys

## Tech Stack

| Layer            | Technology                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| ZK Circuits      | [Noir](https://noir-lang.org/) + [Barretenberg](https://github.com/AztecProtocol/barretenberg) |
| Smart Contracts  | Solidity 0.8.28, Hardhat v3, OpenZeppelin v5                                                   |
| Frontend         | Next.js 15, React 19, TailwindCSS 4                                                            |
| Backend Services | Fastify 5, Node.js 24                                                                          |
| Web3             | Viem, Wagmi                                                                                    |
| Monorepo         | Turborepo, pnpm                                                                                |
| Storage          | LMDB (persistent state)                                                                        |
| Code Quality     | Biome, TypeScript 5.9, knip                                                                    |
