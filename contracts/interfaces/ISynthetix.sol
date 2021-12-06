// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ISynthetix {
    function exchangeWithTracking(
        bytes32 sourceCurrencyKey,
        uint sourceAmount,
        bytes32 destinationCurrencyKey,
        address rewardAddress,
        bytes32 trackingCode
    ) external returns (uint amountReceived);

    function exchangeWithTrackingForInitiator(
        bytes32 sourceCurrencyKey,
        uint sourceAmount,
        bytes32 destinationCurrencyKey,
        address rewardAddress,
        bytes32 trackingCode
    ) external returns (uint amountReceived);
}