// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

interface IBadge { //neki drugi contract korsiti mintbadge
    function mintBadge(address user, uint milestone) external;
}

contract NoSmokeNFT is ERC721 { //kreiranje contracta-nasljeduje nft

    struct UserData {
        uint256 streak;
        uint256 lastUpdate;
    }

    mapping(address => UserData) public users; //za svaki wallet address spremam UserData
    mapping(address => mapping(uint256 => bool)) public mintedMilestones; //pamti dobivene badgeve

    uint256[] public milestoneSteps = [1, 7, 15, 30, 60];

    address public badgeContract;

    constructor(address _badgeContract) ERC721("NoSmokeNFT", "NSNFT") {
        badgeContract = _badgeContract; //sprema adresu drugog contracta
    }
    
    function getStreak(address user) external view returns (uint256) { 
      return users[user].streak; //cita podatke - koliko dana korsinik ima streak 
    }
   
    function resetStreak() external {
      users[msg.sender].streak = 0; 
    }
    
    function markSmokeFree() external {
        UserData storage user = users[msg.sender]; //uzima podatke trenutnog korisnika
        // dodati za stvarnu upotrebu
        /* if (block.timestamp > user.lastUpdate + 2 days) {
            user.streak = 0;
        } 
        */

        user.streak += 1;
        user.lastUpdate = block.timestamp;

        for (uint i = 0; i < milestoneSteps.length; i++) { //prolazi kroz milestonoe
            uint milestone = milestoneSteps[i];

            if (
                user.streak == milestone &&
                !mintedMilestones[msg.sender][milestone] //ako dode user do milst nije dobio madge
            ) {
                IBadge(badgeContract).mintBadge(msg.sender, milestone); //poziva drugi contract

                mintedMilestones[msg.sender][milestone] = true;
            }
        }
    }
}