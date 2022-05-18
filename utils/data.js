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

exports.AggregationRouterV4ABI = AggregationRouterV4ABI;