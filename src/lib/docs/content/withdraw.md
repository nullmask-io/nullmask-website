# Withdraw

A withdrawal sends funds from your private balance to any address. The recipient address, the asset, the amount and the time are public on the blockchain. Which deposit the funds came from is not.

## Steps

1. Open **Send** and enter the recipient address and the amount.
2. Choose **Fast** or **Advanced**.
3. Confirm in your wallet.

Use a fresh address. The app does not let you withdraw to the wallet you are connected with, and it warns you about an address that has made deposits.

## Fast

Your withdrawal is sent right away and usually arrives in about a minute.

## Withdrawal Waves

With **Advanced**, your withdrawal leaves with a Withdrawal Wave: a scheduled moment when withdrawals are sent. Waves run every 15 minutes.

- **Standard amounts.** The app suggests amounts that many people use, such as 0.1, 0.5 or 1 ETH, or 250, 500, 1,000 or 3,000 USDT or USDC. You can enter any amount, and the app warns you that an unusual amount is easier to spot.
- **Split across waves.** You can split a withdrawal into up to 5 parts, scheduled up to 24 hours ahead.
- **Cancel.** You can cancel a withdrawal until its wave starts sending.
- **If the network fee rises** above the limit you signed, your withdrawal leaves with the next wave. If it cannot leave within 24 hours, it is cancelled and the funds stay in your private balance.

The app's [Withdrawal Waves page](https://app.nullmask.io/waves) explains waves step by step.

## Fees

Both modes have the same fees: a 0.5% withdrawal fee plus a network fee. In a wave, each part pays its own network fee. See [Fees](fees.md).

## Withdrawals are checked

The recipient address is checked before the withdrawal is sent. A withdrawal to some addresses can be refused.
