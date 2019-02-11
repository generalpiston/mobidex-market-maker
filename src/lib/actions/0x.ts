import { BigNumber } from '0x.js';
import * as contractAddresses from '@0x/contract-addresses';
import { factory } from '../../logging';
import {
  ensureAddressFormat,
  getAccounts,
  getContractWrappers
} from '../utils/ethereum';

const logger = factory.getLogger('actions');

export async function checkAndSetAllowance(
  web3: any,
  tokenAddress: string
): Promise<string> {
  const accounts = await getAccounts(web3);
  const account = ensureAddressFormat(accounts[0]);
  const network = await web3.eth.net.getId();
  const wrappers = await getContractWrappers(web3);
  const allowance = await wrappers.erc20Token.getProxyAllowanceAsync(
    tokenAddress,
    account
  );

  if (allowance.eq(wrappers.erc20Token.UNLIMITED_ALLOWANCE_IN_BASE_UNITS)) {
    return;
  }

  return wrappers.erc20Token.setUnlimitedProxyAllowanceAsync(
    tokenAddress,
    account
  );
}

export async function deposit(web3: any, amount: BigNumber): Promise<string> {
  const accounts = await getAccounts(web3);
  const account = ensureAddressFormat(accounts[0]);
  const network = await web3.eth.net.getId();
  const wrappers = await getContractWrappers(web3);
  const addresses = contractAddresses.getContractAddressesForNetworkOrThrow(
    network
  );
  return wrappers.etherToken.depositAsync(
    addresses.etherToken,
    amount,
    account
  );
}

export async function withdraw(web3: any, amount: BigNumber): Promise<string> {
  const accounts = await getAccounts(web3);
  const account = ensureAddressFormat(accounts[0]);
  const network = await web3.eth.net.getId();
  const wrappers = await getContractWrappers(web3);
  const addresses = contractAddresses.getContractAddressesForNetworkOrThrow(
    network
  );
  return wrappers.etherToken.withdrawAsync(
    addresses.etherToken,
    amount,
    account
  );
}
