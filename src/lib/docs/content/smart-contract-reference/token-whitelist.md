# Token Whitelist

The Nullmask contract maintains a whitelist of supported tokens.

## Token Types

```solidity
enum TokenType {
    NOT_ALLOWED,             // Token cannot be deposited
    NATIVE_TOKEN,            // ETH (address(0))
    ERC20,                   // Standard ERC-20 token
    ERC20_FEE_ON_TRANSFER    // ERC-20 with transfer fees
}
```

## Management Functions

### `setTokenWhitelist(address token, TokenType tokenType)`

Set the whitelist status for a single token. Callable by the whitelist manager or the upgrade controller admin.

### `setTokenWhitelistBatch(address[] tokens, TokenType[] tokenTypes)`

Set whitelist status for multiple tokens in one transaction. Arrays must have matching lengths.

### `setWhitelistManager(address newWhitelistManager)`

Transfer the whitelist manager role. Callable by the current manager or upgrade controller admin.

## Token Type Effects

| Token Type              | Deposits                   | Swaps    | Swap Routing                           |
| ----------------------- | -------------------------- | -------- | -------------------------------------- |
| `NOT_ALLOWED`           | Rejected                   | Rejected | —                                      |
| `NATIVE_TOKEN`          | Allowed                    | Allowed  | Standard Uniswap functions             |
| `ERC20`                 | Allowed                    | Allowed  | Standard Uniswap functions             |
| `ERC20_FEE_ON_TRANSFER` | Allowed (delta-accounting) | Allowed  | SupportingFeeOnTransferTokens variants |

## Fee-on-Transfer Handling

For tokens with transfer fees, the contract:

1. Records the balance before the transfer
2. Executes the transfer
3. Computes the actual received amount as `balanceAfter - balanceBefore`

During swaps, if any token in the path is `ERC20_FEE_ON_TRANSFER`, the contract automatically uses Uniswap's `SupportingFeeOnTransferTokens` variants.

## Events

```solidity
event TokenWhitelistUpdated(address indexed token, TokenType tokenType);
event WhitelistManagerUpdated(address indexed previousManager, address indexed newManager);
```
