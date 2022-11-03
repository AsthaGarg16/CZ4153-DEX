// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ArkToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("ArkToken", "ARK") {
        _mint(msg.sender, initialSupply);
    }
}
