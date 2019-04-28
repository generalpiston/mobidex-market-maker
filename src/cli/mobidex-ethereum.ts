#!/usr/bin/env ts-node

import * as commander from 'commander';
import { getProviderRPCURL, getAccounts, getWeb3 } from '../lib/utils/ethereum';
import { createWallet, loadWalletProviderWithoutPassword } from '../lib/wallet';

function requireNetwork(fn) {
  return options => {
    if (!options.network) throw new Error('`--network` is required.');
    return fn(options);
  };
}

async function getAddresses(options) {
  const provider = await loadWalletProviderWithoutPassword(
    parseInt(options.network, 10)
  );
  const web3 = await getWeb3(provider);
  const addresses = await getAccounts(web3);
  console.log(JSON.stringify(addresses));
}

async function getBalance(options) {
  const web3 = await getWeb3(parseInt(options.network, 10));
  const balance = await web3.eth.getBalance(options.address);
  console.log(JSON.stringify(balance));
}

async function sendEther(options) {
  const provider = await loadWalletProviderWithoutPassword(
    parseInt(options.network, 10)
  );
  const web3 = await getWeb3(provider);
  const accounts = await getAccounts(web3);
  const txhash = await web3.eth.sendTransaction({
    from: accounts[0],
    to: options.to,
    value: options.value
  });
  console.log(txhash);
}

commander.command('create-wallet').action(createWallet);

commander
  .command('get-addresses')
  .option('-n, --network <network>', 'Network ID')
  .action(requireNetwork(getAddresses));

commander
  .command('get-balance')
  .option('-n, --network <network>', 'Network ID')
  .option('-a, --address <address>', 'Network ID')
  .action(requireNetwork(getBalance));

commander
  .command('send-ether')
  .option('-n, --network <network>', 'Network ID')
  .option('-t, --to <to>', 'Receiving address')
  .option('-v, --value <value>', 'Amount of ether to send')
  .action(requireNetwork(sendEther));

commander.parse(process.argv);
