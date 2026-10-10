# Security

## Your wallet is the only key that spends

Every transfer, swap and withdrawal is a transaction that your wallet signs. Nullmask never asks for your private key or recovery phrase, and its servers cannot create an action for you without your wallet's signature.

If you lose your wallet's private key, nobody can recover your private balance. Keep your recovery phrase safe, as you would for any wallet.

## Your Nullmask account keys

When you start, your wallet signs one message. Nullmask derives your account keys from that signature. They let Nullmask read your private balance and history, and they cannot spend.

## Hardware wallets

Nullmask works with hardware wallets. Each action is a standard transaction, so the device shows it and you confirm it on the device as usual. The first message you sign is structured data (EIP-712), so your wallet needs to support typed-data signing.

## Stay safe

- Use only [app.nullmask.io](https://app.nullmask.io). Check the address before you connect your wallet.
- The Nullmask network in your wallet has a personal link in its settings. Do not share it.
- Check the recipient address before you sign. A transaction on the blockchain cannot be reversed.
- Nobody from Nullmask will ever ask for your recovery phrase.
- Check the pool address on the [Networks and addresses](networks.md) page.

## The pool contracts

Nullmask operates the pool contracts. They can be upgraded and paused, and fees can change. Section 8 of the [Terms of Use](https://app.nullmask.io/terms) explains what this means for you.
