# Shielded Withdrawal

## Function Signature

```solidity
function shieldedWithdrawal(
    ShieldedWithdrawalParams calldata params,
    bytes calldata proof
) external nonReentrant
```

## Parameters Struct

```solidity
struct ShieldedWithdrawalParams {
    bytes32[6] noteNullifiers;           // Spent note nullifiers
    bytes32 txNullifier;                 // Transaction nullifier
    bytes32 root;                        // Note Merkle tree root
    bytes32 noteChangeCommitment;        // Sender's change note
    bytes32 noteFeeChangeCommitment;     // Sender's fee change note
    bytes32 value;                       // Withdrawal amount (public)
    bytes32 recipientAddress;            // Destination address (public)
    bytes32 coinId;                      // Token address (public)
    bytes32[9] ciphertextChange;         // Encrypted change note
    bytes32[9] ciphertextFeeChange;      // Encrypted fee change note
    GasFee gasFee;                       // Gas parameters
    bytes32 nullifiersHash;              // Hash of all 6 nullifiers
    bytes32 fee;                         // Relayer fee amount
    bytes32 feeTokenAddress;             // Fee token address
}
```

## Execution Steps

1. **Check transaction nullifier** is unused
2. **Check Merkle root** is valid
3. **Build public inputs** array (38 elements: VIRTUAL\_CHAIN\_ID + 37 params)
4. **Validate public inputs** are in field
5. **Verify ZK proof** via `ShieldedWithdrawalVerifier.verify()`
6. **Spend note nullifiers**
7. **Record transaction nullifier**
8. **Add 2 change note commitments** to the Merkle tree
9. **Pay relayer fee** to `msg.sender`
10. **Transfer withdrawal amount** to the recipient address:
    * ETH: via low-level `call{value: amount}("")`
    * ERC-20: via `safeTransfer`
11. **Emit `ShieldedWithdrawal` event**

## Key Difference from Transfer

The withdrawal does **not** check the key registry root — the recipient is an external address, not a shielded pool participant. The withdrawal value, recipient, and token are public on-chain, enabling the contract to execute the actual fund transfer.
