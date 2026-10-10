# Shielded Swap

## Function Signature

```solidity
function shieldedSwap(
    ShieldedSwapParams calldata params,
    bytes calldata proof
) external nonReentrant
```

## Parameters Struct

```solidity
struct ShieldedSwapParams {
    bytes32[6] noteNullifiers;
    bytes32 txNullifier;
    bytes32 root;
    bytes32 noteChangeCommitment;
    bytes32 noteFeeChangeCommitment;
    bytes32 selector;                    // Uniswap function selector
    SwapRouterArgs routerArgs;
    bytes32 receivingKeyCommitment;      // Owner commitment for output note
    bytes32[9] ciphertextChange;
    bytes32[9] ciphertextFeeChange;
    bytes32[6] ciphertextSwap;           // Half-encrypted swap output
    GasFee gasFee;
    bytes32 nullifiersHash;
    bytes32 fee;
    bytes32 feeTokenAddress;
}

struct SwapRouterArgs {
    bytes32 amountIn;
    bytes32 amountOutMin;
    bytes32[4] path;                     // Token addresses (max 4)
    bytes32 pathLength;
    bytes32 deadline;
}
```

## Execution Steps

1. **Check transaction nullifier** is unused
2. **Check Merkle root** is valid
3. **Build public inputs** (52 elements: VIRTUAL\_CHAIN\_ID + UNISWAP\_V2\_ROUTER + 50 params)
4. **Validate public inputs** and **verify ZK proof**
5. **Spend note nullifiers** and record transaction nullifier
6. **Build swap path** from `routerArgs.path` and `pathLength`
7. **Check output token** is whitelisted
8. **Snapshot balance** before swap
9. **Execute Uniswap V2 swap** (see below)
10. **Measure output** via balance delta
11. **Compute swap output note commitment** using actual output amount
12. **Build full ciphertext** (circuit's 6 fields + value + coinId + 0)
13. **Add 3 note commitments** to Merkle tree (swap output, change, fee change)
14. **Pay relayer fee**
15. **Emit `ShieldedSwap` event**

## Swap Execution

The contract selects the appropriate Uniswap V2 function based on the selector:

| Selector     | Function                   | Fee-on-Transfer Variant                                 |
| ------------ | -------------------------- | ------------------------------------------------------- |
| `0x38ed1739` | `swapExactTokensForTokens` | `swapExactTokensForTokensSupportingFeeOnTransferTokens` |
| `0x7ff36ab5` | `swapExactETHForTokens`    | `swapExactETHForTokensSupportingFeeOnTransferTokens`    |
| `0x18cbafe5` | `swapExactTokensForETH`    | `swapExactTokensForETHSupportingFeeOnTransferTokens`    |

The contract automatically selects the fee-on-transfer variant if any token in the swap path is marked as `ERC20_FEE_ON_TRANSFER` in the whitelist.

For ERC-20 input tokens, the contract approves the Uniswap router to spend `amountIn` using `forceApprove`.

## Output Note Computation

The swap output note commitment is computed on-chain:

```solidity
commitment = _commitNote(
    receivingKeyCommitment,                        // From circuit
    _commitNoteValue(amountOut, outputToken, 0),   // From swap result
    nullifiersHash                                 // From circuit
);
```

The full 9-field ciphertext is assembled from:

* Fields 0-5: Circuit's `ciphertextSwap` (ownership encryption)
* Field 6: `amountOut` (actual swap output)
* Field 7: `outputToken` address
* Field 8: `0` (value\_trapdoor is always 0 for swaps)
