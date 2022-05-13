How to use:

Example:
```
let result = getFormatedSwapData(
	1inchAPISwapResponse,
	synthswapAddress
);
```

result.functionSelector = "swap" || "uniswapV3Swap"
result.data = calldata to be passed to contract functions

`1inchAPISwapResponse` will be structured this way:
```
1inchAPISwapResponse == {
	fromToken: {
		symbol: 'ETH',
		name: 'Ethereum',
		decimals: 18,
		address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
		logoURI:
			'https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png',
	},
	toToken: {
		symbol: 'LINK',
		name: 'Chainlink',
		decimals: 18,
		logoURI:
			'https://tokens.1inch.io/0x350a791bfc2c21f9ed5d10980dad2e2638ffa7f6.png',
		address: '0x350a791bfc2c21f9ed5d10980dad2e2638ffa7f6',
	},
	toTokenAmount: '3227112792836520',
	fromTokenAmount: '10000000000000',
	protocols: [
		[
			[
				{
					name: 'OPTIMISM_UNISWAP_V3',
					part: 100,
					fromTokenAddress: '0x4200000000000000000000000000000000000006',
					toTokenAddress: '0x350a791bfc2c21f9ed5d10980dad2e2638ffa7f6',
				},
			],
		],
	],
	tx: {
		from: '0x6e1768574dC439aE6ffCd2b0A0f218105f2612c6',
		to: '0x1111111254760f7ab3f16433eea9304126dcd199',
		data: '0xe449022e0000000000000..............................',
		value: '10000000000000',
		gas: 144166,
		gasPrice: '1000000',
	},
};
```