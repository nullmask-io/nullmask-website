# Sending

Shielded transfers send tokens privately from your shielded balance to another Nullmask user.

## Requirements

* The recipient must have a registered receiving key on Nullmask
* You must have sufficient shielded balance (amount + fee)

## Steps

1. Navigate to the **Send** screen
2. Select the token
3. Enter the amount
4. Enter or paste the recipient's Ethereum address
5. Confirm the transaction in your wallet

## What Happens Behind the Scenes

1. The wallet signs a standard EIP-1559 transfer (e.g., "Send 1 ETH to 0xAlice")
2. The RPC proxy intercepts the transaction
3. The proxy checks that the recipient has a registered receiving key
4. The proxy selects funding notes from your shielded balance
5. A ZK proof is generated proving:
   * You authorized this transfer (ECDSA signature)
   * You have sufficient funds (note ownership + Merkle membership)
   * The output note is correctly encrypted for the recipient
6. The relayer submits the proof to the contract
7. The contract verifies the proof, spends your notes, and creates new notes

## Output Notes

Each transfer creates 3 notes:

| Note            | For       | Contains                      |
| --------------- | --------- | ----------------------------- |
| Output note     | Recipient | The transferred amount        |
| Change note     | You       | Leftover action-asset balance |
| Fee change note | You       | Leftover fee-asset balance    |

## Fee Estimation

Wallets use `eth_estimateGas` and the current gas price. The estimate is the default or latest historical gas usage multiplied by 1.25, so the resulting fee is:

```
fee = (latestHistoricalGas or defaultGas) × gasPrice × 1.25
```

The current application flow pays fees from shielded ETH. The circuits, contract, and relayer also support token-denominated fees, but the RPC proxy does not currently select them.

## Privacy Guarantees

* The on-chain transaction reveals nothing about sender, recipient, or amount
* Only encrypted note ciphertexts are visible on-chain
* The relayer sees only the opaque proof and public inputs
