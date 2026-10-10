# Events

All events emitted by the Nullmask contract.

## Note Events

### NoteAdded

Emitted when a new note commitment is added to the Merkle tree.

```solidity
event NoteAdded(
    uint256 indexed index,        // Position in Merkle tree
    bytes32 noteCommitment,       // Poseidon2 commitment
    bytes32[9] noteCiphertext     // Encrypted note data
);
```

This event is the primary mechanism for note discovery. The proxy's NotesScanner monitors these events and trial-decrypts each ciphertext.

### NoteSpent

Emitted when a note nullifier is recorded (note is spent).

```solidity
event NoteSpent(bytes32 indexed noteNullifier);
```

## Shielded Action Events

### ShieldedTransfer

```solidity
event ShieldedTransfer(
    bytes32 indexed txNullifier,
    bytes32 nullifiersHash,
    bytes32 noteOutCommitment,
    bytes32 noteChangeCommitment,
    bytes32 noteFeeChangeCommitment,
    uint256 fee,
    address feeTokenAddress
);
```

### ShieldedWithdrawal

```solidity
event ShieldedWithdrawal(
    bytes32 indexed txNullifier,
    bytes32 nullifiersHash,
    bytes32 noteChangeCommitment,
    bytes32 noteFeeChangeCommitment,
    address recipientAddress,
    uint256 amount,
    address tokenAddress,
    uint256 fee,
    address feeTokenAddress
);
```

### ShieldedSwap

```solidity
event ShieldedSwap(
    bytes32 indexed txNullifier,
    bytes32 nullifiersHash,
    bytes32 noteOutCommitment,
    bytes32 noteChangeCommitment,
    bytes32 noteFeeChangeCommitment,
    uint256 amountIn,
    address tokenIn,
    uint256 amountOut,
    address tokenOut,
    uint256 fee,
    address feeTokenAddress
);
```

## Deposit Events

### DepositPending

Emitted when a deposit is submitted and awaiting guard approval.

```solidity
event DepositPending(
    uint256 indexed index,
    address indexed recipient,
    address token,
    uint256 amount,
    address depositor,
    uint256 gasEscrow
);
```

### Deposit

Emitted when a deposit is approved by the guard.

```solidity
event Deposit(
    uint256 indexed index,
    address indexed account,
    address token,
    uint256 amount,
    uint256 revocationPublicKeyX,
    uint256 revocationPublicKeyY
);
```

### DepositStatusChanged

Emitted when a deposit's status changes (approved, rejected, or reverted).

```solidity
event DepositStatusChanged(uint256 indexed index, DepositStatus status);
```

## Key Registry Events

### ReceivingKeyRegistered

Emitted when a receiving key is registered on-chain.

```solidity
event ReceivingKeyRegistered(
    address indexed account,
    uint256 indexed index,
    uint256 hash,              // Poseidon2 hash of the receiving key
    bytes32 pkX,
    bytes32 pkY,
    bytes32 keyData,
    bytes32 pnk,
    bytes32 ekX,
    bytes32 ekY
);
```

## Admin Events

### TokenWhitelistUpdated

```solidity
event TokenWhitelistUpdated(address indexed token, TokenType tokenType);
```

### WhitelistManagerUpdated

```solidity
event WhitelistManagerUpdated(address indexed previousManager, address indexed newManager);
```
