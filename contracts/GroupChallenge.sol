// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GroupChallenge {

    uint public challengeCount;

    // EVENT - vraća ID odmah u frontend
    event ChallengeCreated(
        uint challengeId,
        string name,
        address creator
    );

    struct Challenge {
        uint id;
        string name;
        string password;

        uint duration;   // u danima
        uint entryFee;   // ETH (wei)

        address creator;

        uint prizePool;

        uint startTime;

        bool active;
    }

    mapping(uint => Challenge) public challenges;

    mapping(uint => address[]) public participants;

    mapping(uint => mapping(address => bool)) public joined;

    mapping(uint => mapping(address => bool)) public isFailed;

    // CREATE CHALLENGE
    function createChallenge(
        string memory _name,
        string memory _password,
        uint _duration,
        uint _entryFee
    ) public {

        challengeCount++;

        challenges[challengeCount] = Challenge({
            id: challengeCount,
            name: _name,
            password: _password,
            duration: _duration,
            entryFee: _entryFee,
            creator: msg.sender,
            prizePool: 0,
            startTime: block.timestamp,
            active: true
        });

        emit ChallengeCreated(
            challengeCount,
            _name,
            msg.sender
        );
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

    // REPORT FAIL (I slipped today)
    function reportFail(uint challengeId) public {

        require(
            joined[challengeId][msg.sender],
            "Not participant"
        );

        isFailed[challengeId][msg.sender] = true;
    }

    // CLAIM PRIZE
    function claimPrize(uint challengeId) public {

        Challenge storage c = challenges[challengeId];

        require(c.active, "Already finished");

        require(
            block.timestamp >= c.startTime + (c.duration * 1 days),
            "Challenge still active"
        );

        require(
            joined[challengeId][msg.sender],
            "Not participant"
        );

        require(
            !isFailed[challengeId][msg.sender],
            "Failed participant"
        );

        uint winners = 0;

        for (uint i = 0; i < participants[challengeId].length; i++) {
            address user = participants[challengeId][i];

            if (!isFailed[challengeId][user]) {
                winners++;
            }
        }

        require(winners > 0, "No winners");

        uint reward = c.prizePool / winners;

        // Prvo ažuriramo stanje ugovora (deaktiviramo izazov)
        c.active = false;
        c.prizePool -= reward;

        // Slanje ethera preko .call metode
        (bool success, ) = payable(msg.sender).call{value: reward}("");
        require(success, "Transfer failed");
    }

    // GET CHALLENGE
    function getChallenge(uint id)
        public
        view
        returns (
            uint,
            string memory,
            string memory,
            uint,
            uint,
            address,
            uint,
            uint,
            bool
        )
    {
        Challenge memory c = challenges[id];

        return (
            c.id,
            c.name,
            c.password,
            c.duration,
            c.entryFee,
            c.creator,
            c.prizePool,
            c.startTime,
            c.active
        );
    }

    // GET PARTICIPANTS
    function getParticipants(uint id)
        public
        view
        returns (address[] memory)
    {
        return participants[id];
    }
}