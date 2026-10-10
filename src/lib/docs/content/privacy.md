# What stays private

Nullmask keeps your activity private from people who watch the blockchain. This page shows what they can see and what they cannot.

## Public on the blockchain

| Action | Anyone can see |
| --- | --- |
| Deposit | The address you deposit from, the asset and the amount |
| Private transfer | That a transfer happened. Not the sender, the recipient or the amount |
| Swap | The assets and the amounts. Not who made the swap |
| Withdrawal | The recipient address, the asset, the amount, the fee and the time |
| Registration | Your wallet address and your Nullmask public key |

Inside the pool, your balance and your transfers are not visible on-chain. When you send, swap or withdraw, Nullmask's relayer submits the transaction, so your wallet address does not appear as the sender.

## What Nullmask can see

Nullmask's servers hold your account keys, so they can see your private balance and history. Nullmask protects your activity from outside observers, not from the operator. The [Privacy Policy](https://app.nullmask.io/privacy) explains how this data is handled.

## How to keep it private

The blockchain still shows every deposit and every withdrawal. Someone can try to match them by amount and timing. Your choices decide how hard that is:

- **New address.** Withdraw to a fresh address, not one tied to your deposits.
- **Round amount.** A standard amount that many people use is harder to match than an unusual one.
- **Wait for the wave.** Use [Withdrawal Waves](withdraw.md#withdrawal-waves), so your withdrawal goes out at a scheduled time, not at the moment you ask for it.
- **Don't rush.** A withdrawal right after a deposit is easy to link.
- **Split across waves.** Several parts in different waves are harder to match than one.

Also, do not top up your withdrawal address from your main wallet. The app's [privacy best practice](https://app.nullmask.io/rules) page walks through these habits.

> Nullmask does not promise that your activity can never be linked. Read section 9 of the [Terms of Use](https://app.nullmask.io/terms).
