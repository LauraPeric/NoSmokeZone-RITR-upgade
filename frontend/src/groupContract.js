export const GROUP_CONTRACT_ADDRESS = "0xd72E5A6F92cb892BD0eAE24681d35349564508b6";

export const GROUP_CONTRACT_ABI = [
  "function createChallenge(string,uint,uint)",
  "function joinChallenge(uint) payable",
  "function getChallenge(uint) view returns (uint,string,uint,uint,address,uint,bool)",
  "function getParticipants(uint) view returns (address[])"
];