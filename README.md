# Mobidex Market Maker

This is a naive implementation of a market maker bot.

## Quick Start

Get started using the Mobidex market maker:

### 1. Create a wallet

`npm run cli -- ethereum create-wallet`

### 2. Transfer assets

1. Get your address: `npm run cli -- ethereum get-addresses`
2. Transfer ETH, WETH, and any other asset you wish to make markets for.

### 3. Set allowances

Run the following for every token you wish to make markets for: `npm run cli -- 0x set-proxy-allowance -n 1 -t <token address>`.

### 4. Configure the market maker

1. Create `config.json` at the root of the market maker directory.
2. Copy `src/config/config.json.template` to `config.json`.
3. Replace all `<>` with appropriate values.

### 5. Start market maker

`./start.sh`

## Docker Setup

Follow steps 1 through 4 of quick start.

### 5. Build docker image

`docker build -t mobidex-market-maker:latest .`

### 6. Move config and wallet files to subdirectories

```
mkdir config
mkdir wallet
mv config.json config/
mv account.json wallet/
```

### 7. Run docker container

`docker run --name mmm --mount type=bind,source="$(pwd)"/wallet,target=/app/wallet --mount type=bind,source="$(pwd)"/config,target=/app/config --env CONFIG_FILE=/app/config/config.json --env WALLET_PATH=/app/wallet/account.json --env wallet__password=<password> mobidex-market-maker:latest`

# License

GPLv3
