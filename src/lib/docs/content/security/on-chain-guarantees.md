# On-Chain Guarantees

The Nullmask smart contract provides the following security guarantees regardless of the behavior of off-chain components.

## Proof Verification

Every shielded action (transfer, withdrawal, swap) requires a valid ZK proof verified by an on-chain verifier contract. The proof cannot be forged without breaking the UltraHonk proof system.

```solidity
if (!IVerifier(verifier).verify(proof, publicInputs)) revert InvalidProof();
```

## Nullifier Uniqueness

### Note Nullifiers

Each note can only be spent once. The contract maintains a permanent record of all spent nullifiers:

```solidity
mapping(uint256 => bool) public noteNullifiers;
```

Attempting to spend a note whose nullifier is already recorded reverts with `NullifierAlreadySpent()`.

### Transaction Nullifiers

Each signed transaction can only be used once:

```solidity
mapping(bytes32 => bool) public txNullifiers;
```

Attempting to replay a transaction reverts with `TxNullifierAlreadyUsed()`.

## Merkle Root Validity

The proof's Merkle root must match one of the last 64 historical roots:

```solidity
if (!isKnownNoteTreeRoot(uint256(params.root))) revert InvalidNoteTreeRoot(params.root);
```

This prevents proofs from using fabricated Merkle trees while allowing a window for concurrent transactions.

## Field Modulus Validation

All public inputs are validated to be within the BN254 scalar field:

```solidity
uint256 private constant FIELD_MODULUS =
    21888242871839275222246405745257275088548364400416034343698204186575808495617;

for (uint256 i = 0; i < inputs.length; i++) {
    if (uint256(inputs[i]) >= FIELD_MODULUS) revert PublicInputNotInField();
}
```

This prevents arithmetic overflow attacks in the proof verification.

## Reentrancy Protection

All state-mutating functions use OpenZeppelin's `ReentrancyGuardTransient`:

```solidity
function shieldedTransfer(...) external nonReentrant { ... }
function shieldedWithdrawal(...) external nonReentrant { ... }
function shieldedSwap(...) external nonReentrant { ... }
function depositTo(...) public payable nonReentrant { ... }
function approveDeposit(...) external nonReentrant { ... }
```

## Deposit Data Integrity

Pending deposits store a hash of the deposit parameters. The guard must provide matching parameters when approving or rejecting:

```solidity
if (storedHash != _computeDepositHash(recipient, token, amount, depositor, gasEscrow)) {
    revert InvalidDepositData();
}
```

This prevents the guard from modifying deposit parameters during approval.

## Upgrade Safety

* UUPS proxy pattern with `_authorizeUpgrade()` hook
* Upgrade authorization delegated to `IUpgradeController`
* Storage gap (`__gap[45]`) reserved for future state variables
* Controller change restricted to current controller only
