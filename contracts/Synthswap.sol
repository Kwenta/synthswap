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

    address constant ETH_ADDRESS = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
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
        uint sUSDAmountOut = swapOn1inch(_data, address(this));
        uint amountReceived = swapOnSynthetix(
            sUSDAmountOut, 
            sUSD_CURRENCY_KEY, 
            destSynthCurrencyKey, 
            address(sUSD)
        );

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

    }

    /// @notice execute swap on 1inch
    /// @dev token approval needed when source is not ETH
    function swapOn1inch(
        bytes calldata data, 
        address receiver
    ) internal returns (uint) {
        // decode _data for 1inch swap
        (
            IAggregationExecutor executor,
            IAggregationRouterV4.SwapDescription memory desc,
            bytes memory routeData
        ) = abi.decode(
            data,
            (
                IAggregationExecutor,
                IAggregationRouterV4.SwapDescription,
                bytes
            )
        );

        // set swap description destination address to _receiver
        desc.dstReceiver = payable(receiver);

        bool isETH = ETH_ADDRESS == desc.srcToken;
        if (!isETH) {
            // if receiver is this address, then the source tokens 
            // do not currently reside at this address
            if (receiver == address(this)) {
                // transfer token to this contract
                IERC20(desc.srcToken).safeTransferFrom(msg.sender, address(this), desc.amount);
            }
            // increase allowance
            IERC20(desc.srcToken).safeIncreaseAllowance(address(router), desc.amount);
        }

        // execute 1inch swap
        (uint amountOut,) = router.swap{value: msg.value}(executor, desc, routeData);

        if (!isETH) {
            // decrease allowance
            IERC20(desc.srcToken).safeDecreaseAllowance(address(router), desc.amount);
        }

        require(amountOut > 0, "Synthswap: swapOn1inch failed");
        return amountOut;
    }

    /// @notice execute swap on Synthetix
    /// @dev token approval is always required
    function swapOnSynthetix(
        uint amount,
        bytes32 sourceSynthCurrencyKey,
        bytes32 destSynthCurrencyKey,
        address sourceSynthAddress
    ) internal returns (uint) {
        // increase allowance of sourceSynth for synthetix to spend 
         IERC20(sourceSynthAddress).safeIncreaseAllowance(address(synthetix()), amount);

        // execute synthetix swap
        uint amountOut = synthetix().exchangeWithTracking(
            sourceSynthCurrencyKey,
            amount,
            destSynthCurrencyKey,
            volumeRewards,
            TRACKING_CODE
        );

        // decrease allowance of sourceSynth for synthetix to spend 
         IERC20(sourceSynthAddress).safeDecreaseAllowance(address(synthetix()), amount);

        require(amountOut > 0, "Synthswap: swapOn1inch failed");
        return amountOut;
    }

}