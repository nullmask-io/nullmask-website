# Shielded Withdrawals

A shielded withdrawal moves funds from the Nullmask privacy pool to any external Ethereum address. Unlike shielded transfers, the recipient does not need a registered receiving key.

## How It Works

1. The user signs a standard EIP-1559 transfer to an unregistered address
2. The proxy detects that the recipient has no receiving key in the registry
3. The proxy selects funding notes and generates a withdrawal proof
4. The contract verifies the proof and sends funds directly to the recipient address

The withdrawal makes the recipient address, value, and token type **public** — these must be visible for the contract to execute the actual fund transfer.

## Circuit Verification

The shielded withdrawal circuit verifies the same checks as a transfer (signature, note spending, balance equation), with two differences:

* No key registry Merkle proof (the recipient is an external address)
* No output note encryption (funds leave the pool)

## Public Inputs (37 fields)

```rust
ShieldedWithdrawal {
    noteNullifiers: [Field; 6],          // 6 — spent note nullifiers
    txNullifier: Field,                  // 1 — transaction nullifier
    root: Field,                         // 1 — Merkle tree root
    noteChangeCommitment: Field,         // 1 — sender's change note
    noteFeeChangeCommitment: Field,      // 1 — sender's fee change note
    value: Field,                        // 1 — withdrawal amount (public)
    recipientAddress: Field,             // 1 — destination address (public)
    coinId: Field,                       // 1 — token address (public)
    ciphertextChange: [Field; 9],        // 9 — encrypted change note
    ciphertextFeeChange: [Field; 9],     // 9 — encrypted fee change note
    gasFee: GasFee,                      // 3 — gas parameters
    nullifiersHash: Field,               // 1 — hash of all 6 nullifiers
    fee: Field,                          // 1 — relayer fee amount
    feeTokenAddress: Field,              // 1 — fee token address
}
// Total: 6 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 9 + 9 + 3 + 1 + 1 + 1 = 37
```

## Output Notes

A shielded withdrawal produces 2 new notes:

1. **Change note** — For the sender, containing leftover action-asset value
2. **Fee change note** — For the sender, containing leftover fee-asset value

Plus a direct transfer of the withdrawal amount to the recipient address.

## On-Chain Execution

After proof verification, the contract:

1. Spends the input note nullifiers
2. Records the transaction nullifier
3. Adds 2 change note commitments to the Merkle tree
4. Pays the relayer fee from the fee allocation
5. Transfers the withdrawal amount to the recipient address (ETH via `call`, ERC-20 via `safeTransfer`)

## Wallet-Only Mode

In wallet-only mode, the proxy automatically determines whether to execute a shielded transfer or withdrawal:

* If the recipient address has a registered receiving key → shielded transfer
* If the recipient address is not registered → shielded withdrawal

This means users cannot withdraw to Nullmask-registered addresses. This is a deliberate design choice that encourages using fresh, unlinkable addresses for withdrawals.
