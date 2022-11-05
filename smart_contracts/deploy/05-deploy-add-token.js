const { network, ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deployer, user1 } = await getNamedAccounts();
  const chainId = network.config.chainId;

  // Tokens deployed
  const arkToken = await ethers.getContract("ArkToken", deployer);
  const rakToken = await ethers.getContract("RakToken", deployer);
  const karToken = await ethers.getContract("KarToken", deployer);

  const swap = await ethers.getContract("Swap", deployer);

  const addARKTx = await swap.addToken("ARK", arkToken.address);
  await addARKTx.wait(1);
  console.log(`ARK token added to contract ${await swap.hasToken("ARK")}`);

  const addKARTx = await swap.addToken("KAR", karToken.address);
  await addKARTx.wait(1);
  console.log(`KAR token added to contract ${await swap.hasToken("KAR")}`);

  const addRAKTx = await swap.addToken("RAK", rakToken.address);
  await addRAKTx.wait(1);
  console.log(`RAK token added to contract ${await swap.hasToken("RAK")}`);

  // // const marketTx = await swap.getAllMarkets();
  // // // await marketTx.wait(1);
  //console.log(`${await swap.getAllMarkets()}`);

  console.log(`${await arkToken.balanceOf(deployer)}`);

  const transferTx = await arkToken.transfer(user1, 50000000000000000000n);

  await transferTx.wait(1);
  console.log(`ARK token was transferred ${await arkToken.balanceOf(user1)}`);

  const transfer2Tx = await karToken.transfer(user1, 50000000000000000000n);

  await transfer2Tx.wait(1);
  console.log(`KAR token was transferred ${await karToken.balanceOf(user1)}`);

  const transfer3Tx = await rakToken.transfer(user1, 50000000000000000000n);

  await transfer3Tx.wait(1);
  console.log(`RAK token was transferred ${await rakToken.balanceOf(user1)}`);

  // const transfer4Tx = await swap.depositToken("ARK", 30000000000000000000n);
  // await transfer4Tx.wait(1);
  // console.log(
  //   `ARK token was deposited  ${await swap.getTokenBalanceForUser("ARK")}`
  // );

  // const transfer5Tx = await swap.depositToken("KAR", 30000000000000000000n);
  // await transfer5Tx.wait(1);
  // console.log(
  //   `ARK token was deposited  ${await swap.getTokenBalanceForUser("KAR")}`
  // );

  // const transfer6Tx = await swap.depositToken("RAK", 30000000000000000000n);
  // await transfer6Tx.wait(1);
  // console.log(
  //   `ARK token was deposited  ${await swap.getTokenBalanceForUser("RAK")}`
  // );

  //   console.log(`Basic NFT index 0 tokenURI: ${await basicNft.tokenURI(0)}`);
};
module.exports.tags = ["all", "addTokens"];
