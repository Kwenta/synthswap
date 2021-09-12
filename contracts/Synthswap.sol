// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/ISynthSwap.sol";
import "./interfaces/IERC20.sol";
import "./interfaces/ISynthetix.sol";

contract SynthSwap is ISynthSwap {

    bytes32 constant SUSD_CURRENCY_KEY = bytes32('sUSD');

    ISynthetix Synthetix;
    IERC20 sUSD;
    address volumeRewards;
    address aggregationRouterV3;

    event SwapInto(address from, uint amountReceived);
    event SwapOutOf(address from, uint amountReceived);
    
    constructor (address _synthetix, address _sUSD, address _volumeRewards, address _aggregationRouterV3) {
        Synthetix = ISynthetix(_synthetix);
        sUSD = IERC20(_sUSD);
        volumeRewards = _volumeRewards;
        aggregationRouterV3 = _aggregationRouterV3;
    }

    function swapInto(
        bytes calldata payload,
        bytes32 destinationSynthCurrencyKey
    ) external payable override returns (uint) {

        // Make sure to set destReceiver to this contract
        (bool success, bytes memory returnData) = aggregationRouterV3.delegatecall(payload);
        require(success, _getRevertMsg(returnData));
        require(false, "stop");

        // Approve the Synthetix router to spend sUSD.
        uint sUSDBalance = sUSD.balanceOf(address(this));
        sUSD.approve(address(Synthetix), sUSDBalance);

        // Swap sUSD with destination synth by providing both the source and destination currency keys. 
        uint amountReceived = Synthetix.exchangeWithTrackingForInitiator(
            SUSD_CURRENCY_KEY, // hardcode source currency key
            sUSDBalance, // source amount
            destinationSynthCurrencyKey, // destination currency key
            volumeRewards, // volume rewards address
            'KWENTA' // tracking code
        );
        
        emit SwapInto(msg.sender, amountReceived);
        return amountReceived;
    }

    function swapOutOf(
        bytes calldata payload,
        address inputSynth,
        bytes32 inputSynthCurrencyKey,
        address destinationToken
    ) external payable override returns (uint) {

        // Approve the Synthetix router to spend `inputSynth`.
        IERC20 InputERC20 = IERC20(inputSynth);
        uint synthBalance = InputERC20.balanceOf(address(this));
        InputERC20.approve(address(Synthetix), synthBalance);

        // Swap `inputSynth` with sUSD by providing both the source and destination currency keys. 
        Synthetix.exchangeWithTrackingForInitiator(
            inputSynthCurrencyKey, // source currency key
            synthBalance, // source amount
            SUSD_CURRENCY_KEY, // destination currency key
            volumeRewards, // volume rewards address
            'KWENTA' // tracking code
        );

        // Make sure to set destReceiver to this contract
        (bool success, bytes memory returnData) = aggregationRouterV3.delegatecall(payload);
        require(success, _getRevertMsg(returnData));
        require(false, "stop");

        uint amountReceived = IERC20(destinationToken).balanceOf(address(this));

        emit SwapOutOf(msg.sender, amountReceived);
        return amountReceived;
    }

    function swapOnOneInch(
        address fromToken,
        address toToken,
        uint256 originAmount,
        uint256 minTargetAmount,
        uint256[] memory exchangeDistribution
    ) internal {
        bytes memory _data = abi.encodeWithSignature(
            "swap(address,address,uint256,uint256,uint256[],uint256)",
            fromToken,
            toToken,
            originAmount,
            // 99% of the minTargetAmount results in 1% price/slippage buffer
            ((minTargetAmount * 99) / 100),
            exchangeDistribution,
            0
        );
        invoke(aggregationRouterV3, _data);
    }

    /**
    * @notice Performs a generic transaction.
    * @param _target The address for the transaction.
    * @param _data The data of the transaction.
    */
    function invoke(address _target, bytes memory _data) internal returns (bytes memory) {
        // External contracts can be compiled with different Solidity versions
        // which can cause "revert without reason" when called through,
        // for example, a standard IERC20 ABI compiled on the latest version.
        // This low-level call avoids that issue.

        (bool success, bytes memory returnData) = _target.delegatecall(_data);
        require(success, _getRevertMsg(returnData));
        return returnData;
    }

    function _getRevertMsg(bytes memory _returnData) internal pure returns (string memory) {
        // If the _res length is less than 68, then the transaction failed silently (without a revert message)
        if (_returnData.length < 68) return 'Transaction reverted silently';

        assembly {
            // Slice the sighash.
            _returnData := add(_returnData, 0x04)
        }
        return abi.decode(_returnData, (string)); // All that remains is the revert string
    }

}