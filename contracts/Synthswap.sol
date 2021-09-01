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
    
    bytes32 constant SUSD_CURRENCY_KEY = bytes32("sUSD");
    
    ISwapRouter UniswapRouter;
    ISynthetix Synthetix;
    address sUSD;
    address volumeRewards;
    address aggregationRouterV3;

    event SwapInto(address from, uint amountReceived);
    
    constructor (address _uniswapRouter, address _synthetix, address _sUSD, address _volumeRewards, address _aggregationRouterV3) {
        UniswapRouter = ISwapRouter(_uniswapRouter);
        Synthetix = ISynthetix(_synthetix);
        sUSD = _sUSD;
        volumeRewards = _volumeRewards;
        aggregationRouterV3 = _aggregationRouterV3;
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

    function swapIntoWith1Inch(
        bytes calldata payload,
        bytes32 _destinationSynthCurrencyKey
    ) external override returns (uint) {

        // Make sure to set destReceiver to this contract
        (bool success, bytes memory returnData) = aggregationRouterV3.call(payload);
        require(success);

        IERC20 SUSD = IERC20(sUSD);
        uint sUSDBalance = SUSD.balanceOf(address(this));
        SUSD.approve(address(Synthetix), sUSDBalance);

        uint amountReceived = Synthetix.exchangeWithTrackingForInitiator(
            SUSD_CURRENCY_KEY, //source currency key
            sUSDBalance, //source amount
             _destinationSynthCurrencyKey, //destination currency key
            volumeRewards, // volume rewards address 
            'KWENTA' //tracking code
        );

        emit SwapInto(msg.sender, amountReceived);
        return amountReceived;

    }
    
}