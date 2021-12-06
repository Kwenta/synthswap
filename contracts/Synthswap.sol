// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/ISynthSwap.sol";
import "./interfaces/IERC20.sol";
import "./interfaces/ISynthetix.sol";
import "./interfaces/IAddressResolver.sol";

contract SynthSwap is ISynthSwap {
    ISynthetix synthetix;
    IERC20 sUSD;
    IAddressResolver addressResolver;
    address volumeRewards;
    address aggregationRouterV3;

    event SwapInto(address indexed from, uint amountReceived);
    event SwapOutOf(address indexed from, uint amountReceived);
    
    constructor (address _synthetix, address _sUSD, address _volumeRewards, address _aggregationRouterV3, address _addressResolver) {
        synthetix = ISynthetix(_synthetix);
        sUSD = IERC20(_sUSD);
        volumeRewards = _volumeRewards;
        aggregationRouterV3 = _aggregationRouterV3;
        addressResolver = IAddressResolver(_addressResolver);
    }

    function swapInto(
        bytes calldata _data,
        bytes32 destinationSynthCurrencyKey
    ) external payable override returns (uint) {

        // Make sure to set destReceiver to this contract
        (bool success, bytes memory returnData) = aggregationRouterV3.delegatecall(_data);
        require(success, _getRevertMsg(returnData));
        (uint sUSDAmountOut,) = abi.decode(returnData, (uint, uint));
        
        sUSD.approve(address(synthetix), sUSDAmountOut);
        uint amountReceived = synthetix.exchangeWithTrackingForInitiator(
            'sUSD', // hardcode source currency key
            sUSDAmountOut, //source amount
            destinationSynthCurrencyKey,
            volumeRewards, 
            'KWENTA' //tracking code
        );
        
        emit SwapInto(msg.sender, amountReceived);
        return amountReceived;
    }

    function swapOutOf(
        bytes32 sourceSynthCurrencyKey,
        uint sourceAmount, // Make sure synthetix is approved to use this amount
        bytes calldata _data
    ) external override returns (uint) {

        IERC20 sourceSynth = IERC20(addressResolver.getSynth(sourceSynthCurrencyKey));
        sourceSynth.transferFrom(msg.sender, address(this), sourceAmount);
        
        sourceSynth.approve(address(synthetix), sourceAmount);
        // We don't use ForInitiator here because we want the sUSD returned to this contract
        uint sUSDAmountOut = synthetix.exchangeWithTracking(
            sourceSynthCurrencyKey, 
            sourceAmount, 
            'sUSD',
            volumeRewards, 
            'KWENTA' //tracking code
        );

        sUSD.approve(address(aggregationRouterV3), sUSDAmountOut);
        // Make sure to set destReceiver to caller
        (bool success, bytes memory returnData) = aggregationRouterV3.call(_data);
        require(success, _getRevertMsg(returnData));
        (uint amountReceived,) = abi.decode(returnData, (uint, uint));
        
        emit SwapOutOf(msg.sender, amountReceived);
        return amountReceived;
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