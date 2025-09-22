import "@nomicfoundation/hardhat-toolbox"
import "dotenv/config"

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    u2u_testnet: {
      url: process.env.U2U_RPC_URL || "https://rpc-nebulas-testnet.uniultra.xyz",
      chainId: 2484,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: process.env.GAS_PRICE ? parseInt(process.env.GAS_PRICE) : 20000000000, // 20 gwei
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
  etherscan: {
    // U2U testnet explorer configuration
    apiKey: {
      u2u_testnet: process.env.ETHERSCAN_API_KEY || "your-api-key",
    },
    customChains: [
      {
        network: "u2u_testnet",
        chainId: 2484,
        urls: {
          apiURL: "https://testnet.u2uscan.xyz/api",
          browserURL: "https://testnet.u2uscan.xyz",
        },
      },
    ],
  },
}
