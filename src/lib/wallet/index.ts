import * as ethers from 'ethers';
import * as fs from 'fs';
import * as path from 'path';
import * as passwordPrompt from 'password-prompt';
import * as Accounts from 'web3-eth-accounts';
import { getProviderRPCURL, getZeroClientProvider } from '../utils/ethereum';

const WALLET_PATH = '../../../account.json';

export function getWalletPath() {
  return process.env.WALLET_PATH || path.join(__dirname, WALLET_PATH);
}

export async function loadWalletProviderWithoutPassword(
  network: number
): Promise<any> {
  const password = await passwordPrompt('Password: ', { method: 'hide' });
  return loadWalletProvider(network, password);
}

export async function loadWalletProvider(
  network: number,
  password: string
): Promise<any> {
  return loadWalletProviderFromPath(network, password, getWalletPath());
}

export async function loadWalletProviderFromPath(
  network: number,
  password: string,
  walletPath: string
): Promise<any> {
  const data = JSON.parse(fs.readFileSync(walletPath).toString());
  data.crypto = data.Crypto;

  const account = new Accounts().decrypt(data, password);

  return getZeroClientProvider(
    account.privateKey,
    account.address,
    getProviderRPCURL(network)
  );
}

export async function createWallet(): Promise<void> {
  return createWalletInPath(getWalletPath());
}

export async function createWalletInPath(walletPath: string): Promise<void> {
  const password = await passwordPrompt('Password: ', { method: 'hide' });
  const encryptedWallet = await ethers.Wallet.createRandom().encrypt(password);
  fs.writeFileSync(walletPath, encryptedWallet);
}
