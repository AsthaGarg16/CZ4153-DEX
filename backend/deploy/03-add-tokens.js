const { network, ethers } = require("hardhat")

module.exports = async ({ getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // Custom Tokens
    const arkToken = await ethers.getContract("ArkToken", deployer)
    const karToken = await ethers.getContract("KarToken", deployer)
    const rakToken = await ethers.getContract("RakToken", deployer)
    console.log(`Getting tokens`)

    //swap
    const exchange = await ethers.getContract("Swap", deployer)
    console.log(`Getting swap`)
    const token1Tx = await exchange.addToken("ARK", arkToken.address)
    await token1Tx.wait(1)
    console.log(`ArkToken added`)
    const token2Tx = await exchange.addToken("KAR", karToken.address)
    await token2Tx.wait(1)
    console.log(`KarToken added`)
    const token3Tx = await exchange.addToken("RAK", rakToken.address)
    await token3Tx.wait(1)
    console.log(`RakToken added`)
}
module.exports.tags = ["all", "initialize"]
