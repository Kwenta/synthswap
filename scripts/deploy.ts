// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

// constructor variables
const SYNTHETIX_PROXY = "0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4"; // ProxyERC20
const SUSD_PROXY = "0x8c6f28f2F1A3C87F0f938b96d27520d9751ec8d9"; // ProxyERC20sUSD
const VOLUME_REWARDS = hre.ethers.constants.AddressZero;
const AGGREGATION_ROUTER_V4 = "0x1111111254760f7ab3f16433eea9304126dcd199";
const ADDRESS_RESOLVER = "0x95A6a3f44a70172E7d50a9e28c85Dfd712756B8C";

async function main() {
    // Hardhat always runs the compile task when running scripts with its command
    // line interface.
    //
    // If this script is run directly using `node` you may want to call compile
    // manually to make sure everything is compiled
    // await hre.run('compile');

    // We get the contract to deploy
    const SynthSwap = await hre.ethers.getContractFactory("SynthSwap");
    const synthswap = await SynthSwap.deploy(
        SYNTHETIX_PROXY,
        SUSD_PROXY,
        VOLUME_REWARDS,
        AGGREGATION_ROUTER_V4,
        ADDRESS_RESOLVER
    );
    await synthswap.deployed();

    console.log("Synthswap deployed to:", synthswap.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
