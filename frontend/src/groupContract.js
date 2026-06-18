export const GROUP_CONTRACT_ADDRESS = "0x3d508fD99218ad460DB58dC280feD8009A8b0190";

export const GROUP_CONTRACT_ABI = [
  "function createChallenge(string _name, string _password, uint _duration, uint _entryFee)",
  "function joinChallenge(uint challengeId) payable",
  "function getChallenge(uint id) view returns (uint, string, string, uint, uint, address, uint, uint, bool)",
  "function getParticipants(uint id) view returns (address[])",
  "function challengeCount() view returns (uint256)"
];