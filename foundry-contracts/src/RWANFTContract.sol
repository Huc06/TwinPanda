// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RWANFTContract
 * @dev ERC-721 contract for Real World Asset NFTs with AR integration
 */
contract RWANFTContract is ERC721, Ownable {
    uint256 private _tokenIdCounter;
    
    // Mapping from token ID to RWA metadata
    mapping(uint256 => RWAMetadata) public rwaMetadata;
    
    // Mapping from token ID to URI
    mapping(uint256 => string) private _tokenURIs;
    
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
    
    constructor() ERC721("RWA NFT", "RWANFT") Ownable(msg.sender) {}
    
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
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
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
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return rwaMetadata[tokenId];
    }
    
    /**
     * @dev Get total number of minted tokens
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @dev Get token URI
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _tokenURIs[tokenId];
    }
    
    /**
     * @dev Set token URI
     */
    function _setTokenURI(uint256 tokenId, string memory uri) internal {
        _tokenURIs[tokenId] = uri;
    }
}