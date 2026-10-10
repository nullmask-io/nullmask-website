# Cryptographic Primitives

## Poseidon2 T4

Nullmask uses the Poseidon2 hash function with state width 4 (T4) throughout the protocol. Poseidon2 is a zk-SNARK-friendly hash function designed for minimal constraint count in arithmetic circuits.

### Properties

* **State width**: 4 field elements
* **Rate**: 3 field elements per permutation
* **Output**: 1 field element (extracted from state\[0])
* **Field**: BN254 scalar field

### Usage

| Context               | Hash Input                                          | Purpose                            |
| --------------------- | --------------------------------------------------- | ---------------------------------- |
| Key derivation        | `(seed, discriminator)`                             | Derive nk, ivk, ovk from signature |
| Note commitment       | `(rk_hash, trapdoor)`, `(value, coin_id, trapdoor)` | Create note commitments            |
| Note nullifier        | `(commitment, nk)`                                  | Derive spend nullifiers            |
| Transaction nullifier | `(nk, nonce*2^32 + chainId, pk_hash)`               | Prevent replay                     |
| Nullifiers hash       | `(nf1, nf2, nf3, nf4, nf5, nf6)`                    | Bind notes to actions              |
| Merkle tree           | `(left, right)`                                     | LeanIMT node hashing               |
| Encryption mask       | `(shared_secret, counter)`                          | Note encryption                    |
| Receiving key hash    | `(part1, part2, part3, pnk, ek.x, ek.y)`            | Key identity                       |

### Implementations

* **Noir**: `circuits/lib/src/hash.nr` — Generic N-input hasher
* **Solidity**: `Poseidon2T4Unrolled.sol` — Gas-optimized Yul implementation
* **TypeScript**: `@zkpassport/poseidon2` — JS library for off-chain computation

All three implementations produce identical outputs for identical inputs.

## LeanIMT (Lean Incremental Merkle Tree)

The Nullmask contract uses a Lean Incremental Merkle Tree for storing note commitments and receiving key hashes.

### Properties

* **Maximum depth**: 16 (supports up to 65,536 leaves)
* **Hash function**: Poseidon2 T4
* **Root history**: Circular buffer of 64 historical roots

### How It Differs from Standard Merkle Trees

In a standard Merkle tree, missing nodes are filled with a "zero hash" value. In a LeanIMT:

* When a node has no right sibling, the parent equals the left child (no dummy hash needed)
* The tree depth grows dynamically as leaves are added
* Proof length equals the current tree depth (not the maximum depth)

### Root Verification

The contract maintains a circular buffer of the last 64 Merkle roots. When a shielded action is submitted, the proof includes a root that must match one of these historical roots. This allows transactions to be valid even if new notes were added between proof generation and submission.

## Grumpkin

Nullmask uses the Grumpkin embedded curve for elliptic curve operations within ZK circuits. Grumpkin's base field equals the BN254 scalar field, meaning all curve point coordinates are native field elements — making in-circuit EC operations efficient.

### Usage

* **Key derivation**: $$\mathtt{ek} = \mathtt{ivk} \cdot \mathsf{G}$$ (fixed-base scalar multiplication)
* **Note encryption**: $$\mathtt{dhek} = \mathtt{epk} \cdot \mathsf{G}$$ and $$\mathtt{shared} = \mathtt{epk} \cdot \mathtt{ek}$$ (Diffie-Hellman key exchange)

### Why Grumpkin?

Grumpkin is the embedded curve used by Barretenberg. Its base field is the BN254 scalar field, so all coordinates are native circuit field elements — no expensive non-native arithmetic is needed.

## secp256k1 ECDSA

Standard Ethereum transaction signatures are verified inside the ZK circuit.

### Usage

* **Transaction authorization**: The circuit verifies the ECDSA signature of the EIP-1559 transaction
* **Key recovery**: The sender's public key is recovered from the signature
* **Address derivation**: The Ethereum address is derived from the public key via `keccak256(pk)[12:]`

### Constraint Cost

ECDSA verification is the most expensive operation in the circuit (\~42,000 gates). The UltraHonk prover handles this efficiently, enabling proof generation in \~2 seconds on consumer hardware.

## UltraHonk

Nullmask uses the UltraHonk proof system (via the Barretenberg prover) for generating and verifying ZK proofs.

### Properties

* **Proof system**: UltraPlonk/UltraHonk
* **Prover**: Barretenberg (`bb`)
* **Verification**: On-chain Solidity verifiers (generated from circuit compilation)
* **Proving time**: \~2 seconds on consumer hardware for transfer circuits

### Proof Verification

On-chain verification is performed by generated Solidity verifier contracts. Each circuit type (transfer, withdrawal, swap) has its own verifier. The verifier interface is:

```solidity
function verify(bytes calldata _proof, bytes32[] calldata _publicInputs)
    external view returns (bool);
```
