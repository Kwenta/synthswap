// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

const SYNTHETIX_PROXY = "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F";
const SUSD_PROXY = "0x57Ab1E02fEE23774580C119740129eAC7081e9D3";
const AGGREGATION_ROUTER_V3 = "0x11111112542D85B3EF69AE05771c2dCCff4fAa26";

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
        hre.ethers.constants.AddressZero,
        AGGREGATION_ROUTER_V3
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
