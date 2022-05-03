// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/ISynthSwap.sol";
import "./interfaces/IERC20.sol";
import "./interfaces/ISynthetix.sol";
import "./interfaces/IAddressResolver.sol";
import "./interfaces/IAggregationRouterV4.sol";
import "./interfaces/IAggregationExecutor.sol";
import "./utils/SafeERC20.sol";

/// @title system to swap synths to/from many erc20 tokens
/// @dev IAggregationRouterV4 relies on calldata generated off-chain
/// and IAddressResolver dynamically fetches address for Synthetix
contract SynthSwap is ISynthSwap {
    using SafeERC20 for IERC20;

    IERC20 immutable sUSD;
    IAggregationRouterV4 immutable router;
    IAddressResolver immutable addressResolver;
    address immutable volumeRewards;

    bytes32 private constant CONTRACT_SYNTHETIX = "Synthetix";
    bytes32 private constant sUSD_CURRENCY_KEY = "sUSD";
    bytes32 private constant TRACKING_CODE = "KWENTA";

    event SwapInto(address indexed from, uint amountReceived);
    event SwapOutOf(address indexed from, uint amountReceived);
    
    constructor (
        address _sUSD,
        address _aggregationRouterV4,
        address _addressResolver,
        address _volumeRewards
    ) {
        sUSD = IERC20(_sUSD);
        router = IAggregationRouterV4(_aggregationRouterV4);
        addressResolver = IAddressResolver(_addressResolver);
        volumeRewards = _volumeRewards;
    }

    /// @notice addressResolver fetches ISynthetix address 
    function synthetix() internal view returns (ISynthetix) {
        return ISynthetix(addressResolver.requireAndGetAddress(
            CONTRACT_SYNTHETIX, 
            "Could not get Synthetix"
        ));
    }

    /// @inheritdoc ISynthSwap
    function swapInto(
        bytes32 destSynthCurrencyKey,
        address destSynthAddress,
        bytes calldata _data
    ) external payable override returns (uint) {
        // decode _data for 1inch swap
        (
            IAggregationExecutor executor,
            IAggregationRouterV4.SwapDescription memory desc,
            bytes memory routeData
        ) = abi.decode(
            _data,
            (
                IAggregationExecutor,
                IAggregationRouterV4.SwapDescription,
                bytes
            )
        );

        // intermediary token should always be sUSD
        require(desc.dstToken == address(sUSD), "SynthSwap: 1inch destination token is not sUSD");

        // set swap description destination address to this contract address
        desc.dstReceiver = payable(address(this));

        // execute 1inch swap
        (uint sUSDAmountOut,) = router.swap{value: msg.value}(executor, desc, routeData);

        // increase allowance of sUSD for synthetix to spend 
        sUSD.safeIncreaseAllowance(address(synthetix()), sUSDAmountOut);

        // execute synthetix swap
        uint amountReceived = synthetix().exchangeWithTracking(
            sUSD_CURRENCY_KEY,
            sUSDAmountOut,
            destSynthCurrencyKey,
            address(this),
            TRACKING_CODE
        );

        // decrease allowance of sUSD for synthetix to spend 
        sUSD.safeDecreaseAllowance(address(synthetix()), sUSDAmountOut);

        IERC20(destSynthAddress).safeTransfer(msg.sender, amountReceived);
        
        emit SwapInto(msg.sender, amountReceived);
        return amountReceived;
    }

    /// @inheritdoc ISynthSwap
    function swapOutOf(
        bytes32 sourceSynthCurrencyKey,
        address sourceSynthAddress,
        uint sourceAmount,
        bytes calldata _data
    ) external override returns (uint) {
        // transfer sourceSynth for swap
        IERC20 sourceSynth = IERC20(sourceSynthAddress);
        sourceSynth.transferFrom(msg.sender, address(this), sourceAmount);

        // increase allowance of sourceSynth for synthetix to spend 
        sourceSynth.approve(address(synthetix()), sourceAmount);

        // execute synthetix swap
        uint sUSDAmountOut = synthetix().exchangeWithTracking(
            sourceSynthCurrencyKey,
            sourceAmount,
            sUSD_CURRENCY_KEY,
            volumeRewards,
            TRACKING_CODE
        );

        // decode _data for 1inch swap
        (
            IAggregationExecutor executor,
            IAggregationRouterV4.SwapDescription memory desc,
            bytes memory routeData
        ) = abi.decode(
            _data,
            (
                IAggregationExecutor,
                IAggregationRouterV4.SwapDescription,
                bytes
            )
        );

        // intermediary token should always be sUSD
        require(desc.srcToken == address(sUSD), "SynthSwap: 1inch source token is not sUSD");

        // set swap description destination address to the function caller
        desc.dstReceiver = payable(msg.sender);

        // set swap description amount to sUSD received from synthetix swap
        desc.amount = sUSDAmountOut;

        // increase allowance of sUSD for router to spend 
        sUSD.safeIncreaseAllowance(address(router), sUSDAmountOut);

        // understand that sUSDAmountOut could be different than 
        // sUSD amount used when generating routeData (prior to swapOutOf being called)

        // execute 1inch swap
        (uint destTokenAmountOut,) = router.swap(executor, desc, routeData);

        // decrease allowance of sUSD for router to spend 
        sUSD.safeDecreaseAllowance(address(synthetix()), sUSDAmountOut);
        
        emit SwapOutOf(msg.sender, destTokenAmountOut);
        return destTokenAmountOut;
    }

}