// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/ISynthSwap.sol";
import "./interfaces/IERC20.sol";
import "./interfaces/ISynthetix.sol";
import "./interfaces/IAddressResolver.sol";
import "./interfaces/IAggregationRouterV4.sol";
import "./interfaces/IAggregationExecutor.sol";
import "./utils/SafeERC20.sol";
import "./utils/Owned.sol";
import "./utils/ReentrancyGuard.sol";
import "./libraries/RevertReasonParser.sol";

/// @title system to swap synths to/from many erc20 tokens
/// @dev IAggregationRouterV4 relies on calldata generated off-chain
contract SynthSwap is ISynthSwap, Owned, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 immutable sUSD;
    IAggregationRouterV4 immutable router;
    IAddressResolver immutable addressResolver;
    address immutable volumeRewards;
    address immutable treasury;

    address constant ETH_ADDRESS = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    bytes32 private constant CONTRACT_SYNTHETIX = "Synthetix";
    bytes32 private constant sUSD_CURRENCY_KEY = "sUSD";
    bytes32 private constant TRACKING_CODE = "KWENTA";

    event SwapInto(address indexed from, uint amountReceived);
    event SwapOutOf(address indexed from, uint amountReceived);
    event Received(address from, uint amountReceived);
    
    constructor (
        address _sUSD,
        address _aggregationRouterV4,
        address _addressResolver,
        address _volumeRewards,
        address _treasury
    ) Owned(msg.sender) {
        sUSD = IERC20(_sUSD);
        router = IAggregationRouterV4(_aggregationRouterV4);
        addressResolver = IAddressResolver(_addressResolver);
        volumeRewards = _volumeRewards;
        treasury = _treasury;
    }

    //////////////////////////////////////
    ///////// EXTERNAL FUNCTIONS /////////
    //////////////////////////////////////

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    /// @inheritdoc ISynthSwap
    function swapInto(
        bytes32 _destSynthCurrencyKey,
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

        address destSynthAddress = proxyForSynth(addressResolver.getSynth(_destSynthCurrencyKey));
        IERC20(destSynthAddress).safeTransfer(msg.sender, amountOut);
  
        emit SwapInto(msg.sender, amountOut);
        return amountOut;
    }

    /// @inheritdoc ISynthSwap
    function swapOutOf(
        bytes32 _sourceSynthCurrencyKey,
        uint _sourceAmount,
        bytes calldata _data
    ) external override nonReentrant returns (uint) {
        // transfer synth to this contract
        address sourceSynthAddress = proxyForSynth(addressResolver.getSynth(_sourceSynthCurrencyKey));
        IERC20(sourceSynthAddress).safeTransferFrom(msg.sender, address(this), _sourceAmount);

        // if source synth is NOT sUSD, swap on Synthetix is necessary 
        if (_sourceSynthCurrencyKey != sUSD_CURRENCY_KEY) {
            swapOnSynthetix(
                _sourceAmount, 
                _sourceSynthCurrencyKey, 
                sUSD_CURRENCY_KEY, 
                sourceSynthAddress
            );
        }

        (uint amountOut, address dstToken) = swapOn1inch(_data, true);
        
        if (dstToken == ETH_ADDRESS) {
            (bool success, bytes memory result) = msg.sender.call{value: amountOut}("");
            if (!success) {
                revert(RevertReasonParser.parse(result, "callBytes failed: "));
            }
        } else {
            IERC20(dstToken).safeTransfer(msg.sender, amountOut);
        }
  
        emit SwapOutOf(msg.sender, amountOut);

        // any remaining sUSD in contract should be transferred to treasury
        uint remainingBalanceSUSD = sUSD.balanceOf(address(this));
        if (remainingBalanceSUSD > 0) {
            sUSD.safeTransfer(treasury, remainingBalanceSUSD);
        }

        return amountOut;
    }

    /// @inheritdoc ISynthSwap
    function uniswapSwapInto(
        bytes32 _destSynthCurrencyKey,
        address _sourceTokenAddress,
        uint _amount,
        bytes calldata _data
    ) external payable override returns (uint) {
        // if not swapping from ETH, transfer source token to contract and approve spending
        if (_sourceTokenAddress != ETH_ADDRESS) {
            IERC20(_sourceTokenAddress).safeTransferFrom(msg.sender, address(this), _amount);
            IERC20(_sourceTokenAddress).safeApprove(address(router), _amount);
        }

        // swap ETH or source token for sUSD
        (bool success, bytes memory result) = address(router).call{value: msg.value}(_data);
        if (!success) {
            revert(RevertReasonParser.parse(result, "callBytes failed: "));
        }

         // record amount of sUSD received from swap
        (uint amountOut) = abi.decode(result, (uint));

        // if destination synth is NOT sUSD, swap on Synthetix is necessary 
        if (_destSynthCurrencyKey != sUSD_CURRENCY_KEY) {
            amountOut = swapOnSynthetix(
                amountOut, 
                sUSD_CURRENCY_KEY, 
                _destSynthCurrencyKey, 
                address(sUSD)
            );
        }

        // send amount of destination synth to msg.sender
        address destSynthAddress = proxyForSynth(addressResolver.getSynth(_destSynthCurrencyKey));
        IERC20(destSynthAddress).safeTransfer(msg.sender, amountOut);
  
        emit SwapInto(msg.sender, amountOut);
        return amountOut;
    }

    /// @inheritdoc ISynthSwap
    function uniswapSwapOutOf(
        bytes32 _sourceSynthCurrencyKey,
        address _destTokenAddress,
        uint _amountOfSynth,
        uint _expectedAmountOfSUSDFromSwap,
        bytes calldata _data
    ) external override nonReentrant returns (uint) {
        // transfer synth to this contract
        address sourceSynthAddress = proxyForSynth(addressResolver.getSynth(_sourceSynthCurrencyKey));
        IERC20(sourceSynthAddress).transferFrom(msg.sender, address(this), _amountOfSynth);

        // if source synth is NOT sUSD, swap on Synthetix is necessary 
        if (_sourceSynthCurrencyKey != sUSD_CURRENCY_KEY) {
            swapOnSynthetix(
                _amountOfSynth, 
                _sourceSynthCurrencyKey, 
                sUSD_CURRENCY_KEY, 
                sourceSynthAddress
            );
        }

        // approve AggregationRouterV4 to spend sUSD
        sUSD.safeApprove(address(router), _expectedAmountOfSUSDFromSwap);

        // swap sUSD for ETH or destination token
        (bool success, bytes memory result) = address(router).call(_data);
        if (!success) {
            revert(RevertReasonParser.parse(result, "SynthSwap: callBytes failed: "));
        }

        // record amount of ETH or destination token received from swap
        (uint amountOut) = abi.decode(result, (uint));
        
        // send amount of ETH or destination token to msg.sender
        if (_destTokenAddress == ETH_ADDRESS) {
            (success, result) = msg.sender.call{value: amountOut}("");
            if (!success) {
            revert(RevertReasonParser.parse(result, "SynthSwap: callBytes failed: "));
        }
        } else {
            IERC20(_destTokenAddress).safeTransfer(msg.sender, amountOut);
        }

        emit SwapOutOf(msg.sender, amountOut);

        // any remaining sUSD in contract should be transferred to treasury
        uint remainingBalanceSUSD = sUSD.balanceOf(address(this));
        if (remainingBalanceSUSD > 0) {
            sUSD.safeTransfer(treasury, remainingBalanceSUSD);
        }

        return amountOut;
    }

    /// @notice owner possesses ability to rescue tokens locked within contract 
    function rescueFunds(IERC20 token, uint256 amount) external onlyOwner {
        token.safeTransfer(msg.sender, amount);
    }

    //////////////////////////////////////
    ///////// INTERNAL FUNCTIONS /////////
    //////////////////////////////////////

    /// @notice addressResolver fetches ISynthetix address 
    function synthetix() internal view returns (ISynthetix) {
        return ISynthetix(addressResolver.requireAndGetAddress(
            CONTRACT_SYNTHETIX, 
            "Could not get Synthetix"
        ));
    }

    /// @notice execute swap on 1inch
    /// @dev token approval needed when source is not ETH
    /// @dev either source or destination token will ALWAYS be sUSD
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

        if (desc.srcToken != ETH_ADDRESS) {
            // if being called from swapInto, tokens have not been transfered to this contract
            if (!_areTokensInContract) {
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

    /// @notice get the proxy address from the synth implementation contract
    /// @dev only possible because Synthetix synths inherit Proxyable which track proxy()
    /// @param synthImplementation synth implementation address
    /// @return synthProxy proxy address
    function proxyForSynth(address synthImplementation) public returns (address synthProxy) {
        (bool success, bytes memory retVal) = synthImplementation.call(abi.encodeWithSignature("proxy()"));
        require(success, "get Proxy address failed");
        (synthProxy) = abi.decode(retVal, (address));
    }

}