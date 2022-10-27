// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

contract Swap is Ownable {
    //for ETH-address=0, symbol="ETH"
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
    mapping(uint8 => mapping(string => string)) buyToSell;
    mapping(uint8 => Market) ExchangeMarket;
    uint8 tokenIndex;

    constructor() {
        tokenIndex = 0;
        Token ethToken = Token({contractAddress: "0x0", symbolName: "ETH"});
        tokenInfo.push(0, ethToken);
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
        tokenBalanceForAddress[msg.sender][_tokenIndex] += amount;
        require(tokens[_tokenIndex].transferFrom(msg.sender, address(this), amount) == true);
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
        tokenBalanceForAddress[msg.sender][_tokenIndex] -= amount;
        require(tokens[_tokenIndex].transfer(msg.sender, amount) == true);

        emit LogWithdrawToken(symbolName, msg.sender, amount, block.timestamp);
        return getBalanceForToken(symbolName);
    }

    //doing beyond this

    function createBuyOrder(
        string memory symbolName,
        uint256 priceInWei,
        uint256 amount,
        address buyer
    ) private {
        require(hasToken(symbolName));

        uint8 _tokenIndex = getTokenIndex(symbolName);

        uint256 _buy_amount_balance = amount;
        // fulfil buyOrder by checking against which sell orders can be fulfil
        if (ExchangeMarket[_tokenIndex].sellOrderBook.ordersCount > 0) {
            _buy_amount_balance = fulfilBuyOrder(symbolName, _buy_amount_balance, priceInWei);
        }
        // check if buyOrder is fully fulfiled
        if (_buy_amount_balance > 0) {
            // update buyOrderBook - ordersQueue
            (
                uint256[] memory indexes,
                uint256[] memory prices,
                uint256[] memory amounts
            ) = getBuyOrderBook(symbolName);
            uint256 _newOrderIndex = ++tokens[_tokenIndex].buyOrderBook.orderIndex;
            uint256[] memory _newOrdersQueue = new uint256[](_newOrderIndex);

            bool _isOrderAdded = false;
            if (tokens[_tokenIndex].buyOrderBook.ordersCount == 0) {
                _newOrdersQueue[0] = _newOrderIndex;
                _isOrderAdded = true;
            } else {
                uint256 _newOrdersQueueIndex = 0;
                for (
                    uint256 _counter = 0;
                    _counter < tokens[_tokenIndex].buyOrderBook.ordersCount;
                    _counter++
                ) {
                    if (!_isOrderAdded && priceInWei > prices[_counter]) {
                        _newOrdersQueue[_newOrdersQueueIndex++] = _newOrderIndex;
                        _isOrderAdded = true;
                    }
                    _newOrdersQueue[_newOrdersQueueIndex++] = tokens[_tokenIndex]
                        .buyOrderBook
                        .ordersQueue[_counter];
                }
                // for the case of the price being lower than the lowest price of the orderbook
                if (!_isOrderAdded) {
                    _newOrdersQueue[_newOrdersQueueIndex] = _newOrderIndex;
                }
            }

            // replace existing orders queue is it's not empty
            tokens[_tokenIndex].buyOrderBook.ordersQueue = _newOrdersQueue;

            // Add new order to OrderBook
            tokens[_tokenIndex].buyOrderBook.ordersCount++;
            tokens[_tokenIndex].buyOrderBook.orders[_newOrderIndex] = Order({
                price: priceInWei,
                amount: _buy_amount_balance,
                who: msg.sender
            });

            // fire event
            emit LogCreateBuyOrder(
                symbolName,
                priceInWei,
                _buy_amount_balance,
                buyer,
                block.timestamp
            );
        }
    }

    function fulfilBuyOrder(
        string memory symbolName,
        uint256 _buy_amount_balance,
        uint256 priceInWei
    ) private returns (uint256) {
        uint8 _tokenIndex = getTokenIndex(symbolName);
        uint256 _currSellOrdersCount = tokens[_tokenIndex].sellOrderBook.ordersCount;

        uint256 _countSellOrderFulfiled = 0;

        // update sellOrderBook - orders
        for (uint256 i = 0; i < _currSellOrdersCount; i++) {
            if (_buy_amount_balance == 0) break;

            uint256 _orderIndex = tokens[_tokenIndex].sellOrderBook.ordersQueue[i];
            uint256 _orderPrice = tokens[_tokenIndex].sellOrderBook.orders[_orderIndex].price;
            uint256 _orderAmount = tokens[_tokenIndex].sellOrderBook.orders[_orderIndex].amount;
            address _orderOwner = tokens[_tokenIndex].sellOrderBook.orders[_orderIndex].who;

            if (priceInWei < _orderPrice) break;

            if (_buy_amount_balance >= _orderAmount) {
                _buy_amount_balance -= _orderAmount;

                tokens[_tokenIndex].sellOrderBook.orders[_orderIndex].amount = 0;
                _countSellOrderFulfiled++;
                emit LogFulfilSellOrder(
                    symbolName,
                    _orderIndex,
                    priceInWei,
                    _orderAmount,
                    block.timestamp
                );

                etherBalanceForAddress[_orderOwner] += priceInWei * _orderAmount;
                tokenBalanceForAddress[msg.sender][_tokenIndex] += _orderAmount;
            } else {
                tokens[_tokenIndex].sellOrderBook.orders[_orderIndex].amount -= _buy_amount_balance;
                emit LogFulfilSellOrder(
                    symbolName,
                    _orderIndex,
                    priceInWei,
                    _buy_amount_balance,
                    block.timestamp
                );

                etherBalanceForAddress[_orderOwner] += priceInWei * _buy_amount_balance;
                tokenBalanceForAddress[msg.sender][_tokenIndex] += _buy_amount_balance;

                _buy_amount_balance = 0;
            }
        }

        // update sellOrderBook - ordersBook and ordersCount
        uint256 _newSellOrdersCount = _currSellOrdersCount - _countSellOrderFulfiled;

        uint256[] memory _newSellOrdersQueue = new uint256[](_newSellOrdersCount);
        for (uint256 i = 0; i < _newSellOrdersCount; i++) {
            _newSellOrdersQueue[i] = tokens[_tokenIndex].sellOrderBook.ordersQueue[
                i + _countSellOrderFulfiled
            ];
        }

        tokens[_tokenIndex].sellOrderBook.ordersCount = _newSellOrdersCount;
        tokens[_tokenIndex].sellOrderBook.ordersQueue = _newSellOrdersQueue;

        return _buy_amount_balance;
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
