# SynthSwap

This is a simple utlity contract that combines a 1Inch swap with the Synthetix exchanger enabling low slippage swaps into synths. See [ISynthSwap.sol](contracts/interfaces/ISynthSwap.sol) for the current interface.

## Prepping Local Development

Install local dependencies:
```
npm install
```
Provide `ARCHIVE_NODE_URL` in `.env`. [Alchemy](https://alchemyapi.io/) has free archive nodes:
```
ARCHIVE_NODE_URL=<YOUR_ARCHIVE_NODE_PROVIDER_HERE>
```

## Deploy to Mainnet Fork


Run a forked network locally:

```
npm run fork
```

Deploy Synthswap onto local forked network:

```
npm run deploy:fork
```

## Running Tests

To run all tests (unit and integration) under `/test`
```
npx hardhat test
```

To run integration tests:
```
npm run test:integration
```