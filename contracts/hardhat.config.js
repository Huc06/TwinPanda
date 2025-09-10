require("@nomicfoundation/hardhat-toolbox")

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
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
      url: "https://rpc-nebulas-testnet.uniultra.xyz",
      chainId: 2484,
      accounts: [
        // Add your private key here for deployment
        // process.env.PRIVATE_KEY || "your-private-key-here"
      ],
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
  etherscan: {
    // U2U testnet explorer configuration
    apiKey: {
      u2u_testnet: "your-api-key",
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
