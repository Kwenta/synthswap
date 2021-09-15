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
        const SYNTHETIX = "0x43AE8037179a5746D618DA077A38DdeEa9640cBa";
        const sUSD = "0x57ab1ec28d129707052df4df418d58a2d46d5f51";
        const VOLUME_REWARDS = "0x0000000000000000000000000000000000000000";
        const AGGREGATION_ROUTER_V3 = "0x11111112542D85B3EF69AE05771c2dCCff4fAa26";

        const SynthSwap = await ethers.getContractFactory("SynthSwap");
        const synthswap = await SynthSwap.deploy(
            SYNTHETIX,
            sUSD,
            VOLUME_REWARDS,
            AGGREGATION_ROUTER_V3
        );
        await synthswap.deployed();

        await expect(
            synthswap.swapInto(
                "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH
                0.01,
                "key", //sAAVE
                5
            )
        ).to.equal(null);

        await expect(
            synthswap.swapOutOf(
                "0xd2dF355C19471c8bd7D8A3aa27Ff4e26A21b4076", // sAAVE
                "key",
                0.01,
                "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH
                5
            )
        ).to.equal(null);

    });
});
