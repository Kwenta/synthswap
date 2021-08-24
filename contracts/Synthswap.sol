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
                0 // TODO calculate and pass through minimum slippage to protect users when swapping
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
    
}