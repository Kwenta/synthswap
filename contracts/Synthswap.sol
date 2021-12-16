// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/ISynthSwap.sol";
import "./interfaces/IERC20.sol";
import "./interfaces/ISynthetix.sol";
import "./interfaces/IAddressResolver.sol";
import "./utils/SafeERC20.sol";

contract SynthSwap is ISynthSwap {
    using SafeERC20 for IERC20;

    ISynthetix synthetix;
    IERC20 sUSD;
    IAddressResolver addressResolver;
    address volumeRewards;
    address aggregationRouterV4;

    event SwapInto(address indexed from, uint amountReceived);
    event SwapOutOf(address indexed from, uint amountReceived);
    
    constructor (
        address _synthetix, 
        address _sUSD,
        address _volumeRewards,
        address _aggregationRouterV4,
        address _addressResolver
    ) {
        synthetix = ISynthetix(_synthetix);
        sUSD = IERC20(_sUSD);
        volumeRewards = _volumeRewards;
        aggregationRouterV4 = _aggregationRouterV4;
        addressResolver = IAddressResolver(_addressResolver);
    }

    /// @inheritdoc ISynthSwap
    function swapInto(
        bytes32 destinationSynthCurrencyKey,
        bytes calldata _data
    ) external payable override returns (uint) {
        // Make sure to set destReceiver to this contract
        (bool success, bytes memory returnData) = aggregationRouterV4.delegatecall(_data);
        require(success, _getRevertMsg(returnData));
        (uint sUSDAmountOut,) = abi.decode(returnData, (uint, uint));
        
        sUSD.approve(address(synthetix), sUSDAmountOut);

        uint amountReceived = synthetix.exchangeWithTrackingForInitiator(
            'sUSD', // source currency key
            sUSDAmountOut, // source amount
            destinationSynthCurrencyKey, // destination currency key
            volumeRewards, 
            'KWENTA' // tracking code
        );
        
        emit SwapInto(msg.sender, amountReceived);
        return amountReceived;
    }

    /// @inheritdoc ISynthSwap
    function swapOutOf(
        bytes32 sourceSynthCurrencyKey,
        uint sourceAmount, // Make sure synthetix is approved to use this amount
        bytes calldata _data
    ) external override returns (uint) {
        IERC20 sourceSynth = IERC20(addressResolver.getSynth(sourceSynthCurrencyKey));
        sourceSynth.safeTransferFrom(msg.sender, address(this), sourceAmount);
        sourceSynth.safeApprove(address(synthetix), sourceAmount);

        // We don't use ForInitiator here because we want the sUSD returned to this contract
        uint sUSDAmountOut = synthetix.exchangeWithTracking(
            sourceSynthCurrencyKey, // source currency key
            sourceAmount, // source amount
            'sUSD', // destination currency key
            volumeRewards, 
            'KWENTA' // tracking code
        );

        sUSD.safeApprove(address(aggregationRouterV4), sUSDAmountOut);

        // Make sure to set destReceiver to caller
        (bool success, bytes memory returnData) = aggregationRouterV4.call(_data);
        require(success, _getRevertMsg(returnData));
        (uint amountReceived,) = abi.decode(returnData, (uint, uint));
        
        emit SwapOutOf(msg.sender, amountReceived);
        return amountReceived;
    }

    function _getRevertMsg(bytes memory _returnData) internal pure returns (string memory) {
        // If the _res length is less than 68, then the transaction failed 
        // silently (without a revert message)
        if (_returnData.length < 68) return 'Transaction reverted silently';

        assembly {
            // Slice the sighash
            _returnData := add(_returnData, 0x04)
        }
        // All that remains is the revert string
        return abi.decode(_returnData, (string));
    }
}