import { BigNumber } from '0x.js';
import * as contractAddresses from '@0x/contract-addresses';
import * as ethers from 'ethers';
import { ContractDefinitionLoader } from 'web3-contracts-loader';
import { factory } from '../../logging';
import { getContractWrappers } from './ethereum';

const logger = factory.getLogger('utils.kyber');

const KyberNetworkProxyABI = require('../../../abi/KyberNetworkProxy.json');

let KyberNetworkProxyContract = null;

export async function getKyberNetworkProxyContractAddress(web3: any) {
  const kyberProvider = new ethers.providers.Web3Provider(web3.currentProvider);
  const kyberNetworkProxyContractAddress = await kyberProvider.resolveName(
    'kybernetwork.eth'
  );
  return kyberNetworkProxyContractAddress;
}

export async function getKyberNetworkProxyContract(web3: any) {
  if (!KyberNetworkProxyContract) {
    KyberNetworkProxyContract = ContractDefinitionLoader({
      contractDefinitions: {
        KyberNetworkProxy: KyberNetworkProxyABI
      },
      options: null,
      web3
    }).KyberNetworkProxy.clone();

    KyberNetworkProxyContract.options.address = await getKyberNetworkProxyContractAddress(
      web3
    );
  }

  return KyberNetworkProxyContract;
}

export async function getBuyPrice(
  web3: any,
  tokenAddress: string,
  amount: BigNumber
) {
  const wrappers = await getContractWrappers(web3);
  const network = await web3.eth.net.getId();
  const addresses = contractAddresses.getContractAddressesForNetworkOrThrow(
    network
  );
  const WETH9Address = addresses.etherToken;
  return getPrice(web3, WETH9Address, tokenAddress, amount);
}

export async function getSellPrice(
  web3: any,
  tokenAddress: string,
  amount: BigNumber
) {
  const wrappers = await getContractWrappers(web3);
  const network = await web3.eth.net.getId();
  const addresses = contractAddresses.getContractAddressesForNetworkOrThrow(
    network
  );
  const WETH9Address = addresses.etherToken;
  return getPrice(web3, tokenAddress, WETH9Address, amount);
}

export async function getPrice(
  web3: any,
  sourceAddress: string,
  targetAddress: string,
  amount: BigNumber
) {
  const contract = await getKyberNetworkProxyContract(web3);
  const rate = await contract.methods
    .getExpectedRate(sourceAddress, targetAddress, amount)
    .call();
  return new BigNumber(rate.expectedRate);
}
