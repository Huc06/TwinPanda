import hre from "hardhat"

async function main() {
  console.log("Deploying RWANFTContract to U2U testnet...")

  // Get the ContractFactory and Signers
  const RWANFTContract = await hre.ethers.getContractFactory("RWANFTContract")

  // Deploy the contract
  const rwaContract = await RWANFTContract.deploy()

  await rwaContract.waitForDeployment()

  const contractAddress = await rwaContract.getAddress()

  console.log("RWANFTContract deployed to:", contractAddress)
  console.log("Network:", hre.network.name)
  console.log("Chain ID:", hre.network.config.chainId)

  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployedAt: new Date().toISOString(),
  }

  console.log("Deployment Info:", JSON.stringify(deploymentInfo, null, 2))

  // Verify contract (optional)
  if (hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...")
    await rwaContract.deploymentTransaction().wait(6)

    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      })
      console.log("Contract verified successfully")
    } catch (error) {
      console.log("Verification failed:", error.message)
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
