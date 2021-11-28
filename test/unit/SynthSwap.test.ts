import { expect } from "chai";
import { ethers, artifacts, waffle } from "hardhat";

describe("SynthSwap", function () {
    it.only("Test external call", async () => {
        // Mock Setup
        const mockProvider = waffle.provider;
        const [wallet] = mockProvider.getWallets();
        const AGGREGATION_ROUTER_V3_ABI = [
            "function swap() external returns (uint)",
        ];
        const mockAggregationRouterV3 = await waffle.deployMockContract(
            wallet,
            AGGREGATION_ROUTER_V3_ABI
        );

        // Deployment
        const SYNTHETIX_PROXY =         "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F";
        const SUSD_PROXY =              "0x4d8dbd193d89b7b506be5dc9db75b91da00d6a1d"; // "0x57Ab1E02fEE23774580C119740129eAC7081e9D3"; TODO: figure out why calling proxy doesn't work
        const AGGREGATION_ROUTER_V3 =   "0x11111112542D85B3EF69AE05771c2dCCff4fAa26";
        const WETH =                    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
        const SETH_BYTES32 =            "0x7345544800000000000000000000000000000000000000000000000000000000";
        const SETH_PROXY =              "0x5e74c9036fb86bd7ecdcb084a0673efc32ea31cb";

        const SynthSwap = await ethers.getContractFactory("SynthSwap");
        const synthswap = await SynthSwap.deploy(
            SYNTHETIX_PROXY,
            SUSD_PROXY,
            ethers.constants.AddressZero,
            AGGREGATION_ROUTER_V3,
            WETH
        );
        await synthswap.deployed();
        
        // WETH -> SETH
        await expect(
            synthswap.swapInto(
                WETH,           // address inputTokenAddress
                1,              // uint256 inputTokenAmount
                SETH_BYTES32,   // bytes32 destinationSynthCurrencyKey
                3,              // uint256 slippage [0-50]
                "0x0000"        // todo
            )
        );

        // SETH -> WETH
        await expect(
            synthswap.swapOutOf(
                SETH_PROXY,     // address inputSynth
                SETH_BYTES32,   // bytes32 inputSynthCurrencyKey
                1,              // uint256 inputSynthAmount
                WETH,           // address destinationToken
                3,              // uint256 slippage
                "0x0000"        // todo
            )
        );

    });
});
