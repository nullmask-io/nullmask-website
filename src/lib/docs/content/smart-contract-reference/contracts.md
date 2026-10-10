# Architecture

The Nullmask smart contract is deployed behind a UUPS proxy for upgradeability.

## Contract Hierarchy

* **`NullmaskProxy`** (`ERC1967Proxy`) — delegates to:
  * **`Nullmask`** (Implementation)
    * Inherits:
      * `State` (storage layout)
      * `Initializable`
      * `UUPSUpgradeable`
      * `ReentrancyGuardTransient`
    * Calls:
      * `ShieldedTransferVerifier`
      * `ShieldedWithdrawalVerifier`
      * `ShieldedSwapVerifier`
    * Uses:
      * `CustomLeanIMT` (Poseidon2 Merkle tree)
      * `Poseidon2T4Unrolled`
    * Governed by:
      * `AdminUpgradeController`

## Key Contracts

### Nullmask.sol

The main privacy pool contract. Handles:

* Deposits (ETH and ERC-20)
* Shielded transfers, withdrawals, and swaps
* Receiving key registration
* Token whitelist management
* ZK proof verification (delegates to verifier contracts)

### NullmaskProxy.sol

ERC1967 proxy wrapper for UUPS upgradeability. Users interact with this address. All calls are delegated to the Nullmask implementation.

### State.sol

Abstract contract defining the storage layout:

* `_noteTree` — Merkle tree for note commitments
* `_keyRegistryTree` — Merkle tree for receiving key hashes
* `pendingDepositHashes` — Hash of pending deposit data
* `noteNullifiers` — Mapping of spent note nullifiers
* `txNullifiers` — Mapping of spent transaction nullifiers
* `tokenWhitelist` — Token type registry
* `guard` — Deposit guard address
* `upgradeController` — Upgrade authorization address
* `__gap[45]` — Reserved storage for future upgrades

### Enums

```solidity
enum DepositStatus {
    REJECTED,
    PENDING,
    ACTION_REQUIRED,
    APPROVED,
    REVERTED
}

enum TokenType {
    NOT_ALLOWED,
    NATIVE_TOKEN,
    ERC20,
    ERC20_FEE_ON_TRANSFER
}
```

### ReceivingKey Struct

```solidity
struct ReceivingKey {
    bytes32 pkX;      // Public key x-coordinate
    bytes32 pkY;      // Public key y-coordinate
    bytes32 keyData;  // Ethereum address (20 bytes) + 9 zero bytes + 3 padding
    bytes32 pnk;      // Public nullifying key hash
    bytes32 ekX;      // Encryption key x-coordinate
    bytes32 ekY;      // Encryption key y-coordinate
}
```

## Immutables

Set in the constructor (vary per deployment):

| Immutable           | Description                             |
| ------------------- | --------------------------------------- |
| `VIRTUAL_CHAIN_ID`  | Virtual chain ID for this deployment    |
| `UNISWAP_V2_ROUTER` | Uniswap V2 Router address on this chain |

## UUPS Upgradeability

The upgrade permission mechanism is itself upgradeable via `setUpgradeController()`:

1. **Current**: `AdminUpgradeController` — single admin (deployer)
2. **Future**: Can migrate to timelock, multisig, or DAO governance

Only the current `upgradeController` contract can call `setUpgradeController()`.

## Public Input Validation

All public inputs are validated to be within the BN254 scalar field:

```solidity
uint256 private constant FIELD_MODULUS =
    21888242871839275222246405745257275088548364400416034343698204186575808495617;
```

Any input ≥ `FIELD_MODULUS` causes the transaction to revert with `PublicInputNotInField()`.

## State Views

```solidity
function noteTreeRoot() external view returns (uint256)
function noteTreeSize() external view returns (uint256)
function noteTreeDepth() external view returns (uint256)
function noteTreeRoots(uint256 _index) external view returns (uint256)
function noteTreeRootIndex() external view returns (uint32)
function isKnownNoteTreeRoot(uint256 _root) public view returns (bool)
function isNoteInTree(uint256 _leaf) public view returns (bool)
function keyRegistryRoot() external view returns (uint256)
function keyRegistrySize() external view returns (uint256)
function isKnownKeyRegistryRoot(uint256 _root) public view returns (bool)
function isReceivingKeyRegistered(uint256 _leaf) public view returns (bool)
function hasReceivingKey(address account) external view returns (bool)
function ROOT_HISTORY_SIZE() external pure returns (uint32)
function MAX_TREE_DEPTH() external pure returns (uint32)
```

## Admin Functions

```solidity
function setGuard(address newGuard) external
function setUpgradeController(address newController) external
function setVerifiers(address _transfer, address _withdrawal, address _swap) external
function setWhitelistManager(address newWhitelistManager) external
```

`setGuard` is callable by the current guard or the upgrade controller admin. `setUpgradeController` is callable only by the current upgrade controller. `setVerifiers` requires upgrade controller authorization.
