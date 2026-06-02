// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GroupChallenge {

    uint public challengeCount;

    struct Challenge {
        uint id;
        string name;
        uint duration;   // u danima
        uint entryFee;   // ETH (wei)
        address creator;
        uint prizePool;
        bool active;
    }

    mapping(uint => Challenge) public challenges;
    mapping(uint => address[]) public participants;
    mapping(uint => mapping(address => bool)) public joined;

    // CREATE CHALLENGE
    function createChallenge(
        string memory _name,
        uint _duration,
        uint _entryFee
    ) public {
        challengeCount++;

        challenges[challengeCount] = Challenge({
            id: challengeCount,
            name: _name,
            duration: _duration,
            entryFee: _entryFee,
            creator: msg.sender,
            prizePool: 0,
            active: true
        });
    }

    // JOIN CHALLENGE
    function joinChallenge(uint challengeId) public payable {

        Challenge storage c = challenges[challengeId];

        require(c.active, "Not active");
        require(!joined[challengeId][msg.sender], "Already joined");
        require(msg.value == c.entryFee, "Wrong entry fee");

        participants[challengeId].push(msg.sender);
        joined[challengeId][msg.sender] = true;

        c.prizePool += msg.value;
    }

    // GET CHALLENGE
    function getChallenge(uint id)
        public
        view
        returns (
            uint,
            string memory,
            uint,
            uint,
            address,
            uint,
            bool
        )
    {
        Challenge memory c = challenges[id];

        return (
            c.id,
            c.name,
            c.duration,
            c.entryFee,
            c.creator,
            c.prizePool,
            c.active
        );
    }

    // GET PARTICIPANTS
    function getParticipants(uint id) public view returns (address[] memory) {
        return participants[id];
    }
}