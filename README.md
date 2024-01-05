# Kawa Protocol

This repository contains the source code for the core smart contracts of Kawa. Smart contracts are meant to be compiled to `.wasm` files and uploaded to the Cosmos chains.

### For contracts deployed on the Sei Network

1. Install [Seid]

2. Get the wasm binary executable on your local machine.

   ```bash
   git clone https://github.com/kawafinance/kawa-interface.git
   git checkout <commit-id>
   cargo make rust-optimizer
   ```

   Note: Intel/Amd 64-bit processor is required. While there is experimental ARM support for CosmWasm/rust-optimizer, it's discouraged to use in production and the wasm bytecode will not match up to an Intel compiled wasm file.

3. Download the wasm from the chain.

   ```bash
   osmosisd query wasm code $CODEID -- $NODE download.wasm
   ```

4. Verify that the diff is empty between them. If any value is returned, then the wasm files differ.

   ```bash
   diff artifacts/$CONTRACTNAME.wasm download.wasm
   ```

5. Alternatively, compare the wasm files' checksums:

   ```bash
   sha256sum artifacts/$CONTRACTNAME.wasm download.wasm
   ```

## Environment set up

- Install [rustup]. Once installed, make sure you have the wasm32 target:

  ```bash
  rustup default stable
  rustup update stable
  rustup target add wasm32-unknown-unknown
  ```

- Install [cargo-make]

  ```bash
  cargo install --force cargo-make
  ```

- Install [Docker]

- Install [Node.js v16]

- Install [Yarn]

- Create the build folder:

   ```bash
   cd scripts
   yarn
   yarn build
   ```

- Compile all contracts:

  ```bash
  cargo make rust-optimizer
  ```

- Formatting:

   ```bash
   cd scripts
   yarn format
   yarn lint
   ```

This compiles and optimizes all contracts, storing them in `/artifacts` directory along with `checksum.txt` which contains sha256 hashes of each of the `.wasm` files (The script just uses CosmWasm's [rust-optimizer]).

**Note:** Intel/Amd 64-bit processor is required. While there is experimental ARM support for CosmWasm/rust-optimizer, it's discouraged to use in production.

## Deployment

When the deployment scripts run for the first time, it will upload code IDs for each contract, instantiate each contract, initialize assets, and set oracles. If you want to redeploy, you must locally delete the `atlantic-2.json` file in the artifacts directory.

Everything related to deployment must be ran from the `scripts` directory.

Each outpost has a config file for its respective deployment and assets.

For Osmosis:

```bash
cd scripts

# for testnet deployment with deployerAddr set as owner & admin:
yarn deploy:sei-testnet
```

## Schemas

```bash
cargo make --makefile Makefile.toml generate-all-schemas
```

Creates JSON schema files for relevant contract calls, queries and query responses (See: [cosmwams-schema]).

## Linting

`rustfmt` is used to format any Rust source code:

```bash
cargo +nightly fmt
```

`clippy` is used as a linting tool:

```bash
cargo make clippy
```

## Testing

Integration tests (task `integration-test` or `test`) use `.wasm` files. They have to be generated with `cargo make build`.

Run unit tests:

```bash
cargo make unit-test
```

Run integration tests:

```bash
cargo make integration-test
```

Run all tests:

```bash
cargo make test
```

## Deployments

### atlantic-2

| Contract               | Address                                                                 |
| ---------------------- | ----------------------------------------------------------------------- |
| kawa-address-provider  | [`sei13tgdxfhg7t2se8ecfzxvjfq30f3n4td44xfakvamd3mmta4rveys6rjhqc`]  |
| kawa-oracle            | [`sei1ggqq78fumy23cdng9jte92espk7fjpmplg66yednz7x70j92sylqp4uvct`]  |
| kawa-lending           | [`sei1yqx6zglw7as4jpr6zh8y92p68zsy6mgsdjhvxavkg9v5vujkth2slje5gs`]  |

## License

Contents of this repository are open source under [GNU General Public License v3](./LICENSE) or later.
