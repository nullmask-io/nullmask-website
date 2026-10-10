# Errors

All custom errors defined in the Nullmask contract.

## Authentication Errors

| Error                                               | Description                                                                 |
| --------------------------------------------------- | --------------------------------------------------------------------------- |
| `NotAccountOwner(address caller, address expected)` | Receiving key registration: `msg.sender` does not match the derived address |
| `NotGuard(address caller)`                          | Caller is not the deposit guard                                             |
| `NotWhitelistManager(address caller)`               | Caller is not the whitelist manager                                         |
| `NotUpgradeController(address caller)`              | Caller is not the upgrade controller                                        |
| `NotDepositor(address caller)`                      | Caller is not the original depositor (for pending deposit withdrawal)       |
| `UpgradeNotAuthorized(address caller)`              | Upgrade controller rejected the upgrade                                     |

## Nullifier Errors

| Error                                       | Description                                                       |
| ------------------------------------------- | ----------------------------------------------------------------- |
| `NullifierAlreadySpent()`                   | A note nullifier has already been recorded (double-spend attempt) |
| `TxNullifierAlreadyUsed(bytes32 nullifier)` | A transaction nullifier has already been used (replay attempt)    |

## Validation Errors

| Error                                                                    | Description                                              |
| ------------------------------------------------------------------------ | -------------------------------------------------------- |
| `InvalidNoteTreeRoot(bytes32 root)`                                      | The provided Merkle root is not in the root history      |
| `InvalidKeyRegistryRoot(bytes32 root)`                                   | The provided key registry root is not valid              |
| `InvalidProof()`                                                         | The ZK proof verification failed                         |
| `InvalidDepositData()`                                                   | The provided deposit data does not match the stored hash |
| `InvalidReceivingKey()`                                                  | A receiving key field is outside the BN254 scalar field  |
| `InvalidSwapSelector()`                                                  | The swap function selector is not recognized             |
| `PublicInputNotInField()`                                                | A public input is ≥ the BN254 field modulus              |
| `KeyDataAddressMismatch(address keyDataAddress, address derivedAddress)` | The address in keyData does not match the public key     |

## State Errors

| Error                                | Description                                                |
| ------------------------------------ | ---------------------------------------------------------- |
| `ZeroAddress()`                      | A required address parameter is the zero address           |
| `DepositNotPending(uint256 index)`   | The deposit at this index is not in pending state          |
| `InsufficientValue()`                | `msg.value` is less than the deposit amount                |
| `TokenNotWhitelisted(address token)` | The token is not in the whitelist                          |
| `LengthMismatch()`                   | Array parameters have different lengths (batch operations) |

## Transfer Errors

| Error                                                  | Description                                             |
| ------------------------------------------------------ | ------------------------------------------------------- |
| `ETHTransferFailed(address recipient, uint256 amount)` | ETH transfer via `call` failed                          |
| `ReceivingKeyNotFound(address account)`                | The recipient has no registered receiving key (deposit) |
