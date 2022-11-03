const {
  frontEndContractsFile,
  frontEndAbiLocation,
} = require("../helper-hardhat-config");
require("dotenv").config();
const fs = require("fs");
const { network } = require("hardhat");

module.exports = async () => {
  if (process.env.UPDATE_FRONT_END) {
    console.log("Writing to front end...");
    await updateContractAddresses();
    await updateAbi();
    console.log("Front end written!");
  }
};

async function updateAbi() {
  const swap = await ethers.getContract("Swap");
  fs.writeFileSync(
    `${frontEndAbiLocation}Swap.json`,
    swap.interface.format(ethers.utils.FormatTypes.json)
  );

  const arkToken = await ethers.getContract("ArkToken");
  fs.writeFileSync(
    `${frontEndAbiLocation}ArkToken.json`,
    arkToken.interface.format(ethers.utils.FormatTypes.json)
  );
}

async function updateContractAddresses() {
  const chainId = network.config.chainId.toString();
  const swap = await ethers.getContract("Swap");
  var contractAddresses = JSON.parse(
    fs.readFileSync(frontEndContractsFile, "utf8")
  );
  if (chainId in contractAddresses) {
    if (!contractAddresses[chainId]["Swap"].includes(swap.address)) {
      contractAddresses[chainId]["Swap"].push(swap.address);
    }
  } else {
    contractAddresses[chainId] = { Swap: [swap.address] };
  }
  fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses));

  const ark = await ethers.getContract("ArkToken");
  contractAddresses = JSON.parse(
    fs.readFileSync(frontEndContractsFile, "utf8")
  );
  if (chainId in contractAddresses) {
    if (!contractAddresses[chainId]["ArkToken"].includes(ark.address)) {
      contractAddresses[chainId]["ArkToken"].push(ark.address);
    }
  } else {
    contractAddresses[chainId] = { ArkToken: [ark.address] };
  }
  fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses));

  const kar = await ethers.getContract("KarToken");
  contractAddresses = JSON.parse(
    fs.readFileSync(frontEndContractsFile, "utf8")
  );
  if (chainId in contractAddresses) {
    if (!contractAddresses[chainId]["KarToken"].includes(kar.address)) {
      contractAddresses[chainId]["KarToken"].push(kar.address);
    }
  } else {
    contractAddresses[chainId] = { KarToken: [kar.address] };
  }
  fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses));

  const rak = await ethers.getContract("RakToken");
  contractAddresses = JSON.parse(
    fs.readFileSync(frontEndContractsFile, "utf8")
  );
  if (chainId in contractAddresses) {
    if (!contractAddresses[chainId]["RakToken"].includes(rak.address)) {
      contractAddresses[chainId]["RakToken"].push(rak.address);
    }
  } else {
    contractAddresses[chainId] = { RakToken: [rak.address] };
  }
  fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses));
}
module.exports.tags = ["all", "frontend"];
