export const CONTRACT_ADDRESS = "0x11d92FfE96b320212D98C6D40427034FeEa0259b";

export const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "markSmokeFree",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
 {
  "inputs": [],
  "name": "getStreak",
  "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
  "stateMutability": "view",
  "type": "function"
},
{
  "inputs": [],
  "name": "resetStreak",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
},
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getUserData",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getUserTokens",
    "outputs": [
      { "internalType": "uint256[]", "name": "", "type": "uint256[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "getMilestone",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];