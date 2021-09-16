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
     * @param minOut minimum expected return, else revert transaction
     * @param _data encoded call to 1inch aggregation router V3 to execute swap     
     * @return amount of destination synth received from swap
     */
    function swapInto(
        address inputTokenAddress,
        uint256 inputTokenAmount,
        bytes32 destinationSynthCurrencyKey,
        uint minOut, 
        bytes calldata _data
    ) external payable returns (uint);

    /** 
     * @notice Swap into a specified synth
     * @param destinationSynthCurrencyKey destination synth currency key
     * @param minOut minimum expected return, else revert transaction
     * @param _data encoded call to 1inch aggregation router V3 to execute swap
     * @return amount of destination synth received from swap
     */
    function swapIntoWithETH(
        bytes32 destinationSynthCurrencyKey,
        uint minOut, 
        bytes calldata _data
    ) external payable returns (uint);

    /** 
     * @notice Swap out of a specified synth
     * @param inputSynth contract address of a synth to sell
     * @param inputSynthCurrencyKey source synth currency key
     * @param inputSynthAmount amount of a token to sell
     * @param minOut minimum expected return, else revert transaction
     * @param _data encoded call to 1inch aggregation router V3 to execute swap
     * @return amount of destination token received from swap
     */
    function swapOutOf(
        address inputSynth,
        bytes32 inputSynthCurrencyKey,
        uint256 inputSynthAmount,
        uint minOut, 
        bytes calldata _data
    ) external payable returns (uint);
}