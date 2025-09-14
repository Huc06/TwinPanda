// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {RWANFTContract} from "../src/RWANFTContract.sol";

contract DeployScript is Script {
    function setUp() public {}

    function run() public {
        // Sử dụng private key từ environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        console.log("Deployer address:", vm.addr(deployerPrivateKey));
        console.log("Deployer balance:", address(vm.addr(deployerPrivateKey)).balance / 1e18, "U2U");
        
        vm.startBroadcast(deployerPrivateKey);

        RWANFTContract rwaContract = new RWANFTContract();

        vm.stopBroadcast();

        console.log("==========================================");
        console.log("RWANFTContract deployed successfully!");
        console.log("Contract Address:", address(rwaContract));
        console.log("Network:", vm.envOr("NETWORK", string("local")));
        console.log("==========================================");
        console.log("");
        console.log("Next steps:");
        console.log("1. Copy contract address above");
        console.log("2. Update .env.local in frontend:");
        console.log("   NEXT_PUBLIC_CONTRACT_ADDRESS=<contract_address>");
        console.log("3. Run frontend: npm run dev");
    }
}