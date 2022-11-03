const { assert, expect } = require("chai");
const { getNamedAccounts, deployments, ethers } = require("hardhat");

describe("Swap Unit Test", function () {
  let arkToken, karToken, rakToken, deployer, user1, user2;
  beforeEach(async function () {
    const accounts = await getNamedAccounts();
    deployer = accounts.deployer;
    user1 = accounts.user1;
    user2 = accounts.user2;

    await deployments.fixture("all");
    exchange = await ethers.getContract("Swap", deployer);
    arkToken = await ethers.getContract("ArkToken", deployer);
    karToken = await ethers.getContract("KarToken", deployer);
    rakToken = await ethers.getContract("RakToken", deployer);
    const token1Tx = await exchange.addToken("ARK", arkToken.address);
    await token1Tx.wait(1);
    const token2Tx = await exchange.addToken("KAR", rakToken.address);
    await token2Tx.wait(1);
    const token3Tx = await exchange.addToken("RAK", karToken.address);
    await token3Tx.wait(1);
  });
  it("was deployed", async () => {
    assert(arkToken.address);
    assert(karToken.address);
    assert(rakToken.address);
    assert(exchange.address);
  });
  describe("initial", () => {
    it("Should have added 3 tokens", async () => {
      assert(exchange.hasToken("ARK"));
      assert(exchange.hasToken("KAR"));
      assert(exchange.hasToken("RAK"));
    });
  });
});
