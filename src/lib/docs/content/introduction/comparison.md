# Comparison

## Nullmask vs Other Privacy Solutions

| Feature                     | Tornado Cash        | Privacy Pools                              | Railgun                           | **Nullmask**                            |
| --------------------------- | ------------------- | ------------------------------------------ | --------------------------------- | --------------------------------------- |
| **User interface**          | Web app             | Web app                                    | Railway wallet, terminal          | Any wallet                              |
| **Required backup**         | Every note          | A new seed                                 | A new seed                        | None                                    |
| **Shielded transfers**      | No                  | No                                         | Yes                               | Yes                                     |
| **Shielded addresses**      | —                   | —                                          | New type (0zk)                    | Standard addresses (0x)                 |
| **Deposit amounts**         | Fixed denominations | Fixed minimum                              | Any                               | Any                                     |
| **ERC-20 support**          | Whitelist           | Whitelist                                  | Any                               | Any                                     |
| **Built-in compliance**     | None                | Exclusion proofs, retrospective compliance | PPoI                              | Permissioned deposits + revocation keys |
| **Deployed**                | August 2019         | March 2025                                 | July 2021                         | February 2026                           |
| **Hardware wallet support** | No                  | No                                         | Yes (design limits practical use) | Yes (native)                            |

## Detailed Comparison

### Tornado Cash

Tornado Cash uses a web app for deposits and withdrawals. For each deposit, the app generates a note plaintext that users must store securely in order to withdraw later. Tornado Cash supports only fixed denominations and does not support shielded transfers between users.

### Privacy Pools

Privacy Pools also uses a web app as its front end. Users must generate a new account backed up by a seed phrase. The seed phrase must be re-entered at every visit to the web app. Privacy Pools allows a single deposit to be withdrawn in multiple transactions to different addresses.

As of March 2026, Privacy Pools supports key derivation from a wallet signature, accompanied by a prominent phishing warning disclaimer.

### Railgun

Using Railgun requires the installation of a dedicated wallet backed up by a new seed phrase. Railgun users can transact privately among each other using a new address type prefixed with `0zk`. Railgun provides a terminal interface and a web app for 0x-to-0zk transfers.

Railgun supports hardware wallets but with a fundamental design flaw: the spending authority must still be extracted from the device, violating the core security principle of hardware wallets.

### Nullmask

Nullmask requires no new wallet, no seed phrase, and no backup. Users add a virtual network to their existing wallet and transact as usual. The protocol works with any EIP-1559 compatible wallet including hardware wallets, with spending authority never leaving the device.

## Security Architecture Comparison

For a deeper analysis of how Nullmask's architecture compares on hardware wallet support and spending authority, see [Hardware Wallets](/docs/security/hardware-wallets).
