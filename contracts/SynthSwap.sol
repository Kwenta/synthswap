// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/ISynthSwap.sol";
import "./interfaces/IERC20.sol";
import "./interfaces/ISynthetix.sol";
import "./interfaces/IWETH.sol";

contract SynthSwap is ISynthSwap {

    bytes32 constant SUSD_CURRENCY_KEY = bytes32('sUSD');

    ISynthetix Synthetix;    
    IERC20 sUSD;
    IWETH iWETH;

    address volumeRewards;
    address aggregationRouterV3;
    address WETH;
                    
    event SwapInto(address from, uint amountReceived);
    event SwapOutOf(address from, uint amountReceived);

    struct OneInchSwapDescription {
        IERC20 srcToken;
        IERC20 dstToken;
        address srcReceiver;
        address dstReceiver;
        uint256 amount;
        uint256 minReturnAmount;
        uint256 flags;
        bytes permit;
    }
    
    constructor (
        address _synthetix, 
        address _sUSD, 
        address _volumeRewards, 
        address _aggregationRouterV3,
        address _WETH
    ) {
        Synthetix = ISynthetix(_synthetix);
        sUSD = IERC20(_sUSD);
        volumeRewards = _volumeRewards;
        aggregationRouterV3 = _aggregationRouterV3;
        WETH = _WETH;
    }

    /// @inheritdoc ISynthSwap
    function swapInto(
        address inputTokenAddress,
        uint256 inputTokenAmount,
        bytes32 destinationSynthCurrencyKey,
        uint minOut, 
        bytes calldata _data
    ) external payable override returns (uint) {

        // Prevent Griefing
        IERC20 InputERC20 = IERC20(inputTokenAddress);
        uint tokenBalance = InputERC20.balanceOf(address(this));
        require(tokenBalance >= inputTokenAmount, "incorrect token balance");

        // Approve the 1inch aggregationRouterV3 to spend token at address inputTokenAddress
        InputERC20.approve(aggregationRouterV3, tokenBalance);

        // Swap token with sUSD via 1inch
        (bool success, bytes memory returnData) = address(aggregationRouterV3).call(_data);
        require(success, _getRevertMsg(returnData));
        (uint returnAmount,) = abi.decode(returnData, (uint, uint));
        require(returnAmount >= minOut);

        // Approve the Synthetix router to spend sUSD
        sUSD.approve(address(Synthetix), returnAmount);

        // Swap sUSD with destination synth by providing both the source and destination currency keys
        uint amountReceived = Synthetix.exchangeWithTrackingForInitiator(
            SUSD_CURRENCY_KEY, // hardcode source currency key
            returnAmount, // source amount
            destinationSynthCurrencyKey, // destination currency key
            volumeRewards, // volume rewards address
            'KWENTA' // tracking code
        );
        
        emit SwapInto(msg.sender, amountReceived);
        return amountReceived;
    }

    /// @inheritdoc ISynthSwap
    function swapIntoWithETH(
        bytes32 destinationSynthCurrencyKey,
        uint minOut, 
        bytes calldata _data
    ) external payable override returns (uint) {
        
        // Wrap ETH and transfer WETH to this address
        IWETH(WETH).deposit{value: msg.value}();
        IERC20 InputERC20 = IERC20(WETH);

        // Prevent Griefing
        uint tokenBalance = InputERC20.balanceOf(address(this));
        require(tokenBalance >= msg.value, "incorrect token balance");

        // Approve the 1inch aggregationRouterV3 to spend WETH
        InputERC20.approve(aggregationRouterV3, tokenBalance);

        // Swap WETH with sUSD via 1inch
        (bool success, bytes memory returnData) = address(aggregationRouterV3).call(_data);
        require(success, _getRevertMsg(returnData));
        (uint returnAmount,) = abi.decode(returnData, (uint, uint));
        require(returnAmount >= minOut);

        // Approve the Synthetix router to spend sUSD
        sUSD.approve(address(Synthetix), returnAmount);

        // Swap sUSD with destination synth by providing both the source and destination currency keys
        uint amountReceived = Synthetix.exchangeWithTrackingForInitiator(
            SUSD_CURRENCY_KEY, // hardcode source currency key
            returnAmount, // source amount
            destinationSynthCurrencyKey, // destination currency key
            volumeRewards, // volume rewards address
            'KWENTA' // tracking code
        );
        
        emit SwapInto(msg.sender, amountReceived);
        return amountReceived;
    }

    /// @inheritdoc ISynthSwap
    function swapOutOf(
        address inputSynth,
        bytes32 inputSynthCurrencyKey,
        uint256 inputSynthAmount,
        address outputToken,
        uint minOut, 
        bytes calldata _data
    ) external payable override returns (uint) {

        // Approve the Synthetix router to spend inputSynth
        IERC20 InputERC20 = IERC20(inputSynth);
        uint synthBalance = InputERC20.balanceOf(address(this));
        require(synthBalance >= inputSynthAmount, "incorrect synth balance");
        InputERC20.approve(address(Synthetix), synthBalance);

        // Swap inputSynth with sUSD by providing both the source and destination currency keys
        uint sUSDReceived = Synthetix.exchangeWithTrackingForInitiator(
            inputSynthCurrencyKey, // source currency key
            synthBalance, // source amount
            SUSD_CURRENCY_KEY, // destination currency key
            volumeRewards, // volume rewards address
            'KWENTA' // tracking code
        );

        // Approve the 1inch aggregationRouterV3 to spend sUSD
        sUSD.transferFrom(msg.sender, address(this), sUSDReceived);
        sUSD.approve(aggregationRouterV3, sUSDReceived);

        // Swap sUSD with output token via 1inch
        (bool success, bytes memory returnData) = address(aggregationRouterV3).call(_data);
        require(success, _getRevertMsg(returnData));
        (uint returnAmount,) = abi.decode(returnData, (uint, uint));
        require(returnAmount >= minOut);

        // transfer amountReceived of outputToken to contract caller
        assert(IERC20(outputToken).transfer(msg.sender, returnAmount));

        emit SwapOutOf(msg.sender, returnAmount);
        return returnAmount;
    }

    /**
     * @notice execute a swap via 1inch
     * @param _returnData revert associated data
     * @return revert message
     */
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