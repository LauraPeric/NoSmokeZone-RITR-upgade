export const GROUP_CONTRACT_ADDRESS = "0x99547cFd09a5Af31ED8b92A1a9B8c4B0d249023f";

export const GROUP_CONTRACT_ABI = [
  "function createChallenge(string _name, string _password, uint _duration, uint _entryFee)",
  "function joinChallenge(uint challengeId) payable",
  "function getChallenge(uint id) view returns (uint, string, string, uint, uint, address, uint, uint, bool)",
  "function getParticipants(uint id) view returns (address[])",
  "function challengeCount() view returns (uint256)",
  "function mintGroupNFT(uint challengeId)",
  "function distributeRewards(uint challengeId)",
  "function setBadgeContract(address _addr)"
];