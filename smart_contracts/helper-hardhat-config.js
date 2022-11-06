const networkConfig = {
<<<<<<< Updated upstream
  31337: {
=======
  1337: {
>>>>>>> Stashed changes
    name: "localhost",
  },
  // Price Feed Address, values can be obtained at https://docs.chain.link/docs/reference-contracts
  // Default one is ETH/USD contract on Kovan
  5: {
    name: "goerli",
    ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
  },
};
const INITIAL_SUPPLY = "1000000000000000000000000";

const developmentChains = ["hardhat", "localhost"];
const frontEndContractsFile = "../frontend/constants/networkMapping.json";
const frontEndAbiLocation = "../frontend/constants/";

module.exports = {
  networkConfig,
  developmentChains,
  INITIAL_SUPPLY,
  frontEndContractsFile,
  frontEndAbiLocation,
};
