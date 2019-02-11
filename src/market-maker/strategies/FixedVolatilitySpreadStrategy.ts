import { assetDataUtils, BigNumber, Order, SignedOrder } from '0x.js';
import * as contractAddresses from '@0x/contract-addresses';
import { Web3Wrapper } from '@0x/web3-wrapper';
import {
  ensureAddressFormat,
  getAccounts,
  getContractWrappers,
  getTokenByAssetData,
  NULL_ADDRESS,
  ZERO
} from '../../lib/utils/ethereum';
import { getBuyPrice, getSellPrice } from '../../lib/utils/kyber';
import { factory } from '../../logging';

const logger = factory.getLogger('market-maker.FixedVolatilitySpreadStrategy');

export class FixedVolatilitySpreadStrategy {
  private network: number;
  private web3: any;
  private assetData: string;
  private bidAmount: BigNumber;
  private askAmount: BigNumber;
  private volatility: number;
  private duration: number;

  private orders: Order[];

  constructor(
    network: number,
    web3: any,
    assetData: string,
    bidAmount: string | number | BigNumber,
    askAmount: string | number | BigNumber,
    volatility: number,
    duration: number
  ) {
    this.network = network;
    this.web3 = web3;
    this.assetData = assetData;
    this.bidAmount = new BigNumber(bidAmount);
    this.askAmount = new BigNumber(askAmount);
    this.duration = duration;

    this.orders = [];
  }

  public async shouldExecute(): Promise<boolean> {
    this.pruneOrders();
    return this.getActiveOrderCount() === 0;
  }

  public async execute(): Promise<Order[]> {
    logger.info(`Creating orders for asset data: ${this.assetData}`);

    const wrappers = await getContractWrappers(this.network);
    const exchangeAddress = await wrappers.exchange.address;
    const accounts = await getAccounts(this.web3);
    const account = ensureAddressFormat(accounts[0]);
    const addresses = contractAddresses.getContractAddressesForNetworkOrThrow(
      this.network
    );
    const WETH9AssetData = assetDataUtils.encodeERC20AssetData(
      addresses.etherToken
    );
    const token = await getTokenByAssetData(this.network, this.assetData);
    const priceInWEI = await getSellPrice(
      this.web3,
      token.address,
      new BigNumber(2)
    );
    const priceInETH = Web3Wrapper.toUnitAmount(priceInWEI, 18);
    const unitBidAmount = Web3Wrapper.toUnitAmount(
      this.bidAmount,
      token.decimals
    );
    const unitAskAmount = Web3Wrapper.toUnitAmount(
      this.askAmount,
      token.decimals
    );
    const delta = new BigNumber(this.volatility).times(2).div(6);

    this.orders = [];

    for (let i = 3; i >= 1; --i) {
      const bidPrice = priceInETH.minus(delta.times(i));
      const order: Order = {
        exchangeAddress: addresses.exchange,
        senderAddress: NULL_ADDRESS,
        feeRecipientAddress: NULL_ADDRESS,
        makerAddress: account,
        takerAddress: NULL_ADDRESS,
        makerAssetAmount: Web3Wrapper.toBaseUnitAmount(
          unitAskAmount.times(priceInETH),
          token.decimals
        ),
        takerAssetAmount: Web3Wrapper.toBaseUnitAmount(
          unitAskAmount,
          token.decimals
        ),
        makerAssetData: WETH9AssetData,
        takerAssetData: this.assetData,
        makerFee: ZERO,
        takerFee: ZERO,
        salt: ZERO,
        expirationTimeSeconds: new BigNumber(
          Math.ceil(new Date().getTime() / 1000) + 60
        )
      };
      this.orders.push(order);
    }

    for (let i = 1; i <= 3; ++i) {
      const askPrice = priceInETH.plus(delta.times(i));
      const order: Order = {
        exchangeAddress: addresses.exchange,
        senderAddress: NULL_ADDRESS,
        feeRecipientAddress: NULL_ADDRESS,
        makerAddress: account,
        takerAddress: NULL_ADDRESS,
        makerAssetAmount: Web3Wrapper.toBaseUnitAmount(
          unitAskAmount,
          token.decimals
        ),
        takerAssetAmount: Web3Wrapper.toBaseUnitAmount(
          unitAskAmount.times(priceInETH),
          token.decimals
        ),
        makerAssetData: this.assetData,
        takerAssetData: WETH9AssetData,
        makerFee: ZERO,
        takerFee: ZERO,
        salt: ZERO,
        expirationTimeSeconds: new BigNumber(
          Math.ceil(new Date().getTime() / 1000) + 60
        )
      };
      this.orders.push(order);
    }

    logger.info(
      `Created ${this.orders.length} orders for asset data: ${this.assetData}`
    );

    return this.orders.slice();
  }

  private pruneOrders(): void {
    const now = Math.floor(new Date().getTime() / 1000);
    this.orders = this.orders.filter(order =>
      order.expirationTimeSeconds.gt(now)
    );
  }

  private getActiveOrderCount(): number {
    return this.orders.length;
  }
}
