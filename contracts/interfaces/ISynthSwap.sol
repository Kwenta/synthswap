// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title SynthSwap
/// @notice 1Inch + Synthetix Zap for going into a Synth and out of a Synth
interface ISynthSwap {
    /** 
     * @notice Swap into a specified synth
     * @param payload is the transaction data returned by the 1inch API
     * ENSURE: fromAddress is set to caller of this function and destReceiver is set to the Synthswap contract 
     * @param destinationSynthCurrencyKey is the bytes32 representation of a Synthetix currency key
     * @return amount of destination synth received from swap
     */
    function swapInto(
        bytes calldata payload,
        bytes32 destinationSynthCurrencyKey
    ) external payable returns (uint);

    /** 
     * @notice Swap out of a specified synth
     * @param payload is the transaction data returned by the 1inch API
     * ENSURE: fromAddress is set to caller of this function and destReceiver is set to the Synthswap contract 
     * @param destinationToken is the address of a ERC20 token
     * @return amount of destination token received from swap
     */
    function swapOutOf(
        bytes calldata payload,
        address inputSynth,
        bytes32 inputSynthCurrencyKey,
        address destinationToken
    ) external payable returns (uint);
}