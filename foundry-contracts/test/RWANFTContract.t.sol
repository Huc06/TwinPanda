// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {RWANFTContract} from "../src/RWANFTContract.sol";

contract RWANFTContractTest is Test {
    RWANFTContract public rwaContract;
    address public owner;
    address public user;

    function setUp() public {
        owner = address(this);
        user = makeAddr("user");
        rwaContract = new RWANFTContract();
    }

    function testMintNFT() public {
        string memory itemName = "Luxury Watch";
        string memory serialNumber = "LW-2024-001";
        string memory metadataURI = "https://example.com/metadata.json";

        uint256 tokenId = rwaContract.mintNFT(
            user,
            metadataURI,
            itemName,
            serialNumber
        );

        assertEq(tokenId, 0);
        assertEq(rwaContract.ownerOf(tokenId), user);
        assertEq(rwaContract.totalSupply(), 1);

        RWANFTContract.RWAMetadata memory metadata = rwaContract.getRWAMetadata(tokenId);
        assertEq(metadata.itemName, itemName);
        assertEq(metadata.serialNumber, serialNumber);
        assertEq(metadata.originalOwner, user);
        assertTrue(metadata.mintTimestamp > 0);
    }

    function testTokenURI() public {
        string memory itemName = "Luxury Watch";
        string memory serialNumber = "LW-2024-001";
        string memory metadataURI = "https://example.com/metadata.json";

        uint256 tokenId = rwaContract.mintNFT(
            user,
            metadataURI,
            itemName,
            serialNumber
        );

        assertEq(rwaContract.tokenURI(tokenId), metadataURI);
    }

    function testMultipleMints() public {
        // Mint first NFT
        rwaContract.mintNFT(
            user,
            "https://example.com/metadata1.json",
            "Luxury Watch",
            "LW-2024-001"
        );

        // Mint second NFT
        address user2 = makeAddr("user2");
        uint256 tokenId2 = rwaContract.mintNFT(
            user2,
            "https://example.com/metadata2.json",
            "Luxury Ring",
            "LR-2024-002"
        );

        assertEq(tokenId2, 1);
        assertEq(rwaContract.totalSupply(), 2);
        assertEq(rwaContract.ownerOf(0), user);
        assertEq(rwaContract.ownerOf(1), user2);
    }
}
