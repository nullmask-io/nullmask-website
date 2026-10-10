# Wallet-Only Mode

Nullmask can be used directly from your wallet without opening a web application.

## How It Works

After the one-time onboarding (key generation + registration), you can use the Nullmask network in your wallet like any other chain:

1. Switch to the Nullmask network in your wallet
2. Your wallet displays your shielded balance
3. Use the "Send" action to transact

## Automatic Action Detection

The proxy automatically determines the correct action based on the recipient:

| Recipient Status       | Action              | Result                                |
| ---------------------- | ------------------- | ------------------------------------- |
| Registered on Nullmask | Shielded transfer   | Funds remain in pool (encrypted note) |
| Not registered         | Shielded withdrawal | Funds sent to recipient's address     |

## Implications

* You can **send** to any Nullmask user using their standard 0x address
* You can **withdraw** to any non-registered address
* You **cannot** withdraw to addresses registered on Nullmask (use a fresh address instead)

This last point is a deliberate design choice: it encourages users to use fresh, unlinkable addresses for withdrawals, which improves privacy.

## Balance Display

Your wallet shows the shielded balance as if it were a normal chain balance:

* `eth_getBalance` returns your shielded ETH balance
* `eth_call` for `balanceOf` returns your shielded ERC-20 balance
* `eth_getTransactionCount` returns the count of spent notes

## Swaps

Shielded swaps are currently only available through the Nullmask web app. Wallet-only mode supports transfers and withdrawals.
