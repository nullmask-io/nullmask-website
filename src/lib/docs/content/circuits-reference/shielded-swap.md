# Shielded Swap Circuit

The swap circuit verifies a Uniswap V2 swap within the Nullmask privacy pool.

## Entry Point

```noir
fn main(
    notes: [SpendableNote; 6],
    tx: EIP1559Transaction<324>,             // SWAP_MAX_DATA_SIZE
    viewing_key: ViewingKey,
    sender_rk: ReceivingKey,
    fee: u128,
    fee_asset: Field,
    randomness: [Field; 8],
    virtual_chain_id: pub u128,
    uniswap_v2_router_address: pub Field,    // Additional public input
) -> pub ShieldedSwap                        // 50 public outputs
```

## Key Differences from Transfer/Withdrawal

| Aspect                | Transfer                   | Swap                           |
| --------------------- | -------------------------- | ------------------------------ |
| Transaction data size | 68 bytes                   | 324 bytes                      |
| RLP buffer size       | 143 bytes                  | 401 bytes                      |
| Public inputs         | 1 (chain\_id)              | 2 (chain\_id + router address) |
| Public outputs        | 45                         | 50                             |
| Output note           | Fully encrypted (9 fields) | Half-encrypted (6 fields)      |
| Randomness            | 9 fields                   | 8 fields                       |

## Private Inputs

| Input         | Description                                         |
| ------------- | --------------------------------------------------- |
| `notes`       | 6 funding notes with Merkle proofs                  |
| `tx`          | Signed EIP-1559 transaction (324 bytes data max)    |
| `viewing_key` | Sender's viewing key                                |
| `sender_rk`   | Sender's receiving key                              |
| `fee`         | Relayer fee amount                                  |
| `fee_asset`   | Fee token address                                   |
| `randomness`  | 8 random fields (\[0..5] core, \[6..7] swap output) |

## Public Inputs

| Input                       | Description                        |
| --------------------------- | ---------------------------------- |
| `virtual_chain_id`          | Chain identifier                   |
| `uniswap_v2_router_address` | Uniswap V2 router contract address |

## Public Outputs (50 fields)

* 6 note nullifiers
* Transaction nullifier, root
* 2 change note commitments
* Swap selector, router args (7 fields)
* Receiving key commitment
* 2 change ciphertexts (18 fields), swap half-ciphertext (6 fields)
* Gas fee (3 fields)
* Nullifiers hash, fee, fee token

## Swap-Specific Logic

### Transaction Parsing

The circuit parses the full Uniswap V2 router call data (up to 324 bytes):

* Function selector (4 bytes)
* `amountIn`, `amountOutMin`
* Token path (up to 4 addresses)
* Deadline
* Recipient address

### Recipient Verification

The circuit asserts that the swap recipient equals the sender's address. This prevents the proxy from redirecting swap outputs to a different address.

### Half-Encrypted Output Note

Since the swap output amount is determined on-chain (after AMM execution), the circuit can only encrypt the ownership fields:

| Ciphertext Index | Content                 | Source                |
| ---------------- | ----------------------- | --------------------- |
| 0-1              | `epk` (x, y)            | Circuit               |
| 2                | `encrypted_secret`      | Circuit               |
| 3                | `tag`                   | Circuit               |
| 4                | Encrypted `owner_hash`  | Circuit               |
| 5                | Encrypted `rk_trapdoor` | Circuit               |
| 6                | `amountOut`             | Contract (after swap) |
| 7                | `outputToken`           | Contract (after swap) |
| 8                | `0` (value\_trapdoor)   | Fixed                 |

### Receiving Key Commitment

The circuit outputs a `receivingKeyCommitment` for the swap output note:

$$\mathtt{rk\_commitment} = \operatorname{Poseidon2T4}(\mathtt{rk\_hash}, \mathtt{randomness[6]})$$

The contract uses this to compute the final output note commitment after the swap.

## Supported Selectors

| Selector     | Uniswap Function         | Input Token       |
| ------------ | ------------------------ | ----------------- |
| `0x38ed1739` | swapExactTokensForTokens | ERC-20 (path\[0]) |
| `0x7ff36ab5` | swapExactETHForTokens    | ETH (address(0))  |
| `0x18cbafe5` | swapExactTokensForETH    | ERC-20 (path\[0]) |

## Constraint Count

| Metric       | Count     |
| ------------ | --------- |
| ACIR Opcodes | 15,694    |
| Gates        | \~138,410 |

The higher constraint count (vs transfer/withdrawal) is due to the larger transaction data size and additional RLP parsing for Uniswap call data.
