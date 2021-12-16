import { expect } from "chai";
import { ethers, artifacts, waffle, network } from "hardhat";
import dotenv from "dotenv";

dotenv.config();

// constructor variables
const SYNTHETIX_PROXY = "0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4"; // ProxyERC20
const SUSD_PROXY = "0x8c6f28f2F1A3C87F0f938b96d27520d9751ec8d9"; // ProxyERC20sUSD
const VOLUME_REWARDS = ethers.constants.AddressZero;
const AGGREGATION_ROUTER_V4 = "0x1111111254760f7ab3f16433eea9304126dcd199";
const ADDRESS_RESOLVER = "0x95A6a3f44a70172E7d50a9e28c85Dfd712756B8C";

const TEST_ADDRESS = "0x9aA1df3db80d7A8168FcDCaC79d3e9663Dc09E4A";
const SETH_PROXY = "0xE405de8F52ba7559f9df3C368500B6E6ae6Cee49";

/* https://api.1inch.exchange/v4.0/10/swap?
 * fromTokenAddress=0x4200000000000000000000000000000000000006&
 * toTokenAddress=0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9&
 * amount=4&
 * fromAddress=0x9aA1df3db80d7A8168FcDCaC79d3e9663Dc09E4A&
 * slippage=50&
 * destReceiver=0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&
 * disableEstimate=true
 */
const TRANSACTION_PAYLOAD_1INCH =
    "0x7c02520000000000000000000000000026271dfddbd250014f87f0f302c099d5a798bab10000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000018000000000000000000000000042000000000000000000000000000000000000060000000000000000000000008c6f28f2f1a3c87f0f938b96d27520d9751ec8d900000000000000000000000026271dfddbd250014f87f0f302c099d5a798bab1000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa0000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000176b00000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000208000000000000000000000002e80d5a7b3c613d854ee43243ff09808108561eb000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000104128acb080000000000000000000000001111111254760f7ab3f16433eea9304126dcd1990000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000001000276a400000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000004000000000000000000000000042000000000000000000000000000000000000060000000000000000000000008c6f28f2f1a3c87f0f938b96d27520d9751ec8d900000000000000000000000000000000000000000000000000000000cfee7c08";

const SETH_BYTES32 = "0x7345544800000000000000000000000000000000000000000000000000000000";
const WETH_ADDRESS = "0x4200000000000000000000000000000000000006";

describe("Integration: Test Synthswap.sol", function () {
    before(async () => {
        await network.provider.request({
            method: "hardhat_reset",
            params: [
                {
                    forking: {
                        jsonRpcUrl: process.env.ARCHIVE_NODE_URL,
                        blockNumber: 1234465,
                    },
                },
            ],
        });

        await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [TEST_ADDRESS],
        });
        
        await network.provider.request({
            method: "hardhat_setBalance",
            params: [TEST_ADDRESS, ethers.utils.parseEther("10").toHexString()],
        });
    });

    it("Test SynthSwap deployment", async () => {
        const SynthSwap = await ethers.getContractFactory("SynthSwap");
        const synthswap = await SynthSwap.deploy(
            SYNTHETIX_PROXY,
            SUSD_PROXY,
            VOLUME_REWARDS,
            AGGREGATION_ROUTER_V4,
            ADDRESS_RESOLVER
        );
        await synthswap.deployed();
        expect(synthswap.address).to.exist;
    });

    it("Test swap ETH into sETH", async () => {
        // ETH -(1inchAggregator)-> sUSD -(Synthetix)-> sETH
        const SynthSwap = await ethers.getContractFactory("SynthSwap");
        const synthswap = await SynthSwap.deploy(
            SYNTHETIX_PROXY,
            SUSD_PROXY,
            VOLUME_REWARDS,
            AGGREGATION_ROUTER_V4,
            ADDRESS_RESOLVER
        );
        await synthswap.deployed();

        const IERC20ABI = (await artifacts.readArtifact("IERC20")).abi;
        const mockProvider = waffle.provider;
        const signer = await ethers.getSigner(TEST_ADDRESS);

        // pre-swap balance
        const sETH = new ethers.Contract(SETH_PROXY, IERC20ABI, mockProvider);
        const preBalance = await sETH.balanceOf(TEST_ADDRESS);
        
        // approve AGGREGATION_ROUTER_V4 to spend 4 WETH
        const WETH = new ethers.Contract(WETH_ADDRESS, IERC20ABI);
        WETH.connect(signer).approve(AGGREGATION_ROUTER_V4, 4);

        // Replace 0xaaa... placeholder from generated payload with deployed SynsthSwap address.
        // This is because when generating the 1inch payload we need to specify a destination receiver address,
        // which is our SynthSwap contract, and this is not known ahead of time.
        const TRANSACTION_PAYLOAD_1INCH_WITH_DEST_AS_CONTRACT =
            TRANSACTION_PAYLOAD_1INCH.replace(
                /aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/g,
                synthswap.address.substring(2) // Slice off "0x"
            );

        await synthswap
            .connect(signer) // Call swap from TEST_ADDRESS
            .swapInto(
                SETH_BYTES32,
                TRANSACTION_PAYLOAD_1INCH_WITH_DEST_AS_CONTRACT,
                {
                    // For optimism you need to set fixed gasPrice and higher gasLimit
                    gasPrice: ethers.utils.parseUnits('1', 'gwei'),
                    gasLimit: 30000000, // max gasLimit per block
                    //value: ethers.BigNumber.from("100000000"), 
                }
            );
        
        // post-swap balance
        const postBalance = await sETH.balanceOf(TEST_ADDRESS);

        // Check ETH balance increased
        expect(postBalance).to.be.above(preBalance);
        //expect(postBalance.toString()).to.equal("98802617794637161");
    }).timeout(200000);

    it.skip("Test swap sETH to WETH", async () => { 
        // sETH -(Synthetix)-> sUSD -(1inchAggregator)-> WETH
        const SynthSwap = await ethers.getContractFactory("SynthSwap");
        const synthswap = await SynthSwap.deploy(
            SYNTHETIX_PROXY,
            SUSD_PROXY,
            VOLUME_REWARDS,
            AGGREGATION_ROUTER_V4,
            ADDRESS_RESOLVER
        );
        await synthswap.deployed();

        const IERC20ABI = (await artifacts.readArtifact("IERC20")).abi;
        const mockProvider = waffle.provider;
        const signer = await ethers.getSigner(TEST_ADDRESS);
        
        // pre-swap balance
        const WETH = new ethers.Contract(WETH_ADDRESS, IERC20ABI, mockProvider);
        const preBalance = await WETH.balanceOf(TEST_ADDRESS);

        // Replace 0xaaa... placeholder from generated payload with deployed SynthSwap address.
        // This is because when generating the 1inch payload we need to specify a destination receiver address,
        // which is our SynthSwap contract, and this is not known ahead of time.
        var TRANSACTION_PAYLOAD_1INCH_WITH_DEST_AS_CONTRACT =
            TRANSACTION_PAYLOAD_1INCH.replace(
                /aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/g,
                synthswap.address.substring(2) // Slice off "0x"
            );
        
        // to token address (i.e. sETH (prev was sUSD))
        TRANSACTION_PAYLOAD_1INCH_WITH_DEST_AS_CONTRACT =
            TRANSACTION_PAYLOAD_1INCH.replace(
                SUSD_PROXY.substring(2), // sUSD
                SETH_PROXY.substring(2) // Slice off "0x"
            );
        
        // from token address (i.e. sUSD (prev was WETH))
        TRANSACTION_PAYLOAD_1INCH_WITH_DEST_AS_CONTRACT =
            TRANSACTION_PAYLOAD_1INCH.replace(
                WETH_ADDRESS.substring(2), // WETH
                SUSD_PROXY.substring(2) // Slice off "0x"
            );

        await synthswap
            .connect(signer) // Call swap from TEST_ADDRESS
            .swapOutOf(
                SETH_BYTES32,
                1,
                TRANSACTION_PAYLOAD_1INCH_WITH_DEST_AS_CONTRACT,
                {
                    // For optimism you need to set fixed gasPrice and higher gasLimit
                    gasPrice: ethers.utils.parseUnits('1', 'gwei'),
                    gasLimit: 30000000, // max gasLimit per block
                }
            );
        
        // post-swap balance
        const postBalance = await WETH.balanceOf(TEST_ADDRESS);

        // Check ETH balance increased
        expect(postBalance).to.be.above(preBalance);
        //expect(postBalance.toString()).to.equal("98802617794637161");
    }).timeout(200000);
});