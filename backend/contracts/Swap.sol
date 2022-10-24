// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

contract Swap is Ownable {
    struct Token {
        address contractAddress;
        string symbolName;
    }

    struct Order {
        uint256 quantity;
        uint256 price;
        uint256 timestamp;
        address user;
        bytes2 status;
    }

    //depending on the implementation will have to update the structure
    struct OrderBook {
        uint256 orderIndex;
        mapping(uint256 => Order) orders;
        uint256 ordersCount;
        uint256[] ordersQueue;
    }

    struct Market {
        OrderBook buyOrderBook;
        OrderBook sellOrderBook;
    }

    mapping(uint8 => Token) tokenInfo;
    mapping(uint8 => IERC20) tokens;
    mapping(address => mapping(uint8 => uint256)) tokenBalanceForAddress;
    mapping(uint8 => mapping(uint8 => Market)) ExchangeMarket;
    uint8 tokenIndex;

    constructor() {
        tokenIndex = 1;
    }

    /* EVENTS */

    event LogDepositToken(
        string symbolName,
        address accountAddress,
        uint256 amount,
        uint256 timestamp
    );

    event LogWithdrawToken(
        string symbolName,
        address accountAddress,
        uint256 amount,
        uint256 timestamp
    );

    event LogAddToken(
        uint256 tokenIndex,
        string symbolName,
        address EC20TokenAddress,
        uint256 timestamp
    );

    event LogBuyToken(
        string symbolName1,
        string symbolName2,
        uint256 price,
        uint256 amount,
        address buyer,
        uint256 timestamp
    );

    event LogSellToken(
        string symbolName1,
        string symbolName2,
        uint256 price,
        uint256 amount,
        address buyer,
        uint256 timestamp
    );

    event LogCreateBuyOrder(
        string symbolName1,
        string symbolName2,
        uint256 price,
        uint256 amount,
        address buyer,
        uint256 timestamp
    );

    event LogCreateSellOrder(
        string symbolName1,
        string symbolName2,
        uint256 price,
        uint256 amount,
        address seller,
        uint256 timestamp
    );

    event LogFulfilBuyOrder(
        string symbolName1,
        string symbolName2,
        uint256 price,
        uint256 orderIndex,
        uint256 amount,
        uint256 timestamp
    );

    event LogFulfilSellOrder(
        string symbolName1,
        string symbolName2,
        uint256 price,
        uint256 orderIndex,
        uint256 amount,
        uint256 timestamp
    );

    event LogCancelBuyOrder(
        string symbolName1,
        string symbolName2,
        uint256 orderIndex,
        address buyer,
        uint256 timestamp
    );
    event LogCancelSellOrder(
        string symbolName1,
        string symbolName2,
        uint256 orderIndex,
        address seller,
        uint256 timestamp
    );

    // Owner's AddToken ability
    function addToken(string memory symbolName, address EC20TokenAddress) public onlyOwner {
        require(!hasToken(symbolName));
        require(tokenIndex + 1 >= tokenIndex);

        tokenIndex++;
        tokenInfo[tokenIndex].symbolName = symbolName;
        tokenInfo[tokenIndex].contractAddress = EC20TokenAddress;
        tokens[tokenIndex] = IERC20(tokenInfo[tokenIndex].contractAddress);

        emit LogAddToken(tokenIndex, symbolName, EC20TokenAddress, block.timestamp);
    }

    // Address's Tokens account management

    function depositToken(string memory symbolName, uint256 amount)
        public
        returns (uint256 tokenBalance)
    {
        require(hasToken(symbolName));
        require(getBalanceForToken(symbolName) + amount >= getBalanceForToken(symbolName));

        uint8 _tokenIndex = getTokenIndex(symbolName);

        IERC20 token = IERC20(tokenInfo[_tokenIndex].contractAddress);
        require(token.transferFrom(msg.sender, address(this), amount) == true);

        tokenBalanceForAddress[msg.sender][_tokenIndex] += amount;

        emit LogDepositToken(symbolName, msg.sender, amount, block.timestamp);

        return getBalanceForToken(symbolName);
    }

    function withdrawToken(string memory symbolName, uint256 amount)
        public
        returns (uint256 tokenBalance)
    {
        require(hasToken(symbolName));
        require(amount <= getBalanceForToken(symbolName));

        uint8 _tokenIndex = getTokenIndex(symbolName);

        IERC20 token = IERC20(tokenInfo[_tokenIndex].contractAddress);

        tokenBalanceForAddress[msg.sender][_tokenIndex] -= amount;

        require(token.transfer(msg.sender, amount) == true);

        emit LogWithdrawToken(symbolName, msg.sender, amount, block.timestamp);

        return getBalanceForToken(symbolName);
    }

    //Helper functions
    function hasToken(string memory symbolName) public view returns (bool) {
        for (uint8 i = 1; i <= tokenIndex; i++) {
            if (
                keccak256(abi.encodePacked(symbolName)) ==
                keccak256(abi.encodePacked(tokenInfo[i].symbolName))
            ) {
                return true;
            }
        }
        return false;
    }

    function getBalanceForToken(string memory symbolName) public view returns (uint256) {
        return tokenBalanceForAddress[msg.sender][getTokenIndex(symbolName)];
    }

    function getTokenAddress(string memory symbolName) public view returns (address) {
        require(hasToken(symbolName));

        uint8 _tokenIndex = getTokenIndex(symbolName);

        return tokenInfo[_tokenIndex].contractAddress;
    }

    function getTokenIndex(string memory symbolName) public view returns (uint8) {
        for (uint8 i = 1; i <= tokenIndex; i++) {
            if (keccak256(bytes(symbolName)) == keccak256(bytes(tokenInfo[i].symbolName))) {
                return i;
            }
        }
        return 0;
    }
}
