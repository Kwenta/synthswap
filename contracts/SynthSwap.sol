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
        uint256 slippage
    ) external payable override returns (uint) {
        // Approve the 1inch router to spend InputERC20
        IERC20 InputERC20 = IERC20(inputTokenAddress);
        uint tokenBalance = InputERC20.balanceOf(address(this));
        require(tokenBalance >= inputTokenAmount, "incorrect token balance");
        InputERC20.approve(aggregationRouterV3, tokenBalance);

        // Swap InputERC20 with sUSD
        swapOnOneInch(inputTokenAddress, address(sUSD), tokenBalance, address(this), slippage);

        // Approve the Synthetix router to spend sUSD
        uint sUSDBalance = sUSD.balanceOf(address(this));
        sUSD.approve(address(Synthetix), sUSDBalance);

        // Swap sUSD with destination synth by providing both the source and destination currency keys
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

    /// @inheritdoc ISynthSwap
    function swapIntoWithETH(
        uint256 amount,
        bytes32 destinationSynthCurrencyKey,
        uint256 slippage
    ) external payable override returns (uint) {
        // Wrap ETH and transfer WETH to this address
        IWETH(WETH).deposit{value: amount}();
        IERC20 InputERC20 = IERC20(WETH);
        assert(InputERC20.transfer(address(this), amount));

        // Approve the 1inch router to spend WETH
        uint tokenBalance = InputERC20.balanceOf(address(this));
        require(tokenBalance >= amount, "incorrect token balance");
        InputERC20.approve(aggregationRouterV3, tokenBalance);

        // Swap WETH with sUSD
        swapOnOneInch(WETH, address(sUSD), tokenBalance, address(this), slippage);

        // Approve the Synthetix router to spend sUSD
        uint sUSDBalance = sUSD.balanceOf(address(this));
        sUSD.approve(address(Synthetix), sUSDBalance);

        // Swap sUSD with destination synth by providing both the source and destination currency keys
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

    /// @inheritdoc ISynthSwap
    function swapOutOf(
        address inputSynth,
        bytes32 inputSynthCurrencyKey,
        uint256 inputSynthAmount,
        address destinationToken,
        uint256 slippage
    ) external payable override returns (uint) {
        // Approve the Synthetix router to spend inputSynth
        IERC20 InputERC20 = IERC20(inputSynth);
        uint synthBalance = InputERC20.balanceOf(address(this));
        require(synthBalance >= inputSynthAmount, "incorrect synth balance");
        InputERC20.approve(address(Synthetix), synthBalance);

        // Swap inputSynth with sUSD by providing both the source and destination currency keys
        Synthetix.exchangeWithTrackingForInitiator(
            inputSynthCurrencyKey, // source currency key
            synthBalance, // source amount
            SUSD_CURRENCY_KEY, // destination currency key
            volumeRewards, // volume rewards address
            'KWENTA' // tracking code
        );

        // Approve the 1inch router to spend sUSD
        uint sUSDBalance = sUSD.balanceOf(address(this));
        sUSD.approve(aggregationRouterV3, sUSDBalance);

        // Swap sUSD with destinationToken
        swapOnOneInch(address(sUSD), destinationToken, sUSDBalance, address(this), slippage);
        uint amountReceived = IERC20(destinationToken).balanceOf(address(this));

        assert(sUSD.transfer(msg.sender, amountReceived));

        emit SwapOutOf(msg.sender, amountReceived);
        return amountReceived;
    }

    /**
     * @notice Performs a token swap via 1inch (https://docs.1inch.io/api/quote-swap).
     * @param fromTokenAddress contract address of a token to sell
     * @param toTokenAddress contract address of a token to buy
     * @param amount amount of a token to sell
     * @param fromAddress address of a seller
     * @param slippage limit of price slippage you are willing to accept in percentage [0-50]
     */
    function swapOnOneInch(
        address fromTokenAddress,
        address toTokenAddress,
        uint256 amount,
        address fromAddress,
        uint256 slippage
    ) internal {
        bytes memory _data = abi.encodeWithSignature(
            "swap(address,address,uint256,address,uint256)",
            fromTokenAddress,
            toTokenAddress,
            amount,
            fromAddress,
            slippage
        );
        invoke(aggregationRouterV3, _data);
    }

    /**
     * @notice Performs a generic transaction
     * @param _target The address for the transaction
     * @param _data The data of the transaction
     */
    function invoke(address _target, bytes memory _data) internal returns (bytes memory) {
        // External contracts can be compiled with different Solidity versions
        // which can cause "revert without reason" when called through,
        // for example, a standard IERC20 ABI compiled on the latest version.
        // This low-level call avoids that issue.

        (bool success, bytes memory returnData) = _target.call(_data);
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
