# SynthSwap

Synthswap is a simple utlity contract that combines a 1Inch swap with the Synthetix exchanger enabling low slippage swaps into and out of synths.

See [ISynthSwap.sol](contracts/interfaces/ISynthSwap.sol) for the current interface.

## Rational
 
At the time of writing this there are no single step methods for swapping from any ERC20 to any synth on Optimistic layer 2. The best way for a trader to begin trading on Kwenta is to swap their tokens for sUSD on Uniswap (or 1inch) and then swap their sUSD for their desired synth on Kwenta.

Effectively, Synthswap combines the above process into a singular zap. This enables Kwenta to provide liquidity for swaps like USDT -> sTSLA or sETH -> ETH all within one transaction (excluding approvals) and eventually one interface.
## Documentation

In `Synthswap.sol` there are two core functions: `swapInto` and `swapOutOf`. Both these functions take in a data payload that is returned from the [1inch API](https://docs.1inch.io/api/quote-swap). This method leverages 1inch's off-chain routing functionality. For `swapInto`, `delegatecall` is used to execute the 1inch swap in the context of the EOA.* And for `swapOutOf`, `call` is used to execute the 1inch swap in the context of the contract.*

It is also important to note that under the hood 1inch relies on two entrypoint functions in [AggregationRouterV3.sol](https://etherscan.io/address/0x11111112542d85b3ef69ae05771c2dccff4faa26#code), `unoswap` for Uniswap like swaps, and `swap` for everything else. You will see these function selectors in our test payloads as `0x2e95b6c8` and `0x7c025200`, respectively.

The remaining parameters are dedicated to routing the Synthetix leg of the swap. The two Synthetix functions used are `exchangeWithTrackingForInitiator` (see [SIP-140](https://sips.synthetix.io/sips/sip-140/) for details) and `exchangeWithTracking`. The former is used to settle funds with the EOA caller and the latter is used to settle funds within the contract.

*Subject to change with testing.

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