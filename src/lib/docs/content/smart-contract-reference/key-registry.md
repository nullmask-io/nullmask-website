# Key Registry

The key registry maps Ethereum addresses to receiving key hashes, stored in an on-chain Merkle tree.

## Registration

```solidity
function registerReceivingKey(ReceivingKey calldata rk) public
```

### Parameters

```solidity
struct ReceivingKey {
    bytes32 pkX;      // secp256k1 public key x-coordinate
    bytes32 pkY;      // secp256k1 public key y-coordinate
    bytes32 keyData;  // Ethereum address (20 bytes) + padding
    bytes32 pnk;      // Public nullifying key (Poseidon2(nk))
    bytes32 ekX;      // Encryption key x-coordinate (Grumpkin)
    bytes32 ekY;      // Encryption key y-coordinate (Grumpkin)
}
```

### Verification Steps

1. Recover the Ethereum address from `(pkX, pkY)` via `keccak256(pkX || pkY)[12:]`
2. Verify `msg.sender` matches the derived address → revert `NotAccountOwner` if mismatch
3. Verify the first 20 bytes of `keyData` match the derived address → revert `KeyDataAddressMismatch` if mismatch
4. Compute the receiving key hash via Poseidon2
5. Store `address → rk_hash` mapping
6. Insert `rk_hash` into the key registry Merkle tree

### Receiving Key Hash Computation

```solidity
function _computeRkHash(ReceivingKey memory rk) internal pure returns (uint256)
```

1. Pack `pkX (32 bytes) || pkY (32 bytes) || keyData[0:29] (29 bytes)` = 93 bytes
2. Split into 3 chunks of 31 bytes each (little-endian packed into field elements)
3. Hash: `Poseidon2(chunk1, chunk2, chunk3, pnk, ekX, ekY)`

This computation is identical in the Noir circuit, enabling cross-verification.

## Key Registry Tree

The key registry uses its own LeanIMT (separate from the note tree). During shielded transfers, the circuit proves the recipient's receiving key is in this tree via a Merkle inclusion proof.

### State Views

```solidity
function keyRegistryRoot() external view returns (uint256)
function keyRegistrySize() external view returns (uint256)
function isKnownKeyRegistryRoot(uint256 _root) public view returns (bool)
function isReceivingKeyRegistered(uint256 _leaf) public view returns (bool)
function hasReceivingKey(address account) external view returns (bool)
```

## Convenience Function

```solidity
function registerReceivingKeyAndDeposit(
    uint256 amount,
    address token,
    ReceivingKey calldata rk
) external payable returns (uint256)
```

Registers the receiving key and performs a deposit in a single transaction, saving gas for new users.
