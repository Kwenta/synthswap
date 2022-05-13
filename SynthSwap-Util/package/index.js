const ethers = require('ethers');
const abiDecoder = require('abi-decoder');

// ABI of 1inch AggregationRouterV4 
// @ address 0x1111111254fb6c44bAC0beD2854e76F90643097d on Ethereum Mainnet
const AggregationRouterV4ABI = [
	{
		inputs: [
			{
				internalType: 'address',
				name: 'weth',
				type: 'address',
			},
			{
				internalType: 'contract IClipperExchangeInterface',
				name: '_clipperExchange',
				type: 'address',
			},
		],
		stateMutability: 'nonpayable',
		type: 'constructor',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: 'bytes32',
				name: 'orderHash',
				type: 'bytes32',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'makingAmount',
				type: 'uint256',
			},
		],
		name: 'OrderFilledRFQ',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'previousOwner',
				type: 'address',
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'newOwner',
				type: 'address',
			},
		],
		name: 'OwnershipTransferred',
		type: 'event',
	},
	{
		inputs: [],
		name: 'DOMAIN_SEPARATOR',
		outputs: [
			{
				internalType: 'bytes32',
				name: '',
				type: 'bytes32',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'LIMIT_ORDER_RFQ_TYPEHASH',
		outputs: [
			{
				internalType: 'bytes32',
				name: '',
				type: 'bytes32',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: 'orderInfo',
				type: 'uint256',
			},
		],
		name: 'cancelOrderRFQ',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'contract IERC20',
				name: 'srcToken',
				type: 'address',
			},
			{
				internalType: 'contract IERC20',
				name: 'dstToken',
				type: 'address',
			},
			{
				internalType: 'uint256',
				name: 'amount',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: 'minReturn',
				type: 'uint256',
			},
		],
		name: 'clipperSwap',
		outputs: [
			{
				internalType: 'uint256',
				name: 'returnAmount',
				type: 'uint256',
			},
		],
		stateMutability: 'payable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address payable',
				name: 'recipient',
				type: 'address',
			},
			{
				internalType: 'contract IERC20',
				name: 'srcToken',
				type: 'address',
			},
			{
				internalType: 'contract IERC20',
				name: 'dstToken',
				type: 'address',
			},
			{
				internalType: 'uint256',
				name: 'amount',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: 'minReturn',
				type: 'uint256',
			},
		],
		name: 'clipperSwapTo',
		outputs: [
			{
				internalType: 'uint256',
				name: 'returnAmount',
				type: 'uint256',
			},
		],
		stateMutability: 'payable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address payable',
				name: 'recipient',
				type: 'address',
			},
			{
				internalType: 'contract IERC20',
				name: 'srcToken',
				type: 'address',
			},
			{
				internalType: 'contract IERC20',
				name: 'dstToken',
				type: 'address',
			},
			{
				internalType: 'uint256',
				name: 'amount',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: 'minReturn',
				type: 'uint256',
			},
			{
				internalType: 'bytes',
				name: 'permit',
				type: 'bytes',
			},
		],
		name: 'clipperSwapToWithPermit',
		outputs: [
			{
				internalType: 'uint256',
				name: 'returnAmount',
				type: 'uint256',
			},
		],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [],
		name: 'destroy',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				components: [
					{
						internalType: 'uint256',
						name: 'info',
						type: 'uint256',
					},
					{
						internalType: 'contract IERC20',
						name: 'makerAsset',
						type: 'address',
					},
					{
						internalType: 'contract IERC20',
						name: 'takerAsset',
						type: 'address',
					},
					{
						internalType: 'address',
						name: 'maker',
						type: 'address',
					},
					{
						internalType: 'address',
						name: 'allowedSender',
						type: 'address',
					},
					{
						internalType: 'uint256',
						name: 'makingAmount',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'takingAmount',
						type: 'uint256',
					},
				],
				internalType: 'struct LimitOrderProtocolRFQ.OrderRFQ',
				name: 'order',
				type: 'tuple',
			},
			{
				internalType: 'bytes',
				name: 'signature',
				type: 'bytes',
			},
			{
				internalType: 'uint256',
				name: 'makingAmount',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: 'takingAmount',
				type: 'uint256',
			},
		],
		name: 'fillOrderRFQ',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'payable',
		type: 'function',
	},
	{
		inputs: [
			{
				components: [
					{
						internalType: 'uint256',
						name: 'info',
						type: 'uint256',
					},
					{
						internalType: 'contract IERC20',
						name: 'makerAsset',
						type: 'address',
					},
					{
						internalType: 'contract IERC20',
						name: 'takerAsset',
						type: 'address',
					},
					{
						internalType: 'address',
						name: 'maker',
						type: 'address',
					},
					{
						internalType: 'address',
						name: 'allowedSender',
						type: 'address',
					},
					{
						internalType: 'uint256',
						name: 'makingAmount',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'takingAmount',
						type: 'uint256',
					},
				],
				internalType: 'struct LimitOrderProtocolRFQ.OrderRFQ',
				name: 'order',
				type: 'tuple',
			},
			{
				internalType: 'bytes',
				name: 'signature',
				type: 'bytes',
			},
			{
				internalType: 'uint256',
				name: 'makingAmount',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: 'takingAmount',
				type: 'uint256',
			},
			{
				internalType: 'address payable',
				name: 'target',
				type: 'address',
			},
		],
		name: 'fillOrderRFQTo',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'payable',
		type: 'function',
	},
	{
		inputs: [
			{
				components: [
					{
						internalType: 'uint256',
						name: 'info',
						type: 'uint256',
					},
					{
						internalType: 'contract IERC20',
						name: 'makerAsset',
						type: 'address',
					},
					{
						internalType: 'contract IERC20',
						name: 'takerAsset',
						type: 'address',
					},
					{
						internalType: 'address',
						name: 'maker',
						type: 'address',
					},
					{
						internalType: 'address',
						name: 'allowedSender',
						type: 'address',
					},
					{
						internalType: 'uint256',
						name: 'makingAmount',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'takingAmount',
						type: 'uint256',
					},
				],
				internalType: 'struct LimitOrderProtocolRFQ.OrderRFQ',
				name: 'order',
				type: 'tuple',
			},
			{
				internalType: 'bytes',
				name: 'signature',
				type: 'bytes',
			},
			{
				internalType: 'uint256',
				name: 'makingAmount',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: 'takingAmount',
				type: 'uint256',
			},
			{
				internalType: 'address payable',
				name: 'target',
				type: 'address',
			},
			{
				internalType: 'bytes',
				name: 'permit',
				type: 'bytes',
			},
		],
		name: 'fillOrderRFQToWithPermit',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: 'maker',
				type: 'address',
			},
			{
				internalType: 'uint256',
				name: 'slot',
				type: 'uint256',
			},
		],
		name: 'invalidatorForOrderRFQ',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'owner',
		outputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'renounceOwnership',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'contract IERC20',
				name: 'token',
				type: 'address',
			},
			{
				internalType: 'uint256',
				name: 'amount',
				type: 'uint256',
			},
		],
		name: 'rescueFunds',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'contract IAggregationExecutor',
				name: 'caller',
				type: 'address',
			},
			{
				components: [
					{
						internalType: 'contract IERC20',
						name: 'srcToken',
						type: 'address',
					},
					{
						internalType: 'contract IERC20',
						name: 'dstToken',
						type: 'address',
					},
					{
						internalType: 'address payable',
						name: 'srcReceiver',
						type: 'address',
					},
					{
						internalType: 'address payable',
						name: 'dstReceiver',
						type: 'address',
					},
					{
						internalType: 'uint256',
						name: 'amount',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'minReturnAmount',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'flags',
						type: 'uint256',
					},
					{
						internalType: 'bytes',
						name: 'permit',
						type: 'bytes',
					},
				],
				internalType: 'struct AggregationRouterV4.SwapDescription',
				name: 'desc',
				type: 'tuple',
			},
			{
				internalType: 'bytes',
				name: 'data',
				type: 'bytes',
			},
		],
		name: 'swap',
		outputs: [
			{
				internalType: 'uint256',
				name: 'returnAmount',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: 'spentAmount',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: 'gasLeft',
				type: 'uint256',
			},
		],
		stateMutability: 'payable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: 'newOwner',
				type: 'address',
			},
		],
		name: 'transferOwnership',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: 'amount',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: 'minReturn',
				type: 'uint256',
			},
			{
				internalType: 'uint256[]',
				name: 'pools',
				type: 'uint256[]',
			},
		],
		name: 'uniswapV3Swap',
		outputs: [
			{
				internalType: 'uint256',
				name: 'returnAmount',
				type: 'uint256',
			},
		],
		stateMutability: 'payable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'int256',
				name: 'amount0Delta',
				type: 'int256',
			},
			{
				internalType: 'int256',
				name: 'amount1Delta',
				type: 'int256',
			},
			{
				internalType: 'bytes',
				name: '',
				type: 'bytes',
			},
		],
		name: 'uniswapV3SwapCallback',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address payable',
				name: 'recipient',
				type: 'address',
			},
			{
				internalType: 'uint256',
				name: 'amount',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: 'minReturn',
				type: 'uint256',
			},
			{
				internalType: 'uint256[]',
				name: 'pools',
				type: 'uint256[]',
			},
		],
		name: 'uniswapV3SwapTo',
		outputs: [
			{
				internalType: 'uint256',
				name: 'returnAmount',
				type: 'uint256',
			},
		],
		stateMutability: 'payable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address payable',
				name: 'recipient',
				type: 'address',
			},
			{
				internalType: 'contract IERC20',
				name: 'srcToken',
				type: 'address',
			},
			{
				internalType: 'uint256',
				name: 'amount',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: 'minReturn',
				type: 'uint256',
			},
			{
				internalType: 'uint256[]',
				name: 'pools',
				type: 'uint256[]',
			},
			{
				internalType: 'bytes',
				name: 'permit',
				type: 'bytes',
			},
		],
		name: 'uniswapV3SwapToWithPermit',
		outputs: [
			{
				internalType: 'uint256',
				name: 'returnAmount',
				type: 'uint256',
			},
		],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'contract IERC20',
				name: 'srcToken',
				type: 'address',
			},
			{
				internalType: 'uint256',
				name: 'amount',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: 'minReturn',
				type: 'uint256',
			},
			{
				internalType: 'bytes32[]',
				name: 'pools',
				type: 'bytes32[]',
			},
		],
		name: 'unoswap',
		outputs: [
			{
				internalType: 'uint256',
				name: 'returnAmount',
				type: 'uint256',
			},
		],
		stateMutability: 'payable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'contract IERC20',
				name: 'srcToken',
				type: 'address',
			},
			{
				internalType: 'uint256',
				name: 'amount',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: 'minReturn',
				type: 'uint256',
			},
			{
				internalType: 'bytes32[]',
				name: 'pools',
				type: 'bytes32[]',
			},
			{
				internalType: 'bytes',
				name: 'permit',
				type: 'bytes',
			},
		],
		name: 'unoswapWithPermit',
		outputs: [
			{
				internalType: 'uint256',
				name: 'returnAmount',
				type: 'uint256',
			},
		],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		stateMutability: 'payable',
		type: 'receive',
	},
];

const swapFuncSelector = '7c025200000000000000000000000000';
const uniswapV3SwapFuncSelector = 'e449022e000000000000000000000000';

// query parameters:
// see https://docs.1inch.io/docs/aggregation-protocol/api/swap-params#description-of-query-parameters

// response parameters:
// https://docs.1inch.io/docs/aggregation-protocol/api/swap-params#description-of-response-parameters

// Swagger API: 
// https://docs.1inch.io/docs/aggregation-protocol/api/swagger

/// getFormatedSwapData returns data required by SynthSwap to execute swaps
/// @param response: from /v4.0/10/swap
/// @param synthwapAddress: address of deployed SynthSwap contract
/// @returns Object: {functionSelector, data}
///  - functionSelector: function intended to be used by 1inch for swap
///  - data: route data for swap on 1inch
const getFormatedSwapData = (response, synthswapAddress) => {
	if (synthswapAddress.length !== 42) {
		throw 'Invalid SynthSwap Address';
	}

	// tx calldata generated by 1inch
	const calldata = response.tx.data;

	// swapFuncSelector or uniswapV3SwapFuncSelector
	const funcSelector = calldata.substring(2, 34);

	// the "functionSelector" is the function used via 1inch to execute swap. Depending on
	// whether we are swaping into or out of a synth, if the functionSelector == "swap",
	// then we would either call SynthSwap.swapOutOf() or SynthSwap.swapInto().
	// If the functionSelector == "uniswapV3Swap", then we would either
	// call SynthSwap.uniswapSwapOutOf() or SynthSwap.uniswapSwapInto().

	if (funcSelector === uniswapV3SwapFuncSelector) {
		// no data manipulation needed
		return {
			functionSelector: 'uniswapV3Swap',
			data: calldata,
		};
	} else if (funcSelector === swapFuncSelector) {
		// deconstruct response
		abiDecoder.addABI(AggregationRouterV4ABI);
		const decoded = abiDecoder.decodeMethod(calldata);

		const abiCoder = ethers.utils.defaultAbiCoder;
		const caller = decoded.params[0].value;
		const swapDescription = {
			srcToken: decoded.params[1].value[0],
			dstToken: decoded.params[1].value[1],
			srcReceiver: decoded.params[1].value[2],
			// the following will be dynamically changed
			// depending on which leg of the swap 1inch is used for.
			// not necessary to understand in this scope, however
			dstReceiver: synthswapAddress,
			amount: decoded.params[1].value[4],
			minReturnAmount: decoded.params[1].value[5],
			flags: decoded.params[1].value[6],
			permit: decoded.params[1].value[7],
		};

		// the "data" returned, regardless of the functionSelector,
		// will be passed as a parameter to whichever SynthSwap function
		// is being called (i.e. SynthSwap.swapOutOf(), SynthSwap.uniswapSwapInto(), etc)

		const dataForSynthSwap = abiCoder.encode(
			[
				'address caller',
				'tuple(address srcToken, address dstToken, address srcReceiver, address dstReceiver, uint256 amount, uint256 minReturnAmount, uint256 flags, bytes permit) desc',
				'bytes data',
			],
			[caller, swapDescription, decoded.params[2].value]
		);

		return {
			functionSelector: 'swap',
			data: dataForSynthSwap,
		};
	} else {
		throw 'Response contains invalid tx function selector: 0x' + funcSelector;
	}
};

module.exports = getFormatedSwapData;

/* EXAMPLES

################################
Example: 
    ETH -> sUSD
    ("swap")
################################

Request URL:
https://api.1inch.io/v4.0/10/swap?
    fromTokenAddress=0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE&
    toTokenAddress=0x8c6f28f2F1A3C87F0f938b96d27520d9751ec8d9&
    amount=10000000000000000&
    fromAddress=0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE&
    slippage=1&disableEstimate=true

Response Object:
{
  "fromToken": {
    "symbol": "ETH",
    "name": "Ethereum",
    "decimals": 18,
    "address": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    "logoURI": "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png"
  },
  "toToken": {
    "symbol": "sUSD",
    "name": "Synth sUSD",
    "decimals": 18,
    "logoURI": "https://tokens.1inch.io/0x57ab1ec28d129707052df4df418d58a2d46d5f51.png",
    "address": "0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9"
  },
  "toTokenAmount": "21897234126384731523",
  "fromTokenAmount": "10000000000000000",
  "protocols": [
    [
      [
        {
          "name": "OPTIMISM_UNISWAP_V3",
          "part": 100,
          "fromTokenAddress": "0x4200000000000000000000000000000000000006",
          "toTokenAddress": "0x68f180fcce6836688e9084f035309e29bf0a2095"
        }
      ],
      [
        {
          "name": "OPTIMISM_UNISWAP_V3",
          "part": 100,
          "fromTokenAddress": "0x68f180fcce6836688e9084f035309e29bf0a2095",
          "toTokenAddress": "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1"
        }
      ],
      [
        {
          "name": "OPTIMISM_UNISWAP_V3",
          "part": 100,
          "fromTokenAddress": "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
          "toTokenAddress": "0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9"
        }
      ]
    ],
    [
      [
        {
          "name": "OPTIMISM_UNISWAP_V3",
          "part": 100,
          "fromTokenAddress": "0x4200000000000000000000000000000000000006",
          "toTokenAddress": "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58"
        }
      ],
      [
        {
          "name": "OPTIMISM_UNISWAP_V3",
          "part": 100,
          "fromTokenAddress": "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58",
          "toTokenAddress": "0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9"
        }
      ]
    ],
    [
      [
        {
          "name": "OPTIMISM_UNISWAP_V3",
          "part": 100,
          "fromTokenAddress": "0x4200000000000000000000000000000000000006",
          "toTokenAddress": "0x8700daec35af8ff88c16bdf0418774cb3d7599b4"
        }
      ],
      [
        {
          "name": "OPTIMISM_UNISWAP_V3",
          "part": 46,
          "fromTokenAddress": "0x8700daec35af8ff88c16bdf0418774cb3d7599b4",
          "toTokenAddress": "0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9"
        },
        {
          "name": "OPTIMISM_UNISWAP_V3",
          "part": 54,
          "fromTokenAddress": "0x8700daec35af8ff88c16bdf0418774cb3d7599b4",
          "toTokenAddress": "0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9"
        }
      ]
    ]
  ],
  "tx": {
    "from": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    "to": "0x1111111254760f7ab3f16433eea9304126dcd199",
    "data": "0x7c025200000000000000000000000000..................",
    "value": "10000000000000000",
    "gas": 0,
    "gasPrice": "1000000"
  }
}

Decoded tx.data:
{
  "name": "swap",
  "params": [
    {
      "name": "caller",
      "value": "0x94bc2a1c732bcad7343b25af48385fe76e08734f",
      "type": "address"
    },
    {
      "name": "desc",
      "value": [
        "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        "0x8c6f28f2F1A3C87F0f938b96d27520d9751ec8d9",
        "0x94Bc2a1C732BcAd7343B25af48385Fe76E08734f",
        "0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa",
        "10000000000000000",
        "21678261785120884207",
        "1",
        "0x"
      ],
      "type": "tuple"
    },
    {
      "name": "data",
      "value": "0x00000..........................",
      "type": "bytes"
    }
  ]
}


################################
Example: 
    ETH -> LINK
    ("uniswapV3Swap")
################################

Request URL:
https://api.1inch.io/v4.0/10/swap?
    fromTokenAddress=0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE&
    toTokenAddress=0x350a791bfc2c21f9ed5d10980dad2e2638ffa7f6&
    amount=10000000000000&
    fromAddress=0x6e1768574dC439aE6ffCd2b0A0f218105f2612c6&
    slippage=1

Response Object:
{
  "fromToken": {
    "symbol": "ETH",
    "name": "Ethereum",
    "decimals": 18,
    "address": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    "logoURI": "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png"
  },
  "toToken": {
    "symbol": "LINK",
    "name": "Chainlink",
    "decimals": 18,
    "logoURI": "https://tokens.1inch.io/0x350a791bfc2c21f9ed5d10980dad2e2638ffa7f6.png",
    "address": "0x350a791bfc2c21f9ed5d10980dad2e2638ffa7f6"
  },
  "toTokenAmount": "3227112792836520",
  "fromTokenAmount": "10000000000000",
  "protocols": [
    [
      [
        {
          "name": "OPTIMISM_UNISWAP_V3",
          "part": 100,
          "fromTokenAddress": "0x4200000000000000000000000000000000000006",
          "toTokenAddress": "0x350a791bfc2c21f9ed5d10980dad2e2638ffa7f6"
        }
      ]
    ]
  ],
  "tx": {
    "from": "0x6e1768574dC439aE6ffCd2b0A0f218105f2612c6",
    "to": "0x1111111254760f7ab3f16433eea9304126dcd199",
    "data": "0xe449022e000000000000000000000000000000000000000000000000000009184e72a000000000000000000000000000000000000000000000000000000b59b10a8ceb7a00000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000001c000000000000000000000008531e48a8611729185be9eaad945acbd6b32e256cfee7c08",
    "value": "10000000000000",
    "gas": 144166,
    "gasPrice": "1000000"
  }
}

Decoded tx.data:
{
  "name": "uniswapV3Swap",
  "params": [
    {
      "name": "amount",
      "value": "10000000000000",
      "type": "uint256"
    },
    {
      "name": "minReturn",
      "value": "3194841664908154",
      "type": "uint256"
    },
    {
      "name": "pools",
      "value": [
        "86844066927987146567678238757276339307725153377119053955125486606028251521622"
      ],
      "type": "uint256[]"
    }
  ]
}

*/
