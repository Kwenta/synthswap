// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ISynthSwap {

    function swapInto(address inputToken, uint inputTokenAmount, bytes calldata uniswapSwapRoute, bytes32 _destinationSynthCurrencyKey) external;

}