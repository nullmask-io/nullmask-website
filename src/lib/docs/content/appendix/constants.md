# Constants

## Chain IDs

| Network          | Underlying Chain ID | Virtual Chain ID |
| ---------------- | ------------------- | ---------------- |
| Hardhat (local)  | 31337               | 43613            |
| Ethereum Sepolia | 11155111            | 43611            |
| Ethereum Mainnet | 1                   | 43615            |
| MegaETH          | 4326                | 43616            |
| Arbitrum One     | 42161               | 43617            |
| Base             | 8453                | 43618            |
| BSC              | 56                  | 43619            |

## Merkle Tree

| Constant            | Value  | Description                                        |
| ------------------- | ------ | -------------------------------------------------- |
| `MAX_TREE_DEPTH`    | 16     | Maximum Merkle tree depth (will be upgraded to 32) |
| Maximum leaves      | 65,536 | $$2^{16}$$ notes (will be upgraded to $$2^{32}$$)  |
| `ROOT_HISTORY_SIZE` | 64     | Number of historical roots stored                  |

## Field

| Constant                   | Value                                                                           |
| -------------------------- | ------------------------------------------------------------------------------- |
| BN254 scalar field modulus | `21888242871839275222246405745257275088548364400416034343698204186575808495617` |

## Transaction Data Sizes

| Parameter                | Value     | Description                                            |
| ------------------------ | --------- | ------------------------------------------------------ |
| `TRANSFER_MAX_DATA_SIZE` | 68 bytes  | ERC-20 transfer calldata (selector + address + amount) |
| `SWAP_MAX_DATA_SIZE`     | 324 bytes | Uniswap V2 router calldata                             |
| `TRANSFER_RLP_SIZE`      | 143 bytes | RLP buffer for transfer signature verification         |
| `SWAP_RLP_SIZE`          | 401 bytes | RLP buffer for swap signature verification             |

## Circuit Public Inputs

| Circuit             | Public Inputs Count                    |
| ------------------- | -------------------------------------- |
| Shielded Transfer   | 45 (+ 1 chain\_id = 46 total)          |
| Shielded Withdrawal | 37 (+ 1 chain\_id = 38 total)          |
| Shielded Swap       | 50 (+ 2 chain\_id + router = 52 total) |

## Note Structure

| Field                       | Type  | Description                                                                                     |
| --------------------------- | ----- | ----------------------------------------------------------------------------------------------- |
| `owner_hash`                | Field | Hash of receiving key                                                                           |
| `value`                     | u128  | Token amount                                                                                    |
| `coin_id`                   | Field | Token address (0 for ETH)                                                                       |
| `receiving_key_trapdoor`    | Field | Masks note owner                                                                                |
| `value_commitment_trapdoor` | Field | Masks note value                                                                                |
| `nullifiers_hash`           | Field | Hash of input nullifiers (or deposit index); not stored in note plaintext, passed to `commit()` |

## ERC-20 Selectors

| Selector     | Function                    |
| ------------ | --------------------------- |
| `0xa9059cbb` | `transfer(address,uint256)` |
| `0x70a08231` | `balanceOf(address)`        |

## Uniswap V2 Selectors

| Selector     | Function                   |
| ------------ | -------------------------- |
| `0x38ed1739` | `swapExactTokensForTokens` |
| `0x7ff36ab5` | `swapExactETHForTokens`    |
| `0x18cbafe5` | `swapExactTokensForETH`    |

## Access Token

| Parameter       | Value                     |
| --------------- | ------------------------- |
| Cookie name     | `nullmask_access_token`   |
| Token length    | 16 bytes                  |
| Encoding        | base64url                 |
| Derivation salt | `"Nullmask access token"` |
| Hash function   | Keccak-256                |
