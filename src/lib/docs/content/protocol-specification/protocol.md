# Overview

The Nullmask protocol enables privacy-preserving transactions on EVM chains using zero-knowledge proofs. This section provides the formal cryptographic specification.

## Core Concepts

| Concept                   | Description                                                                                                                                           |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Notes**                 | Private UTXOs — encrypted value containers. Note commitments are stored in an on-chain Merkle tree; encrypted note data is emitted in contract events |
| **Nullifiers**            | Unique spend identifiers that prevent double-spending without revealing which note was spent                                                          |
| **Viewing Key**           | Enables decryption of incoming and outgoing notes; grants view access to transaction history                                                          |
| **Receiving Key**         | Public key registered on-chain that enables others to send shielded funds to an address                                                               |
| **Transaction Nullifier** | Prevents replay of signed transactions by a malicious proxy                                                                                           |

## Cryptographic Stack

| Primitive       | Purpose                                                                         |
| --------------- | ------------------------------------------------------------------------------- |
| Poseidon2 T4    | Hash function for note commitments, nullifiers, key derivation, and Merkle tree |
| LeanIMT         | Incremental Merkle tree for note storage (depth 16, \~65K leaves)               |
| Grumpkin        | Embedded curve for key exchange and encryption                                  |
| secp256k1 ECDSA | Transaction signature verification (standard Ethereum signatures)               |
| UltraHonk       | ZK proof system (Barretenberg prover)                                           |

## Notation

Throughout this specification:

* $$\mathbb{E}$$ denotes the Grumpkin embedded curve
* $$\mathbb{F}$$ denotes the base field of $$\mathbb{E}$$ (scalar field of BN254)
* $$\mathsf{G}$$ denotes the generator point of $$\mathbb{E}$$
* $$\operatorname{Poseidon2T4}(x)$$ denotes the Poseidon2 hash function with state width 4
