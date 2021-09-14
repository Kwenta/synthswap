// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/ISynthSwap.sol";
import "./interfaces/IERC20.sol";
import "./interfaces/ISynthetix.sol";

contract SynthSwap is ISynthSwap {
    ISynthetix Synthetix;
    IERC20 sUSD;
    address volumeRewards;
    address aggregationRouterV3;

    event SwapInto(address from, uint amountReceived);
    
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
        uint sUSDBalance = sUSD.balanceOf(address(this));
        sUSD.approve(address(Synthetix), sUSDBalance);

        uint amountReceived = Synthetix.exchangeWithTrackingForInitiator(
            'sUSD', // hardcode source currency key
            sUSDBalance, //source amount
            destinationSynthCurrencyKey,
            volumeRewards, 
            'KWENTA' //tracking code
        );
        
        emit SwapInto(msg.sender, amountReceived);
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