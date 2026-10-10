# FAQ

## Do I need a new wallet?

No. Nullmask works with the wallet you already use. It adds one network to it, and you confirm every action in your wallet as usual.

## Does Nullmask hold my funds?

Your deposits are held by the pool smart contract, together with other users' deposits. Only your wallet can authorise spending your private balance. Nullmask never receives your wallet's private key.

## Why is my deposit not in my balance yet?

Every deposit is checked before it is credited. Most are credited within minutes, and some take longer. See [Deposit checks](deposit-checks.md).

## Can I get my deposit back while it is waiting?

Yes. A deposit that has not been credited yet can be taken back to the address it came from. You pay the network gas for that transaction.

## Who pays the gas for private actions?

Nullmask's relayer sends your transfers, swaps and withdrawals and pays the network gas. You pay a network fee for it in ETH from your private balance. See [Fees](fees.md).

## Can I send to someone who does not use Nullmask?

Yes, but then it is a withdrawal, and the recipient, the asset and the amount are public. A private transfer needs the recipient to have a Nullmask account. See [Send privately](send.md).

## Can I withdraw to the wallet I deposited from?

The app does not let you withdraw to the wallet you are connected with, because that would link your deposit and your withdrawal. Use a different address.

## What is a Withdrawal Wave?

A way to withdraw at a scheduled time instead of right away. See [Withdraw](withdraw.md#withdrawal-waves).

## Can anyone link my deposit and my withdrawal?

Deposits and withdrawals are public, so someone can try to match them by amount and timing. Standard amounts, time between them and Withdrawal Waves make that much harder. Nullmask itself can see your history. See [What stays private](privacy.md).

## How do I contact Nullmask?

For a deposit question, write to compliance@nullmask.io with your address and the transaction hash. For legal notices, write to legal@nullmask.io.
