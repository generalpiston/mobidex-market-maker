import { assetDataUtils, BigNumber } from '0x.js';
import * as path from 'path';
import { bulkSend } from '../../lib/utils/email';
import {
  getAccounts,
  getContractWrappers,
  getTokenByAssetData
} from '../../lib/utils/ethereum';
import { factory } from '../../logging';

const logger = factory.getLogger(
  'market-maker.NotifyRefillEthNecessaryStrategy'
);

export class NotifyRefillEthNecessaryStrategy {
  private web3: any;
  private emailAddresses: string[];
  private minimumETHAmount: BigNumber;

  private lastEmail: number;

  constructor(
    web3: any,
    emailAddresses: string[],
    minimumETHAmount: BigNumber = new BigNumber(10).pow(17)
  ) {
    this.web3 = web3;
    this.emailAddresses = emailAddresses;
    this.minimumETHAmount = minimumETHAmount;

    this.lastEmail = 0;
  }

  public async shouldExecute(): Promise<boolean> {
    const accounts = await getAccounts(this.web3);
    const balance = await this.web3.eth.getBalance(accounts[0]);
    return this.minimumETHAmount.gt(balance);
  }

  public async execute(): Promise<void> {
    await this.notify();
  }

  private async notify(): Promise<void> {
    const html = path.resolve(
      path.dirname(__filename),
      '..',
      'templates/refill_eth_needed.html.tmpl'
    );
    const text = path.resolve(
      path.dirname(__filename),
      '..',
      'templates/refill_eth_needed.txt.tmpl'
    );

    try {
      await bulkSend(null, {
        subject: 'Mobidex Notification -- Refill ETH Needed',
        templates: {
          html,
          text
        },
        to: this.emailAddresses
      });
    } catch (err) {
      logger.warn(err);
    } finally {
      this.lastEmail = Date.now();
    }
  }
}
