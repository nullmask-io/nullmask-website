# Shielded Withdrawal Circuit

The withdrawal circuit verifies a withdrawal from the Nullmask pool to an external Ethereum address.

## Entry Point

```noir
fn main(
    notes: [SpendableNote; 6],
    tx: EIP1559Transaction<68>,              // TRANSFER_MAX_DATA_SIZE
    viewing_key: ViewingKey,
    sender_rk: ReceivingKey,
    fee: u128,
    fee_asset: Field,
    randomness: [Field; 6],
    virtual_chain_id: pub u128,
) -> pub ShieldedWithdrawal                  // 37 public outputs
```

## Key Differences from Transfer

| Aspect                 | Transfer                                   | Withdrawal                |
| ---------------------- | ------------------------------------------ | ------------------------- |
| Recipient registration | Required                                   | Not required              |
| Recipient key input    | `RegisteredReceivingKey` with Merkle proof | None                      |
| Output notes           | 3 (out + change + fee change)              | 2 (change + fee change)   |
| Recipient address      | Hidden in commitment                       | Public output             |
| Value                  | Hidden in commitment                       | Public output             |
| Randomness             | 9 fields                                   | 6 fields (no output note) |
| Public outputs         | 45 fields                                  | 37 fields                 |

## Private Inputs

| Input         | Description                                         |
| ------------- | --------------------------------------------------- |
| `notes`       | 6 funding notes with Merkle proofs                  |
| `tx`          | Signed EIP-1559 transaction                         |
| `viewing_key` | Sender's viewing key                                |
| `sender_rk`   | Sender's receiving key                              |
| `fee`         | Relayer fee amount                                  |
| `fee_asset`   | Fee token address                                   |
| `randomness`  | 6 random field elements (all for core/change notes) |

## Public Outputs (37 fields)

* 6 note nullifiers
* Transaction nullifier
* Note tree root
* 2 note commitments (change, fee change)
* Value, recipient address, coin\_id (public — enables on-chain transfer)
* 2 encrypted note ciphertexts (18 fields)
* Gas fee parameters (3 fields)
* Nullifiers hash, fee amount, fee token address

## Verification Steps

1. **Signature verification** — Same as transfer
2. **Transaction parsing** — Extract recipient, value, token
3. **Note spending** — Same as transfer (6-note array)
4. **Balance check** — Input ≥ withdrawal value + fee
5. **Change notes** — Create and encrypt for sender
6. **Public outputs** — Expose recipient address, value, and coin\_id

No key registry verification is performed.

## Constraint Count

| Metric       | Count     |
| ------------ | --------- |
| ACIR Opcodes | 8,435     |
| Gates        | \~107,358 |
