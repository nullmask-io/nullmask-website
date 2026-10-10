# Shielded Transfers

A shielded transfer sends tokens privately from one address to another within the Nullmask privacy pool. The recipient must have a registered receiving key.

## How It Works

1. The user signs a standard EIP-1559 transfer to a registered address
2. The proxy detects that the recipient has a receiving key in the registry
3. The proxy selects funding notes and generates a transfer proof
4. The contract verifies the proof, spends input notes, and creates 3 new notes

## Circuit Verification

The shielded transfer circuit verifies all of the following:

| #  | Verification                                   | Purpose                         |
| -- | ---------------------------------------------- | ------------------------------- |
| 1  | Transaction nullifier                          | Prevents replay attacks         |
| 2  | Commitments of all funding notes               | Proves note existence           |
| 3  | Merkle tree paths of all funding notes         | Proves notes are in the tree    |
| 4  | Nullifiers of all funding notes                | Enables double-spend prevention |
| 5  | Balance equation (input ≥ output + fee)        | Prevents value creation         |
| 6  | RLP deserialization of the virtual transaction | Parses the signed transaction   |
| 7  | ECDSA signature of the virtual transaction     | Proves user authorization       |
| 8  | Sender matches shielded action sender          | Links signature to action       |
| 9  | Recipient matches shielded action recipient    | Prevents recipient substitution |
| 10 | Gas fee matches the transaction                | Prevents fee manipulation       |
| 11 | Change note correctness                        | Ensures correct change          |
| 12 | Recipient key in Key Registry (Merkle proof)   | Verifies recipient registration |
| 13 | Output note encryption                         | Prevents unspendable notes      |

## Public Inputs (45 fields)

```rust
ShieldedTransfer {
    noteNullifiers: [Field; 6],          // 6 — spent note nullifiers
    txNullifier: Field,                  // 1 — transaction nullifier
    root: Field,                         // 1 — Merkle tree root
    rkRoot: Field,                       // 1 — Key registry root
    noteOutCommitment: Field,            // 1 — recipient's note commitment
    noteChangeCommitment: Field,         // 1 — sender's change note
    noteFeeChangeCommitment: Field,      // 1 — sender's fee change note
    ciphertextOut: [Field; 9],           // 9 — encrypted recipient note
    ciphertextChange: [Field; 9],        // 9 — encrypted change note
    ciphertextFeeChange: [Field; 9],     // 9 — encrypted fee change note
    gasFee: GasFee,                      // 3 — gas parameters
    nullifiersHash: Field,               // 1 — hash of all 6 nullifiers
    fee: Field,                          // 1 — relayer fee amount
    feeTokenAddress: Field,              // 1 — fee token address
}
// Total: 6 + 1 + 1 + 1 + 1 + 1 + 1 + 9 + 9 + 9 + 3 + 1 + 1 + 1 = 45
```

## Output Notes

A shielded transfer produces 3 new notes:

1. **Output note** — For the recipient, containing the transferred value
2. **Change note** — For the sender, containing leftover action-asset value
3. **Fee change note** — For the sender, containing leftover fee-asset value

If the action asset and fee asset are the same token, one of the change notes may have zero value.

## On-Chain Execution

After proof verification, the contract:

1. Spends the input note nullifiers
2. Records the transaction nullifier
3. Adds 3 note commitments to the Merkle tree
4. Pays the relayer fee from the fee allocation
