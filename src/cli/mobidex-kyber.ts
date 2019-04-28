#!/usr/bin/env ts-node

import { BigNumber } from '0x.js';
import * as commander from 'commander';
import { checkAndSetAllowance as _checkAndSetAllowance } from '../lib/actions/kyber';
import { getWeb3 } from '../lib/utils/ethereum';
import {
  getBuyPrice as _getBuyPrice,
  getKyberNetworkProxyContractAddress,
  getSellPrice as _getSellPrice
} from '../lib/utils/kyber';
import { loadWalletProviderWithoutPassword } from '../lib/wallet';

function requireNetwork(fn) {
  return options => {
    if (!options.network) throw new Error('`--network` is required.');
    return fn(options);
  };
}

async function getProxyContractAddress(options) {
  const web3 = getWeb3(parseInt(options.network, 10));
  const address = await getKyberNetworkProxyContractAddress(web3);

  console.log(address);
}

async function setProxyAllowance(options) {
  const provider = await loadWalletProviderWithoutPassword(
    parseInt(options.network, 10)
  );
  const web3 = getWeb3(provider);
  const hash = await _checkAndSetAllowance(web3, options.token);
  console.log(hash);
}

async function getBuyPrice(options) {
  const network = parseInt(options.network, 10);
  const web3 = getWeb3(network);

  const price = await _getBuyPrice(web3, options.token, new BigNumber(2));

  console.log(price);
}

async function getSellPrice(options) {
  const network = parseInt(options.network, 10);
  const web3 = getWeb3(network);

  const price = await _getSellPrice(web3, options.token, new BigNumber(1));

  console.log(price.toString());
}

commander
  .command('set-proxy-allowance')
  .option('-n, --network <network>', 'Network ID')
  .option('-t, --token <token>', 'Token address')
  .action(requireNetwork(setProxyAllowance));
commander
  .command('get-contract-address')
  .option('-n, --network <network>', 'Network ID')
  .action(requireNetwork(getProxyContractAddress));
commander
  .command('get-buy-price')
  .option('-n, --network <network>', 'Network ID')
  .option('-t, --token <token>', 'Token address')
  .action(requireNetwork(getBuyPrice));
commander
  .command('get-sell-price')
  .option('-n, --network <network>', 'Network ID')
  .option('-t, --token <token>', 'Token address')
  .action(requireNetwork(getSellPrice));

commander.parse(process.argv);
