import { expect } from "chai";
import { ethers, artifacts, waffle, network } from "hardhat";
import dotenv from "dotenv";

dotenv.config();

const TEST_ADDRESS =            "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"; // Make sure it has ETH
const SYNTHETIX_PROXY =         "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F";
const SUSD_PROXY =              "0x4d8dbd193d89b7b506be5dc9db75b91da00d6a1d"; // "0x57Ab1E02fEE23774580C119740129eAC7081e9D3"; TODO: figure out why calling proxy doesn't work
const SUSD =                    "0x57Ab1ec28D129707052df4dF418D58a2D46d5f51";
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
        const chain_id = "";
        const amount = "10000000000000000";
        const slippage = 1;

        const endpoint_1inch = 
                "https://api.1inch.exchange/v3.0/" + chain_id 
                + "/swap?fromTokenAddress=" + WETH
                + "&toTokenAddress=" + SUSD
                + "&amount=" + amount
                + "&fromAddress=" + synthswap.address
                + "&slippage=" + slippage
                + "&destReceiver= " + synthswap.address
                + "disableEstimate=true'";

        // Resulting tx.data from above API call
        // 1inch said to get mock data without actually executing a swap, set "disableEstimate: true".
        // "https://api.1inch.exchange/v3.0/1/swap?fromTokenAddress=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2&toTokenAddress=0x57Ab1ec28D129707052df4dF418D58a2D46d5f51&amount=10000000000000000&fromAddress=0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266&slippage=3&destReceiver=0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266&disableEstimate=true"
        // TEST_ADDRESS is set to accounts[0] on forked main network
        const call_data = 
            "0x2e95b6c8000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
            + "000000000000000000000000000000000000000000000000002386f26fc1000000000000"
            + "0000000000000000000000000000000000000001c3236980d23fefdb0000000000000000"
            + "000000000000000000000000000000000000000000000080000000000000000000000000"
            + "000000000000000000000000000000000000000180000000000000003b6d0340f1f85b2c"
            + "54a2bd284b1cf4141d64fd171bd85539";

        await synthswap
            .connect(signer)    // Call swap from TEST_ADDRESS
            .swapIntoWithETH(
                SETH_BYTES32,   // bytes32 destinationSynthCurrencyKey
                970000,         // uint minOut (3% slippage)
                call_data,      // bytes calldata _data
                {
                    gasLimit: 1000000, // If tx reverts increase gas limit
                    value: ethers.BigNumber.from(amount),
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