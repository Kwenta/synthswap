// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ISynthSwap {

    function swapInto(
        address inputToken, 
        uint inputTokenAmount, 
        bytes calldata uniswapSwapRoute, 
        uint sUSDAmountOutMinimum, 
        bytes32 _destinationSynthCurrencyKey
    ) external returns (uint);
    function swapOutOf(
        address inputSynth, 
        bytes32 sourceSynthCurrencyKey, 
        uint inputSynthAmount, 
        bytes calldata uniswapSwapRoute,
        uint tokenAmountOutMinimum
    ) external returns (uint);

}