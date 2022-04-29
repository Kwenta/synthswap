// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title SynthSwap
/// @notice 1Inch + Synthetix utlity contract for going into a Synth and out of a Synth
interface ISynthSwap {
    /** 
     * @notice Swap into a specified synth
     * @param destSynthCurrencyKey is the bytes32 representation of a Synthetix currency key
     * @param sourceSynthAddress is the address of destination synth
     * @param _data is the transaction data returned by the 1inch API 
     * @return amount of destination synth received from swap
     */
    function swapInto(
        bytes32 destSynthCurrencyKey,
        address sourceSynthAddress,
        bytes calldata _data
    ) external payable returns (uint);

    /** 
     * @notice swap out of a specified synth
     * @dev make sure synthetix is approved to spend sourceAmount
     * @param sourceSynthCurrencyKey is the bytes32 representation of a Synthetix currency key
     * @param sourceSynthAddress is the address of source synth
     * @param sourceAmount is the amount of sourceSynth to swap out of
     * @param _data is the transaction data returned by the 1inch API
     * ENSURE: fromAddress is set to the Synthswap contract and destReceiver is set to caller of this function
     * @return amount of destination asset received from swap
     */
    function swapOutOf(
        bytes32 sourceSynthCurrencyKey,
        address sourceSynthAddress,
        uint sourceAmount,
        bytes calldata _data
    ) external returns (uint);
}