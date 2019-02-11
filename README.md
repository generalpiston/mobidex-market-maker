# Mobidex Market Maker

This is a naive implementation of a market maker bot.

Get started using the Mobidex market maker:

## 1. Create a wallet

`npm run cli -- ethereum create-wallet`

## 2. Transfer Assets

1. Get your address: `npm run cli -- ethereum get-addresses`
2. Transfer ETH, WETH, and any other asset you wish to make markets for.

## 3. Configure the market maker

1. Create a `config.json` at the root of the market maker directory.
2. Copy `src/config/config.json.template` to `config.json`.
3. Replace all `<>` with appropriate values.

## 4. Set allowances

Run the following for every token you wish to make markets for: `npm run cli -- 0x set-proxy-allowance -n 1 -t <token address>`.

## 5. Start market maker

`./start.sh`

# License

GPLv3
