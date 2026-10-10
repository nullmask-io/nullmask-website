# Deployment Addresses

## Contract Addresses

The proxy address is the canonical entry point for all interactions on each network.

## Networks

| Network          | Chain ID | Virtual Chain ID | Nullmask Proxy                               |
| ---------------- | -------- | ---------------- | -------------------------------------------- |
| Ethereum Mainnet | 1        | 43615            | `0x88888888Eb71E1D68aD0C471C6893EdEEa00B026` |
| Arbitrum One     | 42161    | 43617            | `0x8888888838DFf5A522118E461a2B926bB8Bfb4A2` |
| Base             | 8453     | 43618            | `0x8888888838DFf5A522118E461a2B926bB8Bfb4A2` |
| BSC              | 56       | 43619            | `0x8888888838DFf5A522118E461a2B926bB8Bfb4A2` |
| MegaETH          | 4326     | 43616            | `0x8888888838DFf5A522118E461a2B926bB8Bfb4A2` |
| Ethereum Sepolia | 11155111 | 43611            | `0x8D7E5c312eFeb54124C4966005F923D3A3b0E04D` |

## Deployed Contracts per Network

Each deployment consists of:

| Contract                   | Purpose                          |
| -------------------------- | -------------------------------- |
| **NullmaskProxy**          | Main entry point (ERC1967 proxy) |
| Nullmask (implementation)  | Logic contract behind proxy      |
| ShieldedTransferVerifier   | Transfer proof verification      |
| ShieldedWithdrawalVerifier | Withdrawal proof verification    |
| ShieldedSwapVerifier       | Swap proof verification          |
| AdminUpgradeController     | Upgrade authorization            |
| Poseidon2T4Unrolled        | Hash function library            |
| ZKTranscriptLib            | Shared verifier library          |

## Deploying to a New Network

To deploy Nullmask on a new EVM chain, first create `contracts/deployments/<chain>/constants.json`:

```json
{
  "network": "<chain>",
  "chainId": "<underlying chain ID>",
  "VIRTUAL_CHAIN_ID": "<nullmask virtual chain ID>",
  "UNISWAP_V2_ROUTER_ADDRESS": "<uniswap v2 router address on this chain>"
}
```

Then run:

```bash
cd contracts
npx hardhat run scripts/deploy-nullmask.ts --network <network>
```

The deployment script deploys in order:

1. ZKTranscriptLib (shared library)
2. ShieldedTransferVerifier, ShieldedWithdrawalVerifier, ShieldedSwapVerifier (with library linking)
3. AdminUpgradeController (admin = deployer)
4. Poseidon2T4Unrolled (hash library)
5. Nullmask implementation (with Poseidon2T4Unrolled library linking)
6. NullmaskProxy (ERC1967Proxy pointing to implementation)
7. Call `initialize()` on proxy

The proxy address is the canonical Nullmask address for all interactions.

## Verifying Contracts

Verifier contracts are generated from compiled Noir circuits. They are symlinked from `circuits/*/target/` to `contracts/contracts/`. When circuits are recompiled, the verifiers update automatically.

To deploy with new verifiers:

```bash
# Recompile circuits
cd circuits && ./build-circuits.sh

# Redeploy contracts
cd contracts && npx hardhat run scripts/deploy-nullmask.ts --network <network>
```

Alternatively, update verifiers without redeploying the full contract:

```solidity
function setVerifiers(
    address _shieldedTransferVerifier,
    address _shieldedWithdrawalVerifier,
    address _shieldedSwapVerifier
) external  // Requires upgrade controller authorization
```
