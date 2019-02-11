import { factory } from '../../logging';
import {
  ensureAddressFormat,
  getAccounts,
  getContractWrappers
} from '../utils/ethereum';
import { getKyberNetworkProxyContract } from '../utils/kyber';

const logger = factory.getLogger('actions.kyber');

export async function checkAndSetAllowance(
  web3: any,
  tokenAddress: string
): Promise<string> {
  const contract = await getKyberNetworkProxyContract(web3);
  const accounts = await getAccounts(web3);
  const account = ensureAddressFormat(accounts[0]);
  const network = await web3.eth.net.getId();
  const wrappers = await getContractWrappers(web3);
  const allowance = await wrappers.erc20Token.getAllowanceAsync(
    tokenAddress,
    account,
    contract.options.address
  );

  if (allowance.eq(wrappers.erc20Token.UNLIMITED_ALLOWANCE_IN_BASE_UNITS)) {
    return;
  }

  return wrappers.erc20Token.setUnlimitedAllowanceAsync(
    tokenAddress,
    account,
    contract.options.address
  );
}
