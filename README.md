# CZ4153-DEX
## BlockByBlock DEX

BlockByBlock DEX is a dApp with an intuitive front-end website made using Next.js,
which supports listing of available asset tokens on the marketplace, submission of trading order, matching and execution
of orders (i.e., swapping/exchanging/trading assets), and most importantly, in our DEX, users have the ultimate control
of his/her own digital assets. The smart contracts are written in solidity with hardhat for deployment.

The requirements for the project are -
* npm (v8.5.1)
* Node (v16.14.0)
* Yarn (v1.22.19)
* Metamask extension (or other wallets)
* Alchemy account set up with API key (for connecting to Goerli testnet)

To install this code, follow the steps below after cloning the repository-
```shell
cd frontend
yarn install
cd ..
cd smart_contracts
yarn install
```
### Usage

* Add .env file
  Refer to smart_contracts/.env.example to create a .env file.
  Add API keys for the testnet RPC URL, and etherscan for testnet deployment. These keys are not necessary for local deployment.
  
* For local deployment
  ```shell
  cd smart_contracts
  yarn hardhat compile
  yarn hardhat test
  yarn hardhat node
  ```
  
