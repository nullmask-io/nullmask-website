# Forwarded Methods

These standard Ethereum JSON-RPC methods are forwarded directly to the underlying blockchain node without modification.

## Pass-Through Methods

| Method                     | Parameters                                      | Purpose                  |
| -------------------------- | ----------------------------------------------- | ------------------------ |
| `eth_getCode`              | `[address, blockTag]`                           | Get contract bytecode    |
| `eth_blockNumber`          | `[]`                                            | Get latest block number  |
| `eth_gasPrice`             | `[]`                                            | Get current gas price    |
| `eth_maxPriorityFeePerGas` | `[]`                                            | Get current priority fee |
| `eth_feeHistory`           | `[blockCount, newestBlock, rewardPercentiles?]` | Get fee history          |
| `eth_getBlockByNumber`     | `[blockNumber, fullTransactions?]`              | Get block by number      |
| `eth_getBlockByHash`       | `[blockHash, fullTransactions?]`                | Get block by hash        |

## Partially Forwarded Methods

| Method     | Forwarded When                               | Intercepted When                  |
| ---------- | -------------------------------------------- | --------------------------------- |
| `eth_call` | Non-balanceOf calls (decimals, symbol, etc.) | ERC-20 `balanceOf(address)` calls |

## Not Forwarded

The following methods are **not** forwarded and return privacy-preserving alternatives:

| Method                      | Behavior                                  |
| --------------------------- | ----------------------------------------- |
| `eth_getBalance`            | Returns shielded balance from local notes |
| `eth_getTransactionCount`   | Returns spent notes count                 |
| `eth_getLogs`               | Returns empty array                       |
| `eth_sendTransaction`       | Intercepts and shields                    |
| `eth_sendRawTransaction`    | Intercepts and shields                    |
| `eth_getTransactionByHash`  | Returns from local store                  |
| `eth_getTransactionReceipt` | Returns from local store + on-chain       |
| `eth_syncing`               | Returns Nullmask sync status              |
| `eth_estimateGas`           | Returns shielded operation estimate       |
| `eth_chainId`               | Returns virtual chain ID                  |
