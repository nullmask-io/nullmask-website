# Fees

The app shows every fee before you confirm.

| Action | Nullmask fee | Network fee |
| --- | --- | --- |
| Deposit | 0.5% | Your wallet pays its gas, plus ETH held for crediting the deposit. The unused part comes back |
| Private transfer | None | Yes |
| Swap | None | Yes. The exchange's pool fee is in the rate |
| Withdrawal, Fast | 0.5% | Yes |
| Withdrawal, Waves | 0.5% | Yes, for each part |
| Bridge | 0.2% | Already in the quote |

## Network fee

Nullmask's relayer sends your transfers, swaps and withdrawals and pays the gas. The network fee covers that gas and the cost of running the service. It is paid in ETH from your [Gas balance](gas.md) first, then from your private ETH.

- **Fast withdrawals, transfers and swaps:** the fee is shown before you confirm.
- **Withdrawal Waves:** you sign a maximum fee. The fee is set when the wave sends, and the unused part of the maximum stays in your private balance. If the fee would be above your maximum, the withdrawal waits for the next wave.

## Paying ahead

When you deposit, you can prepay the 0.5% fee of a later withdrawal and add ETH to your Gas balance. Both are shown in the deposit quote and can be turned off.

Fees can change. The [Terms of Use](https://app.nullmask.io/terms) set the limits.
