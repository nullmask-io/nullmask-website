# Local Setup

## Build and Install

From the repository root:

```bash
./build-circuits.sh

cd contracts
npm install

cd ../web
pnpm install
cp .env.example .env
```

Fill `web/.env` with local Hardhat values. See the [integration-test guide](https://github.com/nullmask-io/nullmask/blob/main/web/tests/README.md#environment) for the required values and deployment artifact mapping.

## Start Hardhat and Deploy

Start Hardhat:

```bash
cd contracts
npm run start
```

In another terminal:

```bash
cd contracts
npm run deploy
```

Update `web/.env` from `contracts/deployments/hardhat/nullmask.json` and `testnet.json`.

## Start Web Services

Terminal commands must export the root web environment:

```bash
cd web
set -a
source .env
set +a
pnpm dev
```

For integration tests without the frontend:

```bash
pnpm dev --filter=rpc-proxy --filter=relayer --filter=guard --filter=faucet
```

## Configure HTTPS

HTTPS is required for the RPC proxy's secure access-token cookie. It is also required for all browser-facing endpoints to avoid insecure-content blocking.

### macOS: Ophiuchi

Create these mappings:

| HTTPS domain       | Upstream                |
| ------------------ | ----------------------- |
| `app.nm.local`     | `http://localhost:3000` |
| `proxy.nm.local`   | `http://localhost:8545` |
| `faucet.nm.local`  | `http://localhost:8547` |
| `relayer.nm.local` | `http://localhost:8548` |
| `guard.nm.local`   | `http://localhost:8549` |
| `node.nm.local`    | `http://localhost:9000` |

Use `BASE_DOMAIN=nm.local` and the matching `https://*.nm.local` URLs in `web/.env`. Open `https://app.nm.local`.

### Linux: Caddy

Follow [Setting Up Caddy for Local HTTPS](https://github.com/nullmask-io/nullmask/blob/main/docs/caddy-setup.md). It provides one `https://nullmask.local.dev` host with path-based routes.

## Run Integration Tests

See the [integration-test guide](https://github.com/nullmask-io/nullmask/blob/main/web/tests/README.md) for environment profiles, health checks, individual test commands, and reset behavior.

## VS Code

The checked-in VS Code workflow is platform-specific:

* Open `web/` as the workspace.
* Configure and start Ophiuchi separately.
* The browser launcher expects macOS ARM, `app.nm.local`, and locally installed Chrome/MetaMask assets.
* `Compound DEV` starts the development stack and browser, but not the HTTPS proxy.

Use the terminal workflow on other platforms.

## Reset After Restarting Hardhat

Restarting Hardhat invalidates persisted RPC proxy state:

```bash
cd web
./wipe-lmdb.sh
```

Redeploy contracts and restart the web services afterward.
