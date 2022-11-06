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
  ```
  To compile the contracts
  ```shell
  yarn hardhat compile
  ```
  To run the test cases
  ```shell
  yarn hardhat test
  ```
  To deploy the contracts to the local hardhat chain. The deployment is done as described in the smart_contracts/deploy scripts. First all three custom tokens are deployed, followed by the Swap.sol contract. Next for testing purposes, the three tokens are added to the contract and dummy users 'user1' and 'user2' as defined by hardhat local chain are transferred 50 of each type of tokens. A local chain is also started.
   ```shell
  yarn hardhat node
  ```
  To run the frontend 
    ```shell
  cd frontend
  yarn dev
  ```
  Then you can go to <http://localhost:3000/>
  
* For testnet deployment
  ```shell
  cd smart_contracts
  ```
  To compile the contracts
  ```shell
  yarn hardhat compile
  ```
  To run the test cases
  ```shell
  yarn hardhat test
  ```
  The deployment is done as described in the smart_contracts/deploy scripts. The tags in the script differentiate which scripts should be run.
   ```shell
  yarn hardhat deploy --network goerli --tags testnet
  ```
* To add custom ERC20 tokens to your metamask wallet
  Reference: [Adding custom tokens to Metamask](https://metamask.zendesk.com/hc/en-us/articles/360015489031-How-to-View-See-Your-Tokens-in-Metamask)
      
  Contract Address                        | Symbol Name | Decimals |
  ----------------------------------------|-------------|----------|
  (address of ArkToken contract deployed) | ARK         | 18       |
  (address of KarToken contract deployed) | KAR         | 18       |
  (address of RakToken contract deployed) | RAK         | 18       |
  
You can now use the application to trade assets.
  
  
