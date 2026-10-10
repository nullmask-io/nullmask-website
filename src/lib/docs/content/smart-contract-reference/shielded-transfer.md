# Shielded Transfer

## Function Signature

```solidity
function shieldedTransfer(
    ShieldedTransferParams calldata params,
    bytes calldata proof
) external nonReentrant
```

## Parameters Struct

```solidity
struct ShieldedTransferParams {
    bytes32[6] noteNullifiers;           // Spent note nullifiers
    bytes32 txNullifier;                 // Transaction nullifier (replay prevention)
    bytes32 root;                        // Note Merkle tree root
    bytes32 rkRoot;                      // Key registry Merkle tree root
    bytes32 noteOutCommitment;           // Recipient's note commitment
    bytes32 noteChangeCommitment;        // Sender's change note
    bytes32 noteFeeChangeCommitment;     // Sender's fee change note
    bytes32[9] ciphertextOut;            // Encrypted recipient note
    bytes32[9] ciphertextChange;         // Encrypted change note
    bytes32[9] ciphertextFeeChange;      // Encrypted fee change note
    GasFee gasFee;                       // Gas parameters
    bytes32 nullifiersHash;              // Hash of all 6 nullifiers
    bytes32 fee;                         // Relayer fee amount
    bytes32 feeTokenAddress;             // Fee token address
}

struct GasFee {
    bytes32 maxPriorityFeePerGas;
    bytes32 maxFeePerGas;
    bytes32 gasLimit;
}
```

## Execution Steps

1. **Check transaction nullifier** is unused → revert `TxNullifierAlreadyUsed` if spent
2. **Check Merkle root** is valid (in root history) → revert `InvalidNoteTreeRoot` if unknown
3. **Check key registry root** is valid → revert `InvalidKeyRegistryRoot` if unknown
4. **Build public inputs** array (46 elements: VIRTUAL\_CHAIN\_ID + 45 params)
5. **Validate all public inputs** are within the BN254 field
6. **Verify ZK proof** via `ShieldedTransferVerifier.verify()` → revert `InvalidProof` if invalid
7. **Spend note nullifiers** (skip zeros from dummy notes)
8. **Record transaction nullifier**
9. **Add 3 note commitments** to the Merkle tree (out, change, fee change)
10. **Pay relayer fee** (transfer fee token to `msg.sender`)
11. **Emit `ShieldedTransfer` event**

## Public Inputs Layout

The contract builds the public inputs array using `calldatacopy`:

```
publicInputs[0]  = VIRTUAL_CHAIN_ID    // Set by contract
publicInputs[1..45] = params fields    // Copied from calldata (45 * 32 bytes)
```

This efficient approach avoids ABI decoding overhead for all 45 fields.

## Output Notes

| Note       | Commitment Field          | Ciphertext Field      | Recipient             |
| ---------- | ------------------------- | --------------------- | --------------------- |
| Output     | `noteOutCommitment`       | `ciphertextOut`       | Transfer recipient    |
| Change     | `noteChangeCommitment`    | `ciphertextChange`    | Sender (action asset) |
| Fee Change | `noteFeeChangeCommitment` | `ciphertextFeeChange` | Sender (fee asset)    |
