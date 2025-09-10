// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title RWANFTContract
 * @dev ERC-721 contract for Real World Asset NFTs with AR integration
 */
contract RWANFTContract is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // Mapping from token ID to RWA metadata
    mapping(uint256 => RWAMetadata) public rwaMetadata;
    
    struct RWAMetadata {
        string itemName;
        string serialNumber;
        uint256 mintTimestamp;
        address originalOwner;
    }
    
    event NFTMinted(
        uint256 indexed tokenId,
        address indexed to,
        string itemName,
        string serialNumber,
        string metadataURI
    );
    
    constructor() ERC721("RWA NFT", "RWANFT") {}
    
    /**
     * @dev Mint a new RWA NFT
     * @param to Address to mint the NFT to
     * @param metadataURI URI pointing to the NFT metadata JSON
     * @param itemName Name of the real world asset
     * @param serialNumber Serial number of the real world asset
     */
    function mintNFT(
        address to,
        string memory metadataURI,
        string memory itemName,
        string memory serialNumber
    ) public returns (uint256) {
        require(bytes(metadataURI).length > 0, "Metadata URI cannot be empty");
        require(bytes(itemName).length > 0, "Item name cannot be empty");
        require(bytes(serialNumber).length > 0, "Serial number cannot be empty");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        // Store RWA metadata
        rwaMetadata[tokenId] = RWAMetadata({
            itemName: itemName,
            serialNumber: serialNumber,
            mintTimestamp: block.timestamp,
            originalOwner: to
        });
        
        emit NFTMinted(tokenId, to, itemName, serialNumber, metadataURI);
        
        return tokenId;
    }
    
    /**
     * @dev Get RWA metadata for a token
     */
    function getRWAMetadata(uint256 tokenId) public view returns (RWAMetadata memory) {
        require(_exists(tokenId), "Token does not exist");
        return rwaMetadata[tokenId];
    }
    
    /**
     * @dev Get total number of minted tokens
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    // Override required functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
