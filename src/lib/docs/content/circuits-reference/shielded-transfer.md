# Shielded Transfer Circuit

The transfer circuit verifies a private token transfer between two addresses within the Nullmask pool.

## Entry Point

```noir
fn main(
    notes: [SpendableNote; 6],
    tx: EIP1559Transaction<68>,              // TRANSFER_MAX_DATA_SIZE
    viewing_key: ViewingKey,
    sender_rk: ReceivingKey,
    recipient_rk: RegisteredReceivingKey,    // With Merkle proof
    fee: u128,
    fee_asset: Field,
    randomness: [Field; 9],
    virtual_chain_id: pub u128,              // Public input
) -> pub ShieldedTransfer                    // 45 public outputs
```

## Private Inputs

| Input          | Description                                           |
| -------------- | ----------------------------------------------------- |
| `notes`        | 6 funding notes with Merkle proofs                    |
| `tx`           | Signed EIP-1559 transaction (68 bytes data max)       |
| `viewing_key`  | Sender's viewing key (nk, dk, ovk)                    |
| `sender_rk`    | Sender's receiving key                                |
| `recipient_rk` | Recipient's receiving key + key registry Merkle proof |
| `fee`          | Relayer fee amount                                    |
| `fee_asset`    | Fee token address                                     |
| `randomness`   | 9 random field elements for note creation             |

## Public Inputs

| Input              | Description      |
| ------------------ | ---------------- |
| `virtual_chain_id` | Chain identifier |

## Public Outputs (45 fields)

The circuit returns a `ShieldedTransfer` struct containing all public outputs that the smart contract verifies:

* 6 note nullifiers
* Transaction nullifier
* Note tree root + key registry root
* 3 note commitments (output, change, fee change)
* 3 encrypted note ciphertexts (9 fields each = 27)
* Gas fee parameters (3 fields)
* Nullifiers hash, fee amount, fee token address

## Randomness Allocation

| Indices  | Purpose                                                         |
| -------- | --------------------------------------------------------------- |
| `[0..5]` | Core action (change notes: rk\_trapdoor, vc\_trapdoor for each) |
| `[6..8]` | Output note (epk, rk\_trapdoor, vc\_trapdoor)                   |

All trapdoors must be nonzero (enforced by constraint).

## Verification Steps

1. **Signature verification** — RLP-encode the transaction, verify ECDSA signature against sender's public key
2. **Transaction parsing** — Extract recipient address, value, and token from the transaction data
3. **Note spending** — For each of the 6 notes: verify Merkle membership, compute nullifier, check ownership
4. **Balance check** — Input notes ≥ output value + fee (combined or separate asset pools)
5. **Key registry check** — Verify recipient's receiving key is in the key registry Merkle tree
6. **Address matching** — Verify transaction recipient matches the key registry entry's address
7. **Output note** — Create commitment and encrypt for recipient
8. **Change notes** — Create commitments and encrypt for sender
9. **Nullifiers hash** — Hash all 6 nullifiers together

## Constraint Count

| Metric       | Count     |
| ------------ | --------- |
| ACIR Opcodes | 9,507     |
| Gates        | \~115,254 |
