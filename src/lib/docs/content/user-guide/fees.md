# Fees

Nullmask uses gas abstraction — the relayer pays gas fees on behalf of the user, and is reimbursed from the shielded transaction's fee allocation.

## How Fees Work

1. The proxy gets the default or latest historical gas usage for the operation
2. It applies a 1.25x buffer and multiplies the result by the current gas price
3. The fee is deducted from the user's shielded balance
4. The ZK proof includes the fee amount and fee token as public inputs
5. The contract transfers the exact fee to the relayer (`msg.sender`) after verifying the proof

## Fee Estimation

```
bufferedGas = (latestHistoricalGas or defaultGas) × 1.25
feeInEth = bufferedGas × currentGasPrice
```

* **Gas usage**: Latest successful transaction for the action type, or its chain-specific default
* **Buffer**: A single 1.25x multiplier applied by `GasEstimateService`
* **Gas price**: Fetched from the blockchain at estimation time
* **Token conversion**: For token-denominated fees, `feeInEth` is converted using the exchange rate and rounded up

## Fee by Action Type

| Action              | Default Gas Estimate |
| ------------------- | -------------------- |
| Shielded Transfer   | 4,000,000 gas        |
| Shielded Withdrawal | 4,000,000 gas        |
| Shielded Swap       | 5,000,000 gas        |
| Approve Deposit     | 500,000 gas          |

The defaults are replaced by the latest successful historical gas usage when available. The 1.25x buffer is applied exactly once.

`eth_estimateGas` exposes the buffered gas estimate used by wallets. `nullmask_estimateFee` returns the corresponding fee for integration tests; the application does not depend on this custom method.

## No Gas in Wallet

Users do not need ETH in their wallet to perform shielded operations. The relayer pays all on-chain gas costs. Users only need ETH (or another token) in their **shielded balance** to cover fees.

The only operations requiring wallet ETH are:

* Initial deposit to the privacy pool
* On-chain key registration (during onboarding)
