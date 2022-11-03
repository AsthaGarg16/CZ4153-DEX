const { network, ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  // Tokens deployed
  const arkToken = await ethers.getContract("ArkToken", deployer);
  const rakToken = await ethers.getContract("RakToken", deployer);
  const karToken = await ethers.getContract("KarToken", deployer);

  const swap = await ethers.getContract("Swap", deployer);

  console.log(`${arkToken.address}`);

  const addARKTx = await swap.addToken("ARK", arkToken.address);
  await addARKTx.wait(1);
  console.log(`ARK token added to contract ${await swap.hasToken("ARK")}`);

  const addKARTx = await swap.addToken("KAR", karToken.address);
  await addKARTx.wait(1);
  console.log(`KAR token added to contract ${await swap.hasToken("KAR")}`);

  const addRAKTx = await swap.addToken("RAK", rakToken.address);
  await addRAKTx.wait(1);
  console.log(`RAK token added to contract ${await swap.hasToken("RAK")}`);

  //   console.log(`Basic NFT index 0 tokenURI: ${await basicNft.tokenURI(0)}`);
};
module.exports.tags = ["all", "addTokens"];
