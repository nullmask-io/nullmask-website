# Overview

Nullmask uses [Noir](https://noir-lang.org/) zero-knowledge circuits compiled to UltraHonk proofs via the [Barretenberg](https://github.com/AztecProtocol/barretenberg) prover. Each shielded action has its own circuit that verifies the correctness of the operation.

## Circuit Types

| Circuit               | Purpose                                | Public Inputs | Gates  |
| --------------------- | -------------------------------------- | ------------- | ------ |
| `shielded_transfer`   | Private transfer between addresses     | 45            | \~115K |
| `shielded_withdrawal` | Withdraw from pool to external address | 37            | \~107K |
| `shielded_swap`       | Uniswap V2 swap within the pool        | 50            | \~138K |
| `receiving_key`       | Derive receiving key from signature    | —             | \~61K  |

## Directory Structure

```
circuits/
├── lib/                          # Core cryptographic library
│   └── src/
│       ├── shielding.nr          # Shielded action core logic
│       ├── note.nr               # Note structure, commitment, encryption
│       ├── keys.nr               # Key derivation (ViewingKey, ReceivingKey)
│       ├── merkle.nr             # LeanIMT verification
│       ├── hash.nr               # Poseidon2 hashing
│       ├── rlp.nr                # EIP-1559 RLP encoding/decoding
│       └── fixtures.nr           # Test fixtures
├── shielded_transfer/            # Transfer circuit
├── shielded_withdrawal/          # Withdrawal circuit (named "withdrawal")
├── shielded_swap/                # Swap circuit
├── receiving_key/                # Key derivation circuit
└── benchmarks/                   # Constraint analysis circuits
```

## Build Process

Each circuit's `build.sh` generates:

1. `target/[circuit].json` — Compiled circuit artifact
2. `target/vk` — Verification key
3. `target/[Circuit]Verifier.sol` — Solidity verifier contract

The master build script `build-circuits.sh` compiles all circuits and generates:

* Solidity verifiers (symlinked into `contracts/contracts/`)
* TypeScript FFI bindings (`noir_ffi.ts`)

```bash
# Build everything
./build-circuits.sh

# Run library tests
cd lib && nargo test

# Analyze constraint counts
./analyze.sh
```

## Toolchain Requirements

| Tool                     | Version                   |
| ------------------------ | ------------------------- |
| Nargo (Noir compiler)    | >= 1.0.0-beta.18          |
| bb (Barretenberg prover) | >= 3.0.0-nightly.20260102 |

## Circuit Dependencies

All circuits depend on the shared library:

```toml
[dependencies]
nullmask = { path = "../lib" }
```

Circuits use `type = "bin"` in their `Nargo.toml`.
