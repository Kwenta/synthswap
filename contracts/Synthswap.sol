// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/ISynthSwap.sol";
import "./interfaces/IERC20.sol";
import "./interfaces/ISynthetix.sol";
import "./interfaces/IAddressResolver.sol";
import "./interfaces/IAggregationRouterV4.sol";
import "./interfaces/IAggregationExecutor.sol";
import "./utils/SafeERC20.sol";

contract SynthSwap is ISynthSwap {
    using SafeERC20 for IERC20;

    ISynthetix synthetix;
    IERC20 sUSD;
    IAggregationRouterV4 router;
    IAddressResolver addressResolver;
    address volumeRewards;

    event SwapInto(address indexed from, uint amountReceived);
    event SwapOutOf(address indexed from, uint amountReceived);
    
    constructor (
        address _synthetix, 
        address _sUSD,
        address _aggregationRouterV4,
        address _addressResolver,
        address _volumeRewards
    ) {
        synthetix = ISynthetix(_synthetix);
        sUSD = IERC20(_sUSD);
        router = IAggregationRouterV4(_aggregationRouterV4);
        addressResolver = IAddressResolver(_addressResolver);
        volumeRewards = _volumeRewards;
    }

    /// @inheritdoc ISynthSwap
    function swapInto(
        bytes32 destinationSynthCurrencyKey,
        bytes calldata _data
    ) external payable override returns (uint) {
        // decode _data for swap
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

        // set dest address to this correct address
        desc.dstReceiver = payable(address(this));

        // calculate sUSD Balance pre-swap
        uint sUSDBalance = sUSD.balanceOf(address(this));

        // execute 1inch swap
        router.swap{value: msg.value}(executor, desc, routeData);

        // calculate sUSD Balance post-swap
        sUSDBalance = sUSD.balanceOf(address(this)) - sUSDBalance;

        // execute synthetix swap
        // TODO: exchangeWithTrackingForInitiator: reverted with reason string 'Cannot be run on this layer'
        uint amountReceived = synthetix.exchangeWithTrackingForInitiator(
            'sUSD', // source currency key
            sUSDBalance, // source amount
            destinationSynthCurrencyKey, // destination currency key
            volumeRewards, // rewards
            'KWENTA' // tracking code
        );
        
        emit SwapInto(msg.sender, amountReceived);
        return amountReceived;
    }

    /// @inheritdoc ISynthSwap
    function swapOutOf(
        bytes32 sourceSynthCurrencyKey,
        uint sourceAmount,
        bytes calldata _data
    ) external override returns (uint) {
        // transfer and approve token (synth) for swap
        IERC20 sourceSynth = IERC20(addressResolver.getSynth(sourceSynthCurrencyKey));
        sourceSynth.safeTransferFrom(msg.sender, address(this), sourceAmount);
        sourceSynth.safeApprove(address(synthetix), sourceAmount);

        // we don't use ForInitiator here because we want the sUSD returned to this contract
        uint sUSDAmountOut = synthetix.exchangeWithTracking(
            sourceSynthCurrencyKey, // source currency key
            sourceAmount, // source amount
            'sUSD', // destination currency key
            volumeRewards, // rewards
            'KWENTA' // tracking code
        );

        // approve router to spend sUSD
        sUSD.safeApprove(address(router), sUSDAmountOut);

        // decode _data for swap
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

        // calculate dstToken Balance pre-swap
        IERC20 dstToken = IERC20(desc.dstToken);
        uint dstTokenBalance = dstToken.balanceOf(address(this));

        // execute 1inch swap
        router.swap(executor, desc, routeData);

        // calculate dstToken Balance post-swap
        uint destTokenAmountOut = dstToken.balanceOf(address(this)) - dstTokenBalance;
        
        emit SwapOutOf(msg.sender, destTokenAmountOut);
        return destTokenAmountOut;
    }

}