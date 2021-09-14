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
        await mockAggregationRouterV3.mock.swap.revertsWithReason("Test");

        // Deployment
        const SynthSwap = await ethers.getContractFactory("SynthSwap");
        const synthswap = await SynthSwap.deploy(
            ethers.constants.AddressZero,
            ethers.constants.AddressZero,
            ethers.constants.AddressZero,
            mockAggregationRouterV3.address
        );
        await synthswap.deployed();

        //
        const iface = new ethers.utils.Interface(AGGREGATION_ROUTER_V3_ABI);
        await expect(
            synthswap.swapInto(
                iface.getSighash("swap"),
                ethers.constants.HashZero
            )
        ).to.be.revertedWith("Test");
    });
});
