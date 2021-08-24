// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/ISynthSwap.sol";
import "./interfaces/IERC20.sol";

interface ISwapRouter {
    struct ExactInputParams {
        bytes path;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
    }
    
    function exactInput(
        ExactInputParams calldata params
    ) external returns (uint256 amountOut);
}

interface ISynthetix {
    function exchangeWithTrackingForInitiator(
        bytes32 sourceCurrencyKey,
        uint sourceAmount,
        bytes32 destinationCurrencyKey,
        address rewardAddress,
        bytes32 trackingCode
    ) external returns (uint amountReceived);
}

contract SynthSwap is ISynthSwap {
    
    bytes32 constant SUSD_CURRENCY_KEY = bytes32(0x7355534400000000000000000000000000000000000000000000000000000000);
    
    ISwapRouter UniswapRouter;
    ISynthetix Synthetix;
    address sUSD;
    address volumeRewards;

    event SwapInto(address from, uint amountReceived);
    event SwapOutOf(address from, uint amountReceived);
    
    constructor (address _uniswapRouter, address _synthetix, address _sUSD, address _volumeRewards) {
        UniswapRouter = ISwapRouter(_uniswapRouter);
        // TODO look into address resolver
        Synthetix = ISynthetix(_synthetix);
        sUSD = _sUSD;
        volumeRewards = _volumeRewards;
    }
    
    function swapInto(
        address inputToken, 
        uint inputTokenAmount, 
        bytes calldata uniswapSwapRoute, 
        uint sUSDAmountOutMinimum,
        bytes32 _destinationSynthCurrencyKey
    ) external override returns (uint) {
        
        IERC20 InputERC20 = IERC20(inputToken);
        InputERC20.transferFrom(msg.sender, address(this), inputTokenAmount);
        
        // uniswap swap
        InputERC20.approve(address(UniswapRouter), inputTokenAmount);
        uint256 amountOut = UniswapRouter.exactInput(
            ISwapRouter.ExactInputParams(
                uniswapSwapRoute, 
                address(this), 
                block.timestamp + 20 minutes, 
                inputTokenAmount,
                sUSDAmountOutMinimum
            )
        );
        
        // synthetix exchange
        IERC20(sUSD).approve(address(Synthetix), amountOut);
        uint amountReceived = Synthetix.exchangeWithTrackingForInitiator(
            SUSD_CURRENCY_KEY, //source currency key
            amountOut, //source amount
             _destinationSynthCurrencyKey, //destination currency key
            volumeRewards, // volume rewards address
            'KWENTA' //tracking code
        );

        emit SwapInto(msg.sender, amountReceived);
        return amountReceived;
        
    }

    /// @notice swapOutOf swaps a fixed amount (`inputSynthAmount`) of 'inputSynth` for a maximum 
    /// possible amount of `outputToken` through an intermediary pool.
    /// @dev The calling address must approve this contract to spend at least `inputSynthAmount` 
    /// worth of its 'inputSynth` for this function to succeed.
    /// The target ERC20 token (destination) is defined via `uniswapSwapRoute`.
    /// @param inputSynth Synth to be swapped
    /// @param inputSynthAmount The amount of synth to be swapped
    /// @param uniswapSwapRoute sequence of token addresses and poolFees that define the pools used in the swaps
    /// @param tokenAmountOutMinimum minimum amount of target token required for this function to succeed
    function swapOutOf(
        address inputSynth, 
        bytes32 sourceSynthCurrencyKey,
        uint inputSynthAmount,
        bytes calldata uniswapSwapRoute,
        uint tokenAmountOutMinimum
    ) external override returns (uint256 amountReceived) {

        // Transfer `inputSynthAmount` of inputSynth to this contract.
        IERC20 InputERC20 = IERC20(inputSynth);
        InputERC20.transferFrom(msg.sender, address(this), inputSynthAmount);

        // Approve the Synthetix router to spend `inputSynth`.
        InputERC20.approve(address(Synthetix), inputSynthAmount);

        // Swap `inputSynth` with sUSD by providing both the source and destination currency keys. 
        uint256 amountOut = Synthetix.exchangeWithTrackingForInitiator(
            sourceSynthCurrencyKey, // source currency key
            inputSynthAmount, // source amount
            SUSD_CURRENCY_KEY, // destination currency key
            volumeRewards, // volume rewards address
            'KWENTA' // tracking code
        );

        // Approve the Uniswap router to spend sUSD.
        InputERC20.approve(address(UniswapRouter), amountOut);

        // Multiple pool swaps are encoded through bytes called a `path`. A path is a sequence of token addresses 
        // and poolFees that define the pools used in the swaps.
        // The format for pool encoding is (tokenIn, fee, tokenOut/tokenIn, fee, tokenOut) where tokenIn/tokenOut 
        // parameter is the shared token across the pools.
        ISwapRouter.ExactInputParams memory params =
            ISwapRouter.ExactInputParams(
                uniswapSwapRoute, // specifies final token destination
                msg.sender, 
                block.timestamp + 20 minutes, 
                amountOut,
                tokenAmountOutMinimum
            );

        // Executes the swap.
        amountReceived = UniswapRouter.exactInput(params);
        emit SwapOutOf(msg.sender, amountReceived);
    }
    
}