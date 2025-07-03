import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";
import * as dotenv from "dotenv";
import "@openzeppelin/hardhat-upgrades";

import "./tasks/deploy";
import "@zetachain/localnet/tasks";
import "@zetachain/toolkit/tasks";
import { getHardhatConfig } from "@zetachain/toolkit/client";

dotenv.config();

if (!process.env.PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY environment variable is not set");
}

const config: HardhatUserConfig = {
  ...getHardhatConfig({ accounts: [process.env.PRIVATE_KEY] }),
  solidity: {
    version: "0.8.26", 
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    },
  },
  networks: {
    localhost: {
      url: "http://localhost:8545",
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
      },
    },
    zeta_testnet: {
      url: "https://zetachain-athens-evm.blockpi.network/v1/rpc/public",
      chainId: 7001,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};

export default config;