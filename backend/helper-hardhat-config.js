const networkConfig = {
    // default: {
    //     name: "hardhat",
    // },
    1337: {
        name: "localhost",
    },
    5: {
        name: "goerli",
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
    },
    // 1: {
    //     name: "mainnet",
    // },
}

const developmentChains = ["hardhat", "localhost"]
const VERIFICATION_BLOCK_CONFIRMATIONS = 6
// const frontEndContractsFile = "../frontend/constants/"
// const frontEndAbiLocation = "../frontend/constants/"
const INITIAL_SUPPLY = "1000000000000000000000000"

// const DECIMALS = "18"

module.exports = {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
    // frontEndContractsFile,
    // frontEndAbiLocation,
    INITIAL_SUPPLY,
}
