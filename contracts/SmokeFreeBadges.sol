// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol"; // nft standard - mint nft+save metadatalinkuri
import "@openzeppelin/contracts/access/Ownable.sol"; // owner raditi funkcije

contract SmokeFreeBadges is ERC721URIStorage, Ownable { // nft contract+ima owner kontrolu
    
    uint256 public tokenId; // broji nft-ove
    mapping(address => mapping(uint => bool)) public hasBadge; // je li dobio badgr
    address public noSmokeContract; // adresa contracta koji smije mintati

    // GROUP BADGE SEPARATION

    uint public constant GROUP_MILESTONE = 100;

    constructor() ERC721("SmokeFreeBadge", "SFB") {} // kreiranje nft kolekcije

    function setNoSmokeContract(address _addr) public onlyOwner {
        noSmokeContract = _addr; // owner postavlja koji contract smije mintati badgeve
    }

    function mintBadge(address user, uint milestone) public { // stvara nft
        require(msg.sender == noSmokeContract, "Not allowed"); // samo on moze mint

        // =========================
        // SOLO + GROUP SEPARATION FIX
        // =========================
        require(
            milestone == 1 || 
            milestone == 7 || 
            milestone == 15 || 
            milestone == 30 || 
            milestone == 60 || 
            milestone == GROUP_MILESTONE, // GROUP NFT (100)
            "Invalid milestone"
        );

        tokenId++; // svaki nft dobije id
        _safeMint(user, tokenId); // mintanje nfta useru
        
        string memory uri = getTokenURI(milestone);
        _setTokenURI(tokenId, uri);
        
        // hasBadge[user][milestone] = true;
    }

    function getTokenURI(uint milestone) internal pure returns (string memory) { // vraca ipfs za svaki badge
        if (milestone == 1) {
            return "ipfs://bafybeif5ujkllemacyptavexdu6lx2wfscxnlkokcwvbpb6bepn25wtp4q/day1.json";
        }
        if (milestone == 7) {
            return "ipfs://bafybeif5ujkllemacyptavexdu6lx2wfscxnlkokcwvbpb6bepn25wtp4q/day7.json";
        }
        if (milestone == 15) {
            return "ipfs://bafybeif5ujkllemacyptavexdu6lx2wfscxnlkokcwvbpb6bepn25wtp4q/day15.json";
        }
        if (milestone == 30) {
            return "ipfs://bafybeif5ujkllemacyptavexdu6lx2wfscxnlkokcwvbpb6bepn25wtp4q/day30.json";
        }
        if (milestone == 60) {
            return "ipfs://bafybeif5ujkllemacyptavexdu6lx2wfscxnlkokcwvbpb6bepn25wtp4q/day60.json";
        }
        
        // GROUP NFT URI (100)
        if (milestone == GROUP_MILESTONE) {
            return "ipfs://bafkreignkt7xq7smgiyz2t6n27yxgwy4i7aafqhi2xm4tz5dlsgzbk5i7i/day100.json";
        }
        
        return "";
    }
}
