import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "hardhat-deploy";
import "hardhat-interact";
import dotenv from "dotenv";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
export default {
  solidity: {
    compilers: [
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
      },
      {
        version: "0.7.0",
      },
      {
        version: "0.7.6",
      },
    ],
  },
  networks: {
    localhost: {
      chainId: 31337,
    },
    "optimistic-kovan": {
      url: `https://opt-kovan.g.alchemy.com/v2/${process.env.ALCHEMY_TESTNET_API_KEY}`,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : undefined,
      verify: {
        etherscan: {
          apiUrl: 'https://api-kovan-optimistic.etherscan.io'
        }
      }
    },
    "optimistic-mainnet": {
      url: `https://opt-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : undefined,
      verify: {
        etherscan: {
          apiUrl: 'https://api-optimistic.etherscan.io'
        }
      }
    },
  },
  namedAccounts: {
    deployer: {
        default: 0, // here this will by default take the first account as deployer
    }
}
};
