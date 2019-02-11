import {
  assetDataUtils,
  generatePseudoRandomSalt,
  orderHashUtils,
  Order,
  signatureUtils,
  SignedOrder,
  SignatureType
} from '0x.js';
import { HttpClient } from '@0x/connect';
import {
  ensureAddressFormat,
  getAccounts,
  getContractWrappers
} from '../lib/utils/ethereum';
import Watchdog from '../lib/watchdog';
import { factory } from '../logging';
import { IStrategy } from './interfaces';
import { FixedVolatilitySpreadStrategy } from './strategies';

const logger = factory.getLogger('market-maker.MarketMakerWatchdog');

export default class MarketMakerWatchdog extends Watchdog {
  private web3: any;
  private network: number;
  private relayer: string;
  private notifications: IStrategy[];
  private strategies: IStrategy[];

  constructor(
    network: number,
    web3: any,
    relayer: string,
    strategies: IStrategy[],
    notifications: IStrategy[],
    timeout: number = 1000
  ) {
    super(timeout);

    this.network = network;
    this.web3 = web3;
    this.relayer = relayer;
    this.notifications = notifications;
    this.strategies = strategies;
  }

  public async exec() {
    for (const notification of this.notifications) {
      const shouldExecute = await notification.shouldExecute();
      if (shouldExecute) {
        await notification.execute();
      }
    }

    for (const strategy of this.strategies) {
      const shouldExecute = await strategy.shouldExecute();
      if (shouldExecute) {
        const newOrders = await strategy.execute();
        for (const order of newOrders) {
          this.createOrder(order);
        }
      }
    }
  }

  private async createOrder(order: Order) {
    logger.info(`Creating order`);
    const configuredOrder = await this.configureOrder(order);
    const signedOrder = await this.signOrder(configuredOrder);
    await this.submitOrder(signedOrder);
    logger.info(`Created order: ${JSON.stringify(order)}`);
  }

  private async configureOrder(order: Order): Promise<Order> {
    const client = new HttpClient(this.relayer);
    const result = await client.getOrderConfigAsync(order, {
      networkId: this.network
    });
    order.makerFee = result.makerFee;
    order.takerFee = result.takerFee;
    order.feeRecipientAddress = result.feeRecipientAddress;
    order.senderAddress = result.senderAddress;
    order.salt = generatePseudoRandomSalt();
    return order;
  }

  private async signOrder(order: Order): Promise<SignedOrder> {
    const accounts = await getAccounts(this.web3);
    const account = ensureAddressFormat(accounts[0]);
    const orderHash = orderHashUtils.getOrderHashHex(order);
    const signature = await signatureUtils.ecSignHashAsync(
      this.web3.currentProvider,
      orderHash,
      account
    );

    (order as SignedOrder).signature = signature;

    return order as SignedOrder;
  }

  private async submitOrder(order: SignedOrder): Promise<void> {
    const client = new HttpClient(this.relayer);
    client.submitOrderAsync(order, {
      networkId: this.network
    });
  }
}
