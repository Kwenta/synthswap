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
        bytes32 _destSynthCurrencyKey,
        address _destSynthAddress,
        bytes calldata _data
    ) external payable override returns (uint) {
        (uint amountOut,) = swapOn1inch(_data, false);

        // if destination synth is NOT sUSD, swap on Synthetix is necessary 
        if (_destSynthCurrencyKey != sUSD_CURRENCY_KEY) {
            amountOut = swapOnSynthetix(
                amountOut, 
                sUSD_CURRENCY_KEY, 
                _destSynthCurrencyKey, 
                address(sUSD)
            );
        }

        IERC20(_destSynthAddress).safeTransfer(msg.sender, amountOut);
  
        emit SwapInto(msg.sender, amountOut);
        return amountOut;
    }

    /// @inheritdoc ISynthSwap
    function swapOutOf(
        bytes32 _sourceSynthCurrencyKey,
        address _sourceSynthAddress,
        uint _sourceAmount,
        bytes calldata _data
    ) external override returns (uint) {
        // if source synth is NOT sUSD, swap on Synthetix is necessary 
        if (_sourceSynthCurrencyKey != sUSD_CURRENCY_KEY) {
            swapOnSynthetix(
                _sourceAmount, 
                _sourceSynthCurrencyKey, 
                sUSD_CURRENCY_KEY, 
                _sourceSynthAddress
            );
        } else {
            sUSD.safeTransferFrom(msg.sender, address(this), _sourceAmount); 
        }

        (uint amountOut, address dstToken) = swapOn1inch(_data, true);
        IERC20(dstToken).safeTransfer(msg.sender, amountOut);
  
        emit SwapOutOf(msg.sender, amountOut);
        return amountOut;
    }

    /// @notice execute swap on 1inch
    /// @dev token approval needed when source is not ETH
    /// @param _data specifying swap data
    /// @param _areTokensInContract TODO
    /// @return amount received from 1inch swap
    function swapOn1inch(
        bytes calldata _data, 
        bool _areTokensInContract
    ) internal returns (uint, address) {
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

        // set swap description destination address to this contract
        desc.dstReceiver = payable(address(this));

        bool isETH = ETH_ADDRESS == desc.srcToken;
        if (!isETH) {
            // if TODO
            if (!_areTokensInContract) {
                // transfer token to this contract
                IERC20(desc.srcToken).safeTransferFrom(msg.sender, address(this), desc.amount);
            }
            // approve AggregationRouterV4 to spend srcToken
            IERC20(desc.srcToken).safeApprove(address(router), desc.amount);
        }

        // execute 1inch swap
        (uint amountOut,) = router.swap{value: msg.value}(executor, desc, routeData);

        require(amountOut > 0, "SynthSwap: swapOn1inch failed");
        return (amountOut, desc.dstToken);
    }

    /// @notice execute swap on Synthetix
    /// @dev token approval is always required
    /// @param _amount of source synth to swap
    /// @param _sourceSynthCurrencyKey source synth key needed for exchange
    /// @param _destSynthCurrencyKey destination synth key needed for exchange
    /// @param _sourceSynthAddress source synth address needed for approval
    /// @return amountOut: received from Synthetix swap
    function swapOnSynthetix(
        uint _amount,
        bytes32 _sourceSynthCurrencyKey,
        bytes32 _destSynthCurrencyKey,
        address _sourceSynthAddress
    ) internal returns (uint) {
        //  approve Synthetix to spend sourceSynth
        IERC20(_sourceSynthAddress).safeApprove(address(synthetix()), _amount);

        // execute Synthetix swap
        uint amountOut = synthetix().exchangeWithTracking(
            _sourceSynthCurrencyKey,
            _amount,
            _destSynthCurrencyKey,
            volumeRewards,
            TRACKING_CODE
        );

        require(amountOut > 0, "SynthSwap: swapOnSynthetix failed");
        return amountOut;
    }

}