#!/usr/bin/env ts-node

import { assetDataUtils, BigNumber } from '0x.js';
import * as contractAddresses from '@0x/contract-addresses';
import * as commander from 'commander';
import * as fs from 'fs';
import * as _ from 'lodash';
import { checkAndSetAllowance, deposit, withdraw } from '../lib/actions/0x';
import {
  getContractWrappers,
  getAccounts,
  getWeb3
} from '../lib/utils/ethereum';
import {
  loadWalletProvider,
  loadWalletProviderWithoutPassword
} from '../lib/wallet';

function encodeAssetData(address) {
  console.log(assetDataUtils.encodeERC20AssetData(address));
}

function decodeAssetData(assetData) {
  console.log(
    JSON.stringify(assetDataUtils.decodeERC20AssetData(assetData), null, 2)
  );
}

async function getExchangeContractAddress(options) {
  const contractWrappers = await getContractWrappers(
    parseInt(options.network, 10)
  );
  console.log(contractWrappers.exchange.address);
}

async function getProxyContractAddress(options) {
  const contractWrappers = await getContractWrappers(
    parseInt(options.network, 10)
  );
  console.log(contractWrappers.erc20Proxy.address);
}

async function getBalance(options) {
  const network = parseInt(options.network, 10);
  const provider = await loadWalletProviderWithoutPassword(network);
  const web3 = getWeb3(provider);
  const contractWrappers = await getContractWrappers(web3);
  const accounts = await getAccounts(web3);
  const account = accounts[0];
  const balance = await contractWrappers.erc20Token.getBalanceAsync(
    options.token,
    account
  );
  console.log(balance.toString());
}

async function getAllowance(options) {
  const network = parseInt(options.network, 10);
  const web3 = getWeb3(network);
  const contractWrappers = await getContractWrappers(web3);
  const allowance = await contractWrappers.erc20Token.getProxyAllowanceAsync(
    options.token,
    options.account
  );
  console.log(allowance.toString());
  console.log(
    contractWrappers.erc20Token.UNLIMITED_ALLOWANCE_IN_BASE_UNITS.eq(allowance)
  );
}

async function getWETH9Address(options) {
  const network = parseInt(options.network, 10);
  const contractWrappers = await getContractWrappers(
    parseInt(options.network, 10)
  );
  const addresses = contractAddresses.getContractAddressesForNetworkOrThrow(
    network
  );
  console.log(addresses.etherToken);
}

async function wrapEther(options) {
  const provider = await loadWalletProviderWithoutPassword(
    parseInt(options.network, 10)
  );
  const web3 = getWeb3(provider);
  const hash = await deposit(web3, new BigNumber(options.amount));
  console.log(hash);
}

async function unwrapEther(options) {
  const provider = await loadWalletProviderWithoutPassword(
    parseInt(options.network, 10)
  );
  const web3 = getWeb3(provider);
  const hash = await withdraw(web3, new BigNumber(options.amount));
  console.log(hash);
}

async function setProxyAllowance(options) {
  const provider = await loadWalletProviderWithoutPassword(
    parseInt(options.network, 10)
  );
  const web3 = getWeb3(provider);
  const hash = await checkAndSetAllowance(web3, options.token);
  console.log(hash);
}

commander
  .command('get-exchange-contract-address')
  .option('-n, --network <network>', 'Network ID')
  .action(getExchangeContractAddress);
commander
  .command('get-proxy-contract-address')
  .option('-n, --network <network>', 'Network ID')
  .action(getProxyContractAddress);
commander
  .command('get-weth-address')
  .option('-n, --network <network>', 'Network ID')
  .action(getWETH9Address);
commander
  .command('get-balance')
  .option('-n, --network <network>', 'Network ID')
  .option('-t, --token <token>', 'Token address')
  .action(getBalance);
commander
  .command('get-allowance')
  .option('-n, --network <network>', 'Network ID')
  .option('-t, --token <token>', 'Token address')
  .option('-c, --account <account>', 'Token address')
  .action(getAllowance);
commander
  .command('wrap-ether')
  .option('-n, --network <network>', 'Network ID')
  .option('-a, --amount <amount>', 'Token amount')
  .action(wrapEther);
commander
  .command('unwrap-ether')
  .option('-n, --network <network>', 'Network ID')
  .option('-a, --amount <amount>', 'Token amount')
  .action(unwrapEther);
commander
  .command('set-proxy-allowance')
  .option('-n, --network <network>', 'Network ID')
  .option('-t, --token <token>', 'Token address')
  .action(setProxyAllowance);
commander.command('encode-asset-data <address>').action(encodeAssetData);
commander.command('decode-asset-data <data>').action(decodeAssetData);

commander.parse(process.argv);
