# Glossary

| Term                            | Definition                                                                                                                                                              |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Note**                        | A private UTXO — an encrypted value container with 6 fields. Note commitments are stored in the on-chain Merkle tree; encrypted note data is emitted in contract events |
| **Note Commitment**             | A Poseidon2 hash of a note's fields, stored on-chain in the Merkle tree                                                                                                 |
| **Note Nullifier**              | A unique identifier revealed when spending a note: `Poseidon2(commitment, nk)`                                                                                          |
| **Transaction Nullifier**       | A unique identifier for each signed transaction: `Poseidon2(nk, nonce*2^32 + chainId, pk_hash)`                                                                         |
| **Nullifiers Hash**             | Hash of all 6 input note nullifiers: `Poseidon2(nf1, ..., nf6)`                                                                                                         |
| **Viewing Key**                 | A tuple `(pk, nk, ivk, ovk)` derived from a wallet signature; grants view access to transaction history                                                                 |
| **Receiving Key**               | A triple `(pk, pnk, ek)` derived from the Viewing Key; registered on-chain for receiving funds                                                                          |
| **Nullifying Key (nk)**         | A secret field element used to derive deterministic note nullifiers                                                                                                     |
| **Public Nullifying Key (pnk)** | Hash of the nullifying key: `Poseidon2(nk)`                                                                                                                             |
| **Incoming Viewing Key (ivk)**  | Field element for trial decryption of incoming notes                                                                                                                    |
| **Outgoing Viewing Key (ovk)**  | Field element for encrypting/decrypting outgoing note receipts                                                                                                          |
| **Encryption Key (ek)**         | Grumpkin curve point for note encryption: `ivk * G`                                                                                                                     |
| **Access Token**                | A 16-byte base64url token derived from the user's signature, used to authenticate proxy requests                                                                        |
| **RPC Proxy**                   | The JSON-RPC server that sits between the wallet and the blockchain, orchestrating shielded operations                                                                  |
| **Relayer**                     | A server that submits shielded transactions to the blockchain, paying gas fees                                                                                          |
| **Guard**                       | A service that screens and approves/rejects deposits into the privacy pool                                                                                              |
| **Virtual Network**             | The custom EVM network added to the wallet, routing RPC calls through the Nullmask proxy                                                                                |
| **Virtual Chain ID**            | A protocol-specific chain ID (e.g., 43615 for Ethereum Mainnet) used in the virtual network                                                                             |
| **Privacy Pool**                | The Nullmask smart contract that holds deposited funds and manages the note Merkle tree                                                                                 |
| **LeanIMT**                     | Lean Incremental Merkle Tree — a Merkle tree where nodes without siblings propagate directly                                                                            |
| **Poseidon2 T4**                | A zk-SNARK-friendly hash function with state width 4                                                                                                                    |
| **BN254**                       | The pairing-friendly curve that defines the scalar field used by the proof system                                                                                       |
| **Grumpkin**                    | The embedded curve (base field = BN254 scalar field) used for in-circuit EC operations                                                                                  |
| **UltraHonk**                   | The ZK proof system used by Barretenberg                                                                                                                                |
| **Barretenberg**                | The C++ proving backend developed by Aztec Protocol                                                                                                                     |
| **Noir**                        | A domain-specific language for writing ZK circuits                                                                                                                      |
| **UUPS**                        | Universal Upgradeable Proxy Standard — the upgrade pattern used by the Nullmask contract                                                                                |
| **EIP-1559**                    | The Ethereum transaction format with `maxFeePerGas` and `maxPriorityFeePerGas`                                                                                          |
| **Shielded Transfer**           | A private transfer between two addresses within the Nullmask pool                                                                                                       |
| **Shielded Withdrawal**         | A withdrawal from the pool to an external address (amount and recipient are public)                                                                                     |
| **Shielded Swap**               | A private Uniswap V2 swap within the pool                                                                                                                               |
| **Faerie Gold Attack**          | An attack where duplicate note commitments allow spending the same value multiple times                                                                                 |
| **Revocation Key**              | A key pair published with each approved deposit, enabling retrospective taint recovery                                                                                  |
| **Gas Escrow**                  | ETH sent with deposits to cover the guard's gas costs                                                                                                                   |
| **Trial Decryption**            | The process of attempting to decrypt each note to find ones belonging to a specific viewing key                                                                         |
| **LMDB**                        | Lightning Memory-Mapped Database — used for persistent proxy state storage                                                                                              |
