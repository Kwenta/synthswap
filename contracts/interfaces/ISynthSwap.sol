// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title SynthSwap
/// @notice 1Inch + Synthetix utlity contract for going into a Synth and out of a Synth
interface ISynthSwap {
    /// @notice swap into a specified synth
    /// @dev supports ETH -> Synth conversions
    /// @param _destSynthCurrencyKey is the bytes32 representation of a Synthetix currency key
    /// @param _data is the transaction data returned by the 1inch API 
    /// @return amount of destination synth received from swap
    function swapInto(
        bytes32 _destSynthCurrencyKey,
        bytes calldata _data
    ) external payable returns (uint);

    /// @notice swap out of a specified synth
    /// @dev make sure synthetix is approved to spend sourceAmount
    /// @dev supports Synth -> ETH conversions
    /// @param _sourceSynthCurrencyKey is the bytes32 representation of a Synthetix currency key
    /// @param _sourceAmount is the amount of sourceSynth to swap out of
    /// @param _data is the transaction data returned by the 1inch API
    /// @return amount of destination asset received from swap
    function swapOutOf(
        bytes32 _sourceSynthCurrencyKey,
        uint _sourceAmount,
        bytes calldata _data
    ) external returns (uint);

    /// @notice swap into a specified synth
    /// @dev supports ETH -> Synth conversions
    /// @param _destSynthCurrencyKey is the bytes32 representation of a Synthetix currency key
    /// @param _sourceTokenAddress is the address of the source token
    /// @param _amount is the amout of source token to be swapped
    /// @param _data is the transaction data returned by the 1inch API 
    /// @return amount of destination synth received from swap
    function uniswapSwapInto(
        bytes32 _destSynthCurrencyKey,
        address _sourceTokenAddress,
        uint _amount,
        bytes calldata _data
    ) external payable returns (uint);

    /// @notice swap out of a specified synth
    /// @dev make sure synthetix is approved to spend sourceAmount
    /// @dev supports Synth -> ETH conversions
    /// @param _sourceSynthCurrencyKey is the bytes32 representation of a Synthetix currency key
    /// @param _amountOfSynth is the amount of sourceSynth to swap out of
    /// @param _expectedAmountOfSUSDFromSwap is expected amount of sUSD to be returned from Synthetix portion of swap
    /// @param _data is the transaction data returned by the 1inch API
    /// @return amount of destination asset received from swap
    function uniswapSwapOutOf(
        bytes32 _sourceSynthCurrencyKey,
        address _destTokenAddress,
        uint _amountOfSynth,
        uint _expectedAmountOfSUSDFromSwap,
        bytes calldata _data
    ) external returns (uint);
}