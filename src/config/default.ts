const DEFAULTS = {
  admins: ['team@example.com'],
  email: {
    from: 'team@example.com',
    transporter: {
      host: 'smtp',
      port: 25,
      secure: false,
      logger: true
    }
  },
  wallet: {
    address: null,
    password: null
  },
  relayer: 'https://mobidex.io/relayer/v2',
  network: 1,
  networks: {
    1: {
      http: 'https://mainnet.infura.io/v3'
    },
    42: {
      http: 'https://kovan.infura.io/v3'
    },
    50: {
      http: 'http://localhost:8545'
    }
  },
  assets: [
    {
      assetData:
        '0xf47261b0000000000000000000000000d26114cd6ee289accf82350c8d8487fedb8a0c07',
      bidAmount: '100000000000000000000',
      askAmount: '100000000000000000000',
      volatility: 0.02,
      duration: 60
    },
    {
      assetData:
        '0xf47261b0000000000000000000000000e41d2489571d322189246dafa5ebde1f4699f498',
      bidAmount: '100000000000000000000',
      askAmount: '100000000000000000000',
      volatility: 0.02,
      duration: 60
    },
    {
      assetData:
        '0xf47261b00000000000000000000000001985365e9f78359a9b6ad760e32412f4a445e862',
      bidAmount: '100000000000000000000',
      askAmount: '100000000000000000000',
      volatility: 0.02,
      duration: 60
    },
    {
      assetData:
        '0xf47261b000000000000000000000000042d6622dece394b54999fbd73d108123806f6a18',
      bidAmount: '100000000000000000000',
      askAmount: '100000000000000000000',
      volatility: 0.02,
      duration: 60
    },
    {
      assetData:
        '0xf47261b0000000000000000000000000960b236a07cf122663c4303350609a66a7b288c0',
      bidAmount: '100000000000000000000',
      askAmount: '100000000000000000000',
      volatility: 0.02,
      duration: 60
    },
    {
      assetData:
        '0xf47261b00000000000000000000000009f8f72aa9304c8b593d555f12ef6589cc3a579a2',
      bidAmount: '100000000000000000000',
      askAmount: '100000000000000000000',
      volatility: 0.02,
      duration: 60
    },
    {
      assetData:
        '0xf47261b0000000000000000000000000d26114cd6ee289accf82350c8d8487fedb8a0c07',
      bidAmount: '100000000000000000000',
      askAmount: '100000000000000000000',
      volatility: 0.02,
      duration: 60
    },
    {
      assetData:
        '0xf47261b000000000000000000000000089d24a6b4ccb1b6faa2625fe562bdd9a23260359',
      bidAmount: '100000000000000000000',
      askAmount: '100000000000000000000',
      volatility: 0.02,
      duration: 60
    },
    {
      assetData:
        '0xf47261b00000000000000000000000000000000000085d4780b73119b644ae5ecd22b376',
      bidAmount: '100000000000000000000',
      askAmount: '100000000000000000000',
      volatility: 0.02,
      duration: 60
    },
    {
      assetData:
        '0xf47261b0000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      bidAmount: '100000000000000000000',
      askAmount: '100000000000000000000',
      volatility: 0.02,
      duration: 60
    },
    {
      assetData:
        '0xf47261b00000000000000000000000008e870d67f660d95d5be530380d0ec0bd388289e1',
      bidAmount: '100000000000000000000',
      askAmount: '100000000000000000000',
      volatility: 0.02,
      duration: 60
    }
  ]
};

export default DEFAULTS;
