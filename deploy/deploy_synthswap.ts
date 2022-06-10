import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

// constructor variables: Mainnet OE network
const SUSD_PROXY = "0x8c6f28f2F1A3C87F0f938b96d27520d9751ec8d9";
const AGGREGATION_ROUTER_V4 = "0x1111111254760F7ab3F16433eea9304126DCd199";
const ADDRESS_RESOLVER = "0x95A6a3f44a70172E7d50a9e28c85Dfd712756B8C";
const VOLUME_REWARDS = "0x82d2242257115351899894eF384f779b5ba8c695";
const TREASURY_DAO = "0x82d2242257115351899894eF384f779b5ba8c695";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deploy } = hre.deployments;
    const { deployer } = await hre.getNamedAccounts();
    console.log("deployer", deployer)
    await deploy("SynthSwap", {
        from: deployer,
        args: [
            SUSD_PROXY,
            AGGREGATION_ROUTER_V4,
            ADDRESS_RESOLVER,
            VOLUME_REWARDS,
            TREASURY_DAO,
        ],
        log: true,
    });
};
export default func;
module.exports.tags = ["SynthSwap"];
