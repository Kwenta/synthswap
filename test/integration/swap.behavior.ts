import { expect } from "chai";
import { ethers, artifacts, waffle, network } from "hardhat";
import dotenv from "dotenv";

dotenv.config();

const TEST_ADDRESS =            "0x70997970c51812dc3a010c7d01b50e0d17dc79c8"; // Make sure it has ETH
const SYNTHETIX_PROXY =         "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F";
const SUSD_PROXY =              "0x4d8dbd193d89b7b506be5dc9db75b91da00d6a1d"; // "0x57Ab1E02fEE23774580C119740129eAC7081e9D3"; TODO: figure out why calling proxy doesn't work
const SETH_PROXY =              "0x5e74c9036fb86bd7ecdcb084a0673efc32ea31cb";
const AGGREGATION_ROUTER_V3 =   "0x11111112542D85B3EF69AE05771c2dCCff4fAa26";
const WETH =                    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const SETH_BYTES32 =            "0x7345544800000000000000000000000000000000000000000000000000000000";

describe("Integration: Test SynthSwap.sol", function () {
    before(async () => {
        await network.provider.request({
            method: "hardhat_reset",
            params: [
                {
                    forking: {
                        jsonRpcUrl: process.env.ARCHIVE_NODE_URL,
                        blockNumber: 13143718,
                    },
                },
            ],
        });

        await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [TEST_ADDRESS],
        });
    });

    it("Test swap of ETH into sETH", async () => {
        // Deploy SynthSwap
        const SynthSwap = await ethers.getContractFactory("SynthSwap");
        const synthswap = await SynthSwap.deploy(
            SYNTHETIX_PROXY,
            SUSD_PROXY,
            ethers.constants.AddressZero,
            AGGREGATION_ROUTER_V3,
            WETH
        );
        await synthswap.deployed();

        const signer = await ethers.getSigner(TEST_ADDRESS);

        await synthswap
            .connect(signer)    // Call swap from TEST_ADDRESS
            .swapIntoWithETH(
                1,              // uint256 amount
                SETH_BYTES32,   // bytes32 destinationSynthCurrencyKey
                3,              // uint256 slippage [0-50]
                {
                    gasLimit: 1000000, // If tx reverts increase gas limit
                    value: ethers.BigNumber.from("100000000000000000"),
                }
            );

        // Check to see if sETH balance increased
        const IERC20ABI = (await artifacts.readArtifact("IERC20")).abi;
        const mockProvider = waffle.provider;
        const sETH = new ethers.Contract(SETH_PROXY, IERC20ABI, mockProvider);
        expect(await sETH.balanceOf(TEST_ADDRESS)).to.match(
            /101602401655988153/ // Specific output amount at current block.
        );
    });
});
