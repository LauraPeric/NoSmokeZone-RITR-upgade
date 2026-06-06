export const GROUP_CONTRACT_ADDRESS = "0xd47B07e037BE6Bf1b018aA1489B3D3Ea78D5478E";

export const GROUP_CONTRACT_ABI = [
  // Dodan drugi string parametar za password (ukupno 4 parametra)
  "function createChallenge(string _name, string _password, uint _duration, uint _entryFee)",
  
  "function joinChallenge(uint challengeId) payable",
  
  // Vraća 9 vrijednosti (id, name, password, duration, entryFee, creator, prizePool, startTime, active)
  "function getChallenge(uint id) view returns (uint, string, string, uint, uint, address, uint, uint, bool)",
  
  "function getParticipants(uint id) view returns (address[])"
];