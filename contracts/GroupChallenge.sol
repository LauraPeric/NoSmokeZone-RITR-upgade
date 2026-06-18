// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Interface nam treba samo da znamo pozvati mintBadge funkciju
interface ISmokeFreeBadges {
    function mintBadge(address user, uint milestone) external;
}

contract GroupChallenge {
    uint public challengeCount;
    ISmokeFreeBadges public badgeContract;

    event ChallengeCreated(uint challengeId, string name, address creator);

    struct Challenge {
        uint id;
        string name;
        string password;
        uint duration;
        uint entryFee;
        address creator;
        uint prizePool;
        uint startTime;
        bool active;
    }

    mapping(uint => Challenge) public challenges;
    mapping(uint => address[]) public participants;
    mapping(uint => mapping(address => bool)) public joined;
    mapping(uint => mapping(address => bool)) public isFailed;

    // Ovu funkciju pozivaš jednom nakon deploymenta da povežeš ugovore
    function setBadgeContract(address _addr) public {
        badgeContract = ISmokeFreeBadges(_addr);
    }

    function createChallenge(string memory _name, string memory _password, uint _duration, uint _entryFee) public {
        challengeCount++;
        challenges[challengeCount] = Challenge(
            challengeCount,
            _name,
            _password,
            _duration,
            _entryFee,
            msg.sender,
            0,
            block.timestamp,
            true
        );
        emit ChallengeCreated(challengeCount, _name, msg.sender);
    }

    function joinChallenge(uint challengeId) public payable {
        Challenge storage c = challenges[challengeId];
        require(c.active, "Not active");
        require(!joined[challengeId][msg.sender], "Already joined");
        require(msg.value == c.entryFee, "Wrong entry fee");

        participants[challengeId].push(msg.sender);
        joined[challengeId][msg.sender] = true;
        c.prizePool += msg.value;
    }

    function reportFail(uint challengeId) public {
        require(joined[challengeId][msg.sender], "Not participant");
        isFailed[challengeId][msg.sender] = true;
    }

    function claimPrize(uint challengeId) public {
        Challenge storage c = challenges[challengeId];

        require(c.active, "Already finished");
        require(block.timestamp >= c.startTime + (c.duration * 1 days), "Challenge still active");
        require(joined[challengeId][msg.sender], "Not participant");
        require(!isFailed[challengeId][msg.sender], "Failed participant");

        uint winners = 0;
        bool allSurvived = true;

        for (uint i = 0; i < participants[challengeId].length; i++) {
            if (isFailed[challengeId][participants[challengeId][i]]) {
                allSurvived = false;
            } else {
                winners++;
            }
        }

        require(winners > 0, "No winners");

        // NFT reward ako su svi uspjeli
        if (allSurvived && address(badgeContract) != address(0)) {
            for (uint i = 0; i < participants[challengeId].length; i++) {
                badgeContract.mintBadge(participants[challengeId][i], 100);
            }
        }

        uint reward = c.prizePool / winners;
        c.active = false;
        c.prizePool -= reward;

        (bool success, ) = payable(msg.sender).call{value: reward}("");
        require(success, "Transfer failed");
    }

    // Mint Shared Group NFT"
    function mintGroupNFT(uint challengeId) public {
        Challenge storage c = challenges[challengeId];

        require(!c.active, "Challenge not finished yet");
        require(block.timestamp >= c.startTime + (c.duration * 1 days), "Too early");
        require(address(badgeContract) != address(0), "Badge contract not set");

        bool allSurvived = true;

        for (uint i = 0; i < participants[challengeId].length; i++) {
            if (isFailed[challengeId][participants[challengeId][i]]) {
                allSurvived = false;
                break;
            }
        }

        require(allSurvived, "Not all participants survived");

        for (uint i = 0; i < participants[challengeId].length; i++) {
            badgeContract.mintBadge(participants[challengeId][i], 100);
        }
    }

    function getChallenge(uint id) public view returns (
        uint,
        string memory,
        string memory,
        uint,
        uint,
        address,
        uint,
        uint,
        bool
    ) {
        Challenge memory c = challenges[id];
        return (c.id, c.name, c.password, c.duration, c.entryFee, c.creator, c.prizePool, c.startTime, c.active);
    }

    function getParticipants(uint id) public view returns (address[] memory) {
        return participants[id];
    }
}