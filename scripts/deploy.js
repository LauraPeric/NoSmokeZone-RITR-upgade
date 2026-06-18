const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {

  // =========================
  // 1. DEPLOY SmokeFreeBadges
  // =========================
  const Badge = await hre.ethers.getContractFactory("SmokeFreeBadges");
  const badge = await Badge.deploy();
  await badge.waitForDeployment();

  console.log("SmokeFreeBadges:", badge.target);

  // =========================
  // 2. DEPLOY NoSmokeNFT
  // =========================
  const NoSmoke = await hre.ethers.getContractFactory("NoSmokeNFT");
  const noSmoke = await NoSmoke.deploy(badge.target);
  await noSmoke.waitForDeployment();

  console.log("NoSmokeNFT:", noSmoke.target);

  // =========================
  // 3. DEPLOY GroupChallenge
  // =========================
  const Group = await hre.ethers.getContractFactory("GroupChallenge");
  const group = await Group.deploy();
  await group.waitForDeployment();

  console.log("GroupChallenge:", group.target);

  // =========================
  // 4. CONNECT CONTRACTS
  // =========================

  // Group → Badge (za group NFT mint)
  const tx1 = await group.setBadgeContract(badge.target);
  await tx1.wait();

  console.log("Group → Badge connected");

  // Badge → NoSmoke (solo badge mint system)
  const tx2 = await badge.setNoSmokeContract(noSmoke.target);
  await tx2.wait();

  console.log("Badge → NoSmoke connected");

  console.log("Contracts connected successfully");

  // =========================
  // 5. UPDATE FRONTEND AUTO
  // =========================

  const contractJsPath = path.join(__dirname, "../frontend/src/contract.js");
  const groupJsPath = path.join(__dirname, "../frontend/src/groupContract.js");

  // update NoSmokeNFT address
  let contractJs = fs.readFileSync(contractJsPath, "utf8");
  contractJs = contractJs.replace(
    /export const CONTRACT_ADDRESS = ".*?"/,
    `export const CONTRACT_ADDRESS = "${noSmoke.target}"`
  );
  fs.writeFileSync(contractJsPath, contractJs);

  // update GroupChallenge address
  let groupJs = fs.readFileSync(groupJsPath, "utf8");
  groupJs = groupJs.replace(
    /export const GROUP_CONTRACT_ADDRESS = ".*?"/,
    `export const GROUP_CONTRACT_ADDRESS = "${group.target}"`
  );
  fs.writeFileSync(groupJsPath, groupJs);

  console.log("\n=== FRONTEND UPDATED ===");
  console.log("NoSmokeNFT → contract.js updated");
  console.log("GroupChallenge → groupContract.js updated");

  console.log("\n=== DEPLOY DONE SUCCESSFULLY ===");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});