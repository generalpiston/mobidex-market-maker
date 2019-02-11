import { assetDataUtils, BigNumber, BlockParam, SignedOrder } from '0x.js';
import { ContractWrappers } from '@0x/contract-wrappers';
import * as sigUtil from 'eth-sig-util';
import * as EthTx from 'ethereumjs-tx';
import * as ethUtil from 'ethereumjs-util';
import Web3 = require('web3');
import { ContractDefinitionLoader } from 'web3-contracts-loader';
import * as ZeroClientProvider from 'web3-provider-engine/zero';
import config from '../../config';
import { factory } from '../../logging';

const TokenABI = require('../../../abi/Token.json');
const BytesTokenABI = require('../../../abi/BytesToken.json');

const logger = factory.getLogger('utils.ethereum');

const TOKENS = {};
const BYTE_TOKENS = {};
const ASSETS = {};
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
const ZERO = new BigNumber(0);

export { NULL_ADDRESS, ZERO };

export function hex2a(hexx) {
  const hex = hexx.toString();
  let str = '';
  for (let i = 0; i < hex.length && hex.substr(i, 2) !== '00'; i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return str;
}

export async function getAccounts(web3): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    web3.eth.getAccounts((err, accounts) => {
      if (err) {
        reject(err);
      } else {
        resolve(accounts);
      }
    });
  });
}

export async function getNetworkId(web3): Promise<number> {
  return await new Promise<number>((resolve, reject) => {
    web3.eth.net.getId((err, network) => {
      if (err) {
        reject(err);
      } else {
        resolve(parseInt(network, 10));
      }
    });
  });
}

export function getProviderRPCURL(network: number) {
  return config.get(`networks:${network}:http`);
}

export function getProvider(network: number) {
  const URL = getProviderRPCURL(network);
  logger.trace(`Connecting to: ${URL}`);
  return new (Web3 as any).providers.HttpProvider(URL);
}

export function getWeb3(networkOrProvider: number | any): any {
  let provider = null;
  if (typeof networkOrProvider === 'number') {
    provider = getProvider(networkOrProvider);
  } else {
    provider = networkOrProvider;
  }
  return new (Web3 as any)(provider);
}

export function getZeroClientProvider(
  privateKey: string,
  address: string,
  rpcUrl: string
) {
  const privateKeyBuffer = new Buffer(
    ethUtil.stripHexPrefix(privateKey),
    'hex'
  );

  return new ZeroClientProvider({
    getAccounts: cb => {
      cb(null, [ensureAddressFormat(address)]);
    },
    processMessage: (params, cb) => {
      const message = ethUtil.stripHexPrefix(params.data);
      const prefixedMessage = ethUtil.hashPersonalMessage(
        new Buffer(message, 'hex')
      );
      const msgSig = ethUtil.ecsign(prefixedMessage, privateKeyBuffer);
      const rawMsgSig = ethUtil.bufferToHex(
        sigUtil.concatSig(msgSig.v, msgSig.r, msgSig.s)
      );
      cb(null, rawMsgSig);
    },
    rpcUrl,
    signTransaction: (tx, cb) => {
      const ethTx = new EthTx(tx);
      ethTx.sign(privateKeyBuffer);
      return cb(null, `0x${ethTx.serialize().toString('hex')}`);
    }
  });
}

export async function getContractWrappers(
  networkOrWeb3: number | any
): Promise<ContractWrappers> {
  let web3 = null;
  if (typeof networkOrWeb3 === 'number') {
    web3 = getWeb3(networkOrWeb3);
  } else {
    web3 = networkOrWeb3;
  }
  return new ContractWrappers(web3.currentProvider, {
    networkId: await getNetworkId(web3)
  });
}

export async function getTokenContractByAddress(network, address: string) {
  const web3 = await getWeb3(network);
  let contract = TOKENS[address] || BYTE_TOKENS[address];

  if (!contract) {
    contract = ContractDefinitionLoader({
      contractDefinitions: {
        Token: TokenABI
      },
      options: null,
      web3
    }).Token.clone();
    contract.options.address = address;

    try {
      await contract.methods.symbol().call();

      TOKENS[address] = contract;
    } catch (err) {
      contract = ContractDefinitionLoader({
        contractDefinitions: {
          Token: BytesTokenABI
        },
        options: null,
        web3
      }).Token.clone();
      contract.options.address = address;
      contract.IS_BYTES = true;

      BYTE_TOKENS[address] = contract;
    }
  }

  return contract;
}

export async function getTokensByAddress(network, addresses: string[]) {
  const tokens = [];
  for (const address of addresses) {
    tokens.push(await getTokenByAddress(network, address));
  }
  return tokens;
}

export async function getTokenByAddress(network, address: string) {
  const web3 = await getWeb3(network);

  if (!ASSETS[address]) {
    const contract = await getTokenContractByAddress(network, address);

    if (contract.IS_BYTES) {
      const name = await contract.methods.name().call();
      const symbol = await contract.methods.symbol().call();
      const decimals = await contract.methods.decimals().call();
      ASSETS[address] = {
        address,
        decimals: parseInt(decimals, 10),
        name: hex2a(name)
          .trim()
          .substring(1),
        symbol: hex2a(symbol)
          .trim()
          .substring(1)
      };
    } else {
      const name = await contract.methods.name().call();
      const symbol = await contract.methods.symbol().call();
      const decimals = await contract.methods.decimals().call();
      ASSETS[address] = {
        address,
        decimals: parseInt(decimals, 10),
        name,
        symbol
      };
    }
  }

  return ASSETS[address];
}

export async function getTokenByAssetData(network, assetData: string) {
  const { tokenAddress } = assetDataUtils.decodeERC20AssetData(assetData);
  const token = await getTokenByAddress(network, tokenAddress);
  return { ...token, assetData };
}

export function ensureHexPrefix(address) {
  if (address.indexOf('0x') !== 0) {
    return '0x' + address;
  }

  return address;
}

export function ensureAddressFormat(address) {
  return ensureHexPrefix(address).toLowerCase();
}
