import config from '../config';
import { getWeb3 } from '../lib/utils/ethereum';
import { loadWalletProvider } from '../lib/wallet';
import { factory } from '../logging';
import MarketMakerWatchdog from './watchdog';
import { NotifyRefillEthNecessaryStrategy } from './notifications';
import { FixedVolatilitySpreadStrategy } from './strategies';

const logger = factory.getLogger('market-maker');

async function main() {
  const { address, password } = config.get('wallet');

  if (!address) {
    logger.warn('No address provided');
    return;
  }

  if (!password) {
    logger.warn('No password provided');
    return;
  }

  const network = parseInt(config.get('network'), 10);
  const provider = await loadWalletProvider(network, password);
  const web3 = getWeb3(provider);
  const strategies = [];
  for (const strategyConfig of config.get('assets')) {
    strategies.push(
      new FixedVolatilitySpreadStrategy(
        network,
        web3,
        strategyConfig['assetData'],
        strategyConfig['bidAmount'],
        strategyConfig['askAmount'],
        strategyConfig['volatility'],
        strategyConfig['duration']
      )
    );
  }
  const notifications = [
    new NotifyRefillEthNecessaryStrategy(
      web3,
      config.get('admins'),
      config.get('minimum-ethereum')
    )
  ];

  logger.info('starting market maker');
  new MarketMakerWatchdog(
    network,
    web3,
    config.get('relayer'),
    strategies,
    notifications
  ).start();
  logger.info('started market maker');
}

main();
