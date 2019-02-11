import { factory } from '../logging';

const logger = factory.getLogger('watchdog');

export default class Watchdog {
  private timeout: number;
  private timer: any;
  private running: boolean;

  constructor(timeout = 1000) {
    this.timeout = timeout;
    this.timer = null;
  }

  public start() {
    if (this.timer === null) {
      this.run();
    }
  }

  public stop() {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  public async run() {
    try {
      this.running = true;
      await this.exec();
    } catch (err) {
      logger.warn(`watchdog error: ${err.message}`, err);
    } finally {
      this.running = false;
    }

    this.timer = setTimeout(this.run.bind(this), this.timeout);
  }

  public async wait() {
    const timeout = Math.floor(this.timeout / 2);

    return new Promise((resolve, reject) => {
      const timer = setInterval(() => {
        if (!this.running) {
          clearInterval(timer);
          resolve();
        }
      }, timeout);
    });
  }

  public async exec() {
    throw new Error('You have to implement the method exec()!');
  }
}
