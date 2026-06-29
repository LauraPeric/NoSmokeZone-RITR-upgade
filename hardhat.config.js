require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/4tehJENn8X3HsriOwwUxC",
      accounts: ["aac0f397141486fd3afc5115a483c40e337c329e7ab974e7dfce251da1b88932"] 
    }
  }
};