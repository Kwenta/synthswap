// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title SynthSwap
/// @notice 1Inch + Synthetix Zap for going into a Synth and out of a Synth
interface ISynthSwap {
    /** 
     * @notice Swap into a specified synth
     * @param inputTokenAddress contract address of a token to sell
     * @param inputTokenAmount amount of a token to sell
     * @param destinationSynthCurrencyKey destination synth currency key
     * @param slippage limit of price slippage you are willing to accept in percentage
     * @return amount of destination synth received from swap
     */
    function swapInto(
        address inputTokenAddress,
        uint256 inputTokenAmount,
        bytes32 destinationSynthCurrencyKey,
        uint256 slippage
    ) external payable returns (uint);

    /** 
     * @notice Swap out of a specified synth
     * @param inputSynth contract address of a synth to sell
     * @param inputSynthCurrencyKey source synth currency key
     * @param inputSynthAmount amount of a token to sell
     * @param destinationToken contract address of a token to buy
     * @param slippage limit of price slippage you are willing to accept in percentage
     * @return amount of destination token received from swap
     */
    function swapOutOf(
        address inputSynth,
        bytes32 inputSynthCurrencyKey,
        uint256 inputSynthAmount,
        address destinationToken,
        uint256 slippage
    ) external payable returns (uint);

    /** 
     * @notice Swap into a specified synth
     * @param amount amount of a ETH to sell
     * @param destinationSynthCurrencyKey destination synth currency key
     * @param slippage limit of price slippage you are willing to accept in percentage
     * @return amount of destination synth received from swap
     */
    function swapIntoWithETH(
        uint256 amount,
        bytes32 destinationSynthCurrencyKey,
        uint256 slippage
    ) external payable returns (uint);
}