// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

contract Swap is Ownable {
    //custom data structures for implementing features

    //To store token details
    struct Token {
        address contractAddress;
        string symbolName;
    }

    //to store individual order details
    struct Order {
        uint256 quantity;
        uint256 price;
        uint256 timestamp;
        address user;
        bytes2 status;
    }

    //to store the whole list of specific types of orders for each market
    struct OrderBook {
        uint256 orderIndex;
        mapping(uint256 => Order) orders;
        uint256 ordersCount;
        uint256[] ordersQueue;
    }

    //Each market is made of corresponding buy orderbook and sell orderbook
    struct Market {
        OrderBook buyOrderBook;
        OrderBook sellOrderBook;
    }

    //Mapping for storage

    mapping(uint8 => Token) tokenInfo;
    mapping(uint8 => IERC20) tokens;
    mapping(address => mapping(uint8 => uint256)) tokenBalanceForAddress;
    mapping(uint8 => uint8[]) buyToSell; //mapping of market index to the corresponding buy and sell token for that market
    mapping(uint8 => Market) ExchangeMarket;
    uint8 tokenIndex; //total types of tokens available
    uint8 marketIndex; //total types of markets

    constructor() {
        tokenIndex = 0;
        marketIndex = 0;
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

    event LogAddMarket(uint256 marketIndex, string symbolName, uint256 timestamp);

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

    /* FUNCTIONS TO PROVIDE FEATURES */

    // Owner's AddToken ability
    function addToken(string memory symbolName, address EC20TokenAddress) public onlyOwner {
        require(!hasToken(symbolName), "Token already exists");
        require(tokenIndex + 1 >= tokenIndex, "Token Index overflow");

        tokenIndex++;
        tokenInfo[tokenIndex].symbolName = symbolName;
        tokenInfo[tokenIndex].contractAddress = EC20TokenAddress;
        tokens[tokenIndex] = IERC20(tokenInfo[tokenIndex].contractAddress);

        emit LogAddToken(tokenIndex, symbolName, EC20TokenAddress, block.timestamp);

        addMarket(symbolName, tokenIndex);
    }

    //A Market is added with combination with previous tokens so all exchanges are available
    function addMarket(string memory symbolName, uint8 _tokenIndex) public onlyOwner {
        require(marketIndex + 1 >= marketIndex);

        for (uint8 i = 1; i < tokenIndex; i++) {
            marketIndex++;
            uint8[] memory toAdd = new uint8[](2);
            toAdd[0] = _tokenIndex;
            toAdd[1] = i;
            buyToSell[marketIndex] = toAdd;
        }

        emit LogAddMarket(marketIndex, symbolName, block.timestamp);
    }

    // Address's Tokens account management - ability to deposit tokens
    function depositToken(string memory symbolName, uint256 amount)
        public
        returns (uint256 tokenBalance)
    {
        require(hasToken(symbolName));
        require(getTokenBalanceForUser(symbolName) + amount >= getTokenBalanceForUser(symbolName));
        uint8 _tokenIndex = getTokenIndex(symbolName);
        tokenBalanceForAddress[msg.sender][_tokenIndex] += amount;
        require(tokens[_tokenIndex].transferFrom(msg.sender, address(this), amount) == true);
        emit LogDepositToken(symbolName, msg.sender, amount, block.timestamp);
        return getTokenBalanceForUser(symbolName);
    }

    // Address's Tokens account management - ability to withdraw tokens
    function withdrawToken(string memory symbolName, uint256 amount)
        public
        returns (uint256 tokenBalance)
    {
        require(hasToken(symbolName));
        require(amount <= getTokenBalanceForUser(symbolName));

        uint8 _tokenIndex = getTokenIndex(symbolName);
        tokenBalanceForAddress[msg.sender][_tokenIndex] -= amount;
        require(tokens[_tokenIndex].transfer(msg.sender, amount) == true);

        emit LogWithdrawToken(symbolName, msg.sender, amount, block.timestamp);
        return getTokenBalanceForUser(symbolName);
    }

    //User submits market buy order
    function buyMarketOrder(
        string memory buyTokenSymbol,
        string memory sellTokenSymbol,
        uint256 quantity
    ) private {
        require(hasToken(buyTokenSymbol));
        require(hasToken(sellTokenSymbol));

        uint8 _sellTokenIndex = getTokenIndex(sellTokenSymbol);
        uint8 _buyTokenIndex = getTokenIndex(buyTokenSymbol);
        uint8 _marketIndex = getMarketIndex(buyTokenSymbol, sellTokenSymbol);
        require(ExchangeMarket[_marketIndex].sellOrderBook.ordersCount > 0, "Cannot place request");
        uint256 _buy_qty_balance = quantity;
        uint256 _currSellOrdersCount = ExchangeMarket[_marketIndex].sellOrderBook.ordersCount;

        uint256 _countSellOrderFulfiled = 0;
        for (uint256 i = 0; i < _currSellOrdersCount; i++) {
            if (_buy_qty_balance == 0) break;

            uint256 _orderIndex = ExchangeMarket[_marketIndex].sellOrderBook.ordersQueue[i];
            uint256 _orderPrice = ExchangeMarket[_marketIndex]
                .sellOrderBook
                .orders[_orderIndex]
                .price;
            uint256 _orderAmount = ExchangeMarket[_marketIndex]
                .sellOrderBook
                .orders[_orderIndex]
                .quantity;
            address _orderOwner = ExchangeMarket[_marketIndex]
                .sellOrderBook
                .orders[_orderIndex]
                .user;
            if (_buy_qty_balance >= _orderAmount) {
                _buy_qty_balance -= _orderAmount;

                ExchangeMarket[_marketIndex].sellOrderBook.orders[_orderIndex].quantity = 0;
                _countSellOrderFulfiled++;
                emit LogFulfilSellOrder(
                    sellTokenSymbol,
                    buyTokenSymbol,
                    _orderIndex,
                    _orderPrice,
                    _orderAmount,
                    block.timestamp
                );
                tokenBalanceForAddress[msg.sender][_sellTokenIndex] -= _orderPrice * _orderAmount;
                tokenBalanceForAddress[_orderOwner][_sellTokenIndex] += _orderPrice * _orderAmount;
                tokenBalanceForAddress[msg.sender][_buyTokenIndex] += _orderAmount;
            } else {
                ExchangeMarket[_marketIndex]
                    .sellOrderBook
                    .orders[_orderIndex]
                    .quantity -= _buy_qty_balance;
                emit LogFulfilSellOrder(
                    sellTokenSymbol,
                    buyTokenSymbol,
                    _orderIndex,
                    _orderPrice,
                    _orderAmount,
                    block.timestamp
                );

                tokenBalanceForAddress[msg.sender][_sellTokenIndex] -=
                    _orderPrice *
                    _buy_qty_balance;
                tokenBalanceForAddress[_orderOwner][_sellTokenIndex] +=
                    _orderPrice *
                    _buy_qty_balance;
                tokenBalanceForAddress[msg.sender][_buyTokenIndex] += _buy_qty_balance;

                _buy_qty_balance = 0;
            }
        }

        // update sellOrderBook - ordersBook and ordersCount
        uint256 _newSellOrdersCount = _currSellOrdersCount - _countSellOrderFulfiled;

        uint256[] memory _newSellOrdersQueue = new uint256[](_newSellOrdersCount);
        for (uint256 i = 0; i < _newSellOrdersCount; i++) {
            _newSellOrdersQueue[i] = ExchangeMarket[_marketIndex].sellOrderBook.ordersQueue[
                i + _countSellOrderFulfiled
            ];
        }

        ExchangeMarket[_marketIndex].sellOrderBook.ordersCount = _newSellOrdersCount;
        ExchangeMarket[_marketIndex].sellOrderBook.ordersQueue = _newSellOrdersQueue;
    }

    function sellMarketOrder(
        string memory buyTokenSymbol,
        string memory sellTokenSymbol,
        uint256 quantity
    ) private {
        require(hasToken(buyTokenSymbol));
        require(hasToken(sellTokenSymbol));

        uint8 _sellTokenIndex = getTokenIndex(sellTokenSymbol);
        uint8 _buyTokenIndex = getTokenIndex(buyTokenSymbol);
        uint8 _marketIndex = getMarketIndex(sellTokenSymbol, buyTokenSymbol);
        require(ExchangeMarket[_marketIndex].buyOrderBook.ordersCount > 0, "Cannot place request");
        uint256 _sell_qty_balance = quantity;
        uint256 _currBuyOrdersCount = ExchangeMarket[_marketIndex].buyOrderBook.ordersCount;

        uint256 _countBuyOrderFulfiled = 0;
        for (uint256 i = 0; i < _currBuyOrdersCount; i++) {
            if (_sell_qty_balance == 0) break;

            uint256 _orderIndex = ExchangeMarket[_marketIndex].buyOrderBook.ordersQueue[i];
            uint256 _orderPrice = ExchangeMarket[_marketIndex]
                .buyOrderBook
                .orders[_orderIndex]
                .price;
            uint256 _orderAmount = ExchangeMarket[_marketIndex]
                .buyOrderBook
                .orders[_orderIndex]
                .quantity;
            address _orderOwner = ExchangeMarket[_marketIndex]
                .buyOrderBook
                .orders[_orderIndex]
                .user;
            if (_sell_qty_balance >= _orderAmount) {
                _sell_qty_balance -= _orderAmount;

                ExchangeMarket[_marketIndex].buyOrderBook.orders[_orderIndex].quantity = 0;
                _countBuyOrderFulfiled++;
                emit LogFulfilBuyOrder(
                    sellTokenSymbol,
                    buyTokenSymbol,
                    _orderIndex,
                    _orderPrice,
                    _orderAmount,
                    block.timestamp
                );
                tokenBalanceForAddress[msg.sender][_sellTokenIndex] -= _orderPrice * _orderAmount;
                tokenBalanceForAddress[_orderOwner][_sellTokenIndex] += _orderPrice * _orderAmount;
                tokenBalanceForAddress[msg.sender][_buyTokenIndex] += _orderAmount;
            } else {
                ExchangeMarket[_marketIndex]
                    .buyOrderBook
                    .orders[_orderIndex]
                    .quantity -= _sell_qty_balance;
                emit LogFulfilBuyOrder(
                    sellTokenSymbol,
                    buyTokenSymbol,
                    _orderIndex,
                    _orderPrice,
                    _orderAmount,
                    block.timestamp
                );

                tokenBalanceForAddress[msg.sender][_sellTokenIndex] -=
                    _orderPrice *
                    _sell_qty_balance;
                tokenBalanceForAddress[_orderOwner][_sellTokenIndex] +=
                    _orderPrice *
                    _sell_qty_balance;
                tokenBalanceForAddress[msg.sender][_buyTokenIndex] += _sell_qty_balance;

                _sell_qty_balance = 0;
            }
        }

        // update sellOrderBook - ordersBook and ordersCount
        uint256 _newBuyOrdersCount = _currBuyOrdersCount - _countBuyOrderFulfiled;

        uint256[] memory _newBuyOrdersQueue = new uint256[](_newBuyOrdersCount);
        for (uint256 i = 0; i < _newBuyOrdersCount; i++) {
            _newBuyOrdersQueue[i] = ExchangeMarket[_marketIndex].buyOrderBook.ordersQueue[
                i + _countBuyOrderFulfiled
            ];
        }

        ExchangeMarket[_marketIndex].buyOrderBook.ordersCount = _newBuyOrdersCount;
        ExchangeMarket[_marketIndex].buyOrderBook.ordersQueue = _newBuyOrdersQueue;
    }

    //User submits limit buy order
    function createBuyOrder(
        string memory buySymbolName,
        string memory sellSymbolName,
        uint256 price,
        uint256 quantity,
        address buyer
    ) private {
        require(hasToken(buySymbolName));
        require(hasToken(sellSymbolName));
        uint8 _sellTokenIndex = getTokenIndex(sellSymbolName);
        require(tokenBalanceForAddress[msg.sender][_sellTokenIndex] >= price * quantity);

        uint8 _marketIndex = getMarketIndex(buySymbolName, sellSymbolName);
        uint256 _buy_qty_balance = quantity;

        // fulfil buyOrder by checking against which sell orders can be fulfil
        if (ExchangeMarket[_marketIndex].sellOrderBook.ordersCount > 0) {
            _buy_qty_balance = fulfilBuyOrder(
                buySymbolName,
                sellSymbolName,
                _buy_qty_balance,
                price
            );
        }
        if (_buy_qty_balance > 0) {
            (, uint256[] memory prices, ) = getBuyOrderBook(buySymbolName, sellSymbolName);

            uint256 _newOrderIndex = ++ExchangeMarket[_marketIndex].buyOrderBook.orderIndex;
            uint256[] memory _newOrdersQueue = new uint256[](_newOrderIndex);
            bool _isOrderAdded = false;

            if (ExchangeMarket[_marketIndex].buyOrderBook.ordersCount == 0) {
                _newOrdersQueue[0] = _newOrderIndex;
                _isOrderAdded = true;
            } else {
                uint256 _newOrdersQueueIndex = 0;
                for (
                    uint256 i = 0;
                    i < ExchangeMarket[_marketIndex].buyOrderBook.ordersCount;
                    i++
                ) {
                    if (!_isOrderAdded && price > prices[i]) {
                        _newOrdersQueue[_newOrdersQueueIndex++] = _newOrderIndex;
                        _isOrderAdded = true;
                    }
                    _newOrdersQueue[_newOrdersQueueIndex++] = ExchangeMarket[_marketIndex]
                        .buyOrderBook
                        .ordersQueue[i];
                }
                if (!_isOrderAdded) {
                    _newOrdersQueue[_newOrdersQueueIndex] = _newOrderIndex;
                }
            }
            ExchangeMarket[_marketIndex].buyOrderBook.ordersQueue = _newOrdersQueue;
            ExchangeMarket[_marketIndex].buyOrderBook.ordersCount++;
            ExchangeMarket[_marketIndex].buyOrderBook.orders[_newOrderIndex] = Order({
                quantity: _buy_qty_balance,
                price: price,
                user: msg.sender,
                timestamp: block.timestamp,
                status: "A"
            });
        }
        tokenBalanceForAddress[msg.sender][_sellTokenIndex] -= price * _buy_qty_balance;

        // fire event
        emit LogCreateBuyOrder(
            buySymbolName,
            sellSymbolName,
            price,
            _buy_qty_balance,
            buyer,
            block.timestamp
        );
    }

    //Try if buy order can be immediately fulfilled even if partially
    function fulfilBuyOrder(
        string memory buyTokenSymbol,
        string memory sellTokenSymbol,
        uint256 _buy_qty_balance,
        uint256 price
    ) private returns (uint256) {
        uint8 _buyTokenIndex = getTokenIndex(buyTokenSymbol);
        uint8 _sellTokenIndex = getTokenIndex(sellTokenSymbol);

        uint8 _marketIndex = getMarketIndex(buyTokenSymbol, sellTokenSymbol);
        uint256 _currSellOrdersCount = ExchangeMarket[_marketIndex].sellOrderBook.ordersCount;

        uint256 _countSellOrderFulfiled = 0;
        for (uint256 i = 0; i < _currSellOrdersCount; i++) {
            if (_buy_qty_balance == 0) break;

            uint256 _orderIndex = ExchangeMarket[_marketIndex].sellOrderBook.ordersQueue[i];
            uint256 _orderPrice = ExchangeMarket[_marketIndex]
                .sellOrderBook
                .orders[_orderIndex]
                .price;
            uint256 _orderAmount = ExchangeMarket[_marketIndex]
                .sellOrderBook
                .orders[_orderIndex]
                .quantity;
            address _orderOwner = ExchangeMarket[_marketIndex]
                .sellOrderBook
                .orders[_orderIndex]
                .user;

            if (price < _orderPrice) break;

            if (_buy_qty_balance >= _orderAmount) {
                _buy_qty_balance -= _orderAmount;

                ExchangeMarket[_marketIndex].sellOrderBook.orders[_orderIndex].quantity = 0;
                _countSellOrderFulfiled++;
                emit LogFulfilSellOrder(
                    sellTokenSymbol,
                    buyTokenSymbol,
                    _orderIndex,
                    price,
                    _orderAmount,
                    block.timestamp
                );

                tokenBalanceForAddress[_orderOwner][_sellTokenIndex] += price * _orderAmount;
                tokenBalanceForAddress[msg.sender][_buyTokenIndex] += _orderAmount;
            } else {
                ExchangeMarket[_marketIndex]
                    .sellOrderBook
                    .orders[_orderIndex]
                    .quantity -= _buy_qty_balance;
                emit LogFulfilSellOrder(
                    sellTokenSymbol,
                    buyTokenSymbol,
                    _orderIndex,
                    price,
                    _orderAmount,
                    block.timestamp
                );

                tokenBalanceForAddress[_orderOwner][_sellTokenIndex] += price * _buy_qty_balance;
                tokenBalanceForAddress[msg.sender][_buyTokenIndex] += _buy_qty_balance;

                _buy_qty_balance = 0;
            }
        }

        // update sellOrderBook - ordersBook and ordersCount
        uint256 _newSellOrdersCount = _currSellOrdersCount - _countSellOrderFulfiled;

        uint256[] memory _newSellOrdersQueue = new uint256[](_newSellOrdersCount);
        for (uint256 i = 0; i < _newSellOrdersCount; i++) {
            _newSellOrdersQueue[i] = ExchangeMarket[_marketIndex].sellOrderBook.ordersQueue[
                i + _countSellOrderFulfiled
            ];
        }

        ExchangeMarket[_marketIndex].sellOrderBook.ordersCount = _newSellOrdersCount;
        ExchangeMarket[_marketIndex].sellOrderBook.ordersQueue = _newSellOrdersQueue;

        return _buy_qty_balance;
    }

    function createSellOrder(
        string memory sellTokenSymbol,
        string memory buyTokenSymbol,
        uint256 price,
        uint256 quantity,
        address seller
    ) private {
        require(hasToken(sellTokenSymbol));
        require(hasToken(buyTokenSymbol));

        uint8 _sellTokenIndex = getTokenIndex(sellTokenSymbol);
        require(tokenBalanceForAddress[msg.sender][_sellTokenIndex] >= price * quantity);

        uint8 _marketIndex = getMarketIndex(buyTokenSymbol, sellTokenSymbol);
        uint256 _sell_qty_balance = quantity;

        // fulfil sellOrder by checking against which buy orders can be fulfil
        if (ExchangeMarket[_marketIndex].buyOrderBook.ordersCount > 0) {
            _sell_qty_balance = fulfilSellOrder(
                sellTokenSymbol,
                buyTokenSymbol,
                _sell_qty_balance,
                price
            );
        }

        // check if buyOrder is fully fulfiled
        if (_sell_qty_balance > 0) {
            // Update ordersQueue of OrderBook
            (, uint256[] memory prices, ) = getSellOrderBook(sellTokenSymbol, buyTokenSymbol);
            uint256 _newOrderIndex = ++ExchangeMarket[_marketIndex].sellOrderBook.orderIndex;
            uint256[] memory _newOrdersQueue = new uint256[](_newOrderIndex);

            bool _isOrderAdded = false;
            if (ExchangeMarket[_marketIndex].sellOrderBook.ordersCount == 0) {
                _newOrdersQueue[0] = _newOrderIndex;
                _isOrderAdded = true;
            } else {
                uint256 _newOrdersQueueIndex = 0;
                for (
                    uint256 _counter = 0;
                    _counter < ExchangeMarket[_marketIndex].sellOrderBook.ordersCount;
                    _counter++
                ) {
                    if (!_isOrderAdded && price < prices[_counter]) {
                        _newOrdersQueue[_newOrdersQueueIndex++] = _newOrderIndex;
                        _isOrderAdded = true;
                    }
                    _newOrdersQueue[_newOrdersQueueIndex++] = ExchangeMarket[_marketIndex]
                        .sellOrderBook
                        .ordersQueue[_counter];
                }
                // for the case of the price being lower than the lowest price of the orderbook
                if (!_isOrderAdded) {
                    _newOrdersQueue[_newOrdersQueueIndex] = _newOrderIndex;
                }
            }

            // replace existing orders queue is it's not empty
            ExchangeMarket[_marketIndex].sellOrderBook.ordersQueue = _newOrdersQueue;

            // Add new order to OrderBook
            ExchangeMarket[_marketIndex].sellOrderBook.ordersCount++;
            ExchangeMarket[_marketIndex].sellOrderBook.orders[_newOrderIndex] = Order({
                timestamp: block.timestamp,
                price: price,
                quantity: _sell_qty_balance,
                user: msg.sender,
                status: "A"
            });

            tokenBalanceForAddress[msg.sender][_sellTokenIndex] -= price * _sell_qty_balance;

            // fire event
            emit LogCreateSellOrder(
                sellTokenSymbol,
                buyTokenSymbol,
                price,
                _sell_qty_balance,
                seller,
                block.timestamp
            );
        }
    }

    function fulfilSellOrder(
        string memory sellTokenSymbol, //wrt sell order
        string memory buyTokenSymbol,
        uint256 _sell_qty_balance,
        uint256 price
    ) private returns (uint256) {
        uint8 _marketIndex = getMarketIndex(buyTokenSymbol, sellTokenSymbol);
        uint8 _buyTokenIndex = getTokenIndex(buyTokenSymbol);
        uint8 _sellTokenIndex = getTokenIndex(sellTokenSymbol);
        uint256 _currBuyOrdersCount = ExchangeMarket[_marketIndex].buyOrderBook.ordersCount;

        uint256 _countBuyOrderFulfiled = 0;

        // update buyOrderBook - orders
        for (uint256 i = 0; i < _currBuyOrdersCount; i++) {
            if (_sell_qty_balance == 0) break;

            uint256 _orderIndex = ExchangeMarket[_marketIndex].buyOrderBook.ordersQueue[i];
            uint256 _orderPrice = ExchangeMarket[_marketIndex]
                .buyOrderBook
                .orders[_orderIndex]
                .price;
            uint256 _orderAmount = ExchangeMarket[_marketIndex]
                .buyOrderBook
                .orders[_orderIndex]
                .quantity;
            address _orderOwner = ExchangeMarket[_marketIndex]
                .buyOrderBook
                .orders[_orderIndex]
                .user;

            if (price > _orderPrice) break;

            if (_sell_qty_balance >= _orderAmount) {
                _sell_qty_balance -= _orderAmount;

                ExchangeMarket[_marketIndex].buyOrderBook.orders[_orderIndex].quantity = 0;
                _countBuyOrderFulfiled++;
                emit LogFulfilBuyOrder(
                    sellTokenSymbol,
                    buyTokenSymbol,
                    _orderIndex,
                    price,
                    _orderAmount,
                    block.timestamp
                );

                tokenBalanceForAddress[_orderOwner][_sellTokenIndex] += _orderAmount;
                tokenBalanceForAddress[msg.sender][_buyTokenIndex] += price * _orderAmount;
            } else {
                ExchangeMarket[_marketIndex]
                    .buyOrderBook
                    .orders[_orderIndex]
                    .quantity -= _sell_qty_balance;
                emit LogFulfilBuyOrder(
                    sellTokenSymbol,
                    buyTokenSymbol,
                    _orderIndex,
                    price,
                    _sell_qty_balance,
                    block.timestamp
                );
                tokenBalanceForAddress[_orderOwner][_sellTokenIndex] += _sell_qty_balance;
                tokenBalanceForAddress[msg.sender][_buyTokenIndex] += price * _sell_qty_balance;

                _sell_qty_balance = 0;
            }
        }

        // update buyOrderBook - ordersBook and ordersCount
        uint256 _newBuyOrdersCount = _currBuyOrdersCount - _countBuyOrderFulfiled;

        uint256[] memory _newBuyOrdersQueue = new uint256[](_newBuyOrdersCount);
        for (uint256 i = 0; i < _newBuyOrdersCount; i++) {
            _newBuyOrdersQueue[i] = ExchangeMarket[_marketIndex].buyOrderBook.ordersQueue[
                i + _countBuyOrderFulfiled
            ];
        }

        ExchangeMarket[_marketIndex].buyOrderBook.ordersCount = _newBuyOrdersCount;
        ExchangeMarket[_marketIndex].buyOrderBook.ordersQueue = _newBuyOrdersQueue;

        return _sell_qty_balance;
    }

    //User's ability to cancel orders that were placed
    function cancelBuyOrder(
        string memory buyTokenSymbol,
        string memory sellTokenSymbol,
        uint256 orderIndex
    ) public {
        require(hasToken(buyTokenSymbol));
        require(hasToken(sellTokenSymbol));

        uint8 _marketIndex = getMarketIndex(buyTokenSymbol, sellTokenSymbol);
        uint8 _sellTokenIndex = getTokenIndex(sellTokenSymbol);

        require(ExchangeMarket[_marketIndex].buyOrderBook.ordersCount > 0);

        // Check order is in OrderBook
        // Create new orderQueue
        bool _isOrderInBook = false;
        uint256 _newOrderQueueIndex = 0;
        uint256[] memory _newOrdersQueue = new uint256[](
            ExchangeMarket[_marketIndex].buyOrderBook.ordersCount - 1
        );
        uint256 _price;
        uint256 _quantity;

        for (
            uint256 _orderQueueIndex = 0;
            _orderQueueIndex < ExchangeMarket[_marketIndex].buyOrderBook.ordersCount;
            _orderQueueIndex++
        ) {
            if (
                orderIndex ==
                ExchangeMarket[_marketIndex].buyOrderBook.ordersQueue[_orderQueueIndex]
            ) {
                _isOrderInBook = true;
                _price = ExchangeMarket[_marketIndex].buyOrderBook.orders[orderIndex].price;
                _quantity = ExchangeMarket[_marketIndex].buyOrderBook.orders[orderIndex].quantity;
            } else {
                _newOrdersQueue[_newOrderQueueIndex] = ExchangeMarket[_marketIndex]
                    .buyOrderBook
                    .ordersQueue[_orderQueueIndex];
                _newOrderQueueIndex++;
            }
        }
        require(_isOrderInBook);

        // Update OrderBook and OrderQueue
        ExchangeMarket[_marketIndex].buyOrderBook.ordersCount--;
        ExchangeMarket[_marketIndex].buyOrderBook.ordersQueue = _newOrdersQueue;

        // refund ether balance back to user's account
        tokenBalanceForAddress[msg.sender][_sellTokenIndex] += _price * _quantity;

        emit LogCancelBuyOrder(
            buyTokenSymbol,
            sellTokenSymbol,
            orderIndex,
            msg.sender,
            block.timestamp
        );
    }

    function cancelSellOrder(
        string memory buyTokenSymbol,
        string memory sellTokenSymbol,
        uint256 orderIndex
    ) public {
        require(hasToken(buyTokenSymbol));
        require(hasToken(sellTokenSymbol));

        uint8 _marketIndex = getMarketIndex(buyTokenSymbol, sellTokenSymbol);
        uint8 _sellTokenIndex = getTokenIndex(sellTokenSymbol);

        require(ExchangeMarket[_marketIndex].sellOrderBook.ordersCount > 0);

        // Check order is in OrderBook
        // Create new orderQueue
        bool _isOrderInBook = false;
        uint256 _newOrderQueueIndex = 0;
        uint256[] memory _newOrdersQueue = new uint256[](
            ExchangeMarket[_marketIndex].sellOrderBook.ordersCount - 1
        );
        uint256 _quantity;

        for (
            uint256 _orderQueueIndex = 0;
            _orderQueueIndex < ExchangeMarket[_marketIndex].sellOrderBook.ordersCount;
            _orderQueueIndex++
        ) {
            if (
                orderIndex ==
                ExchangeMarket[_marketIndex].sellOrderBook.ordersQueue[_orderQueueIndex]
            ) {
                _isOrderInBook = true;
                _quantity = ExchangeMarket[_marketIndex].sellOrderBook.orders[orderIndex].quantity;
            } else {
                _newOrdersQueue[_newOrderQueueIndex] = ExchangeMarket[_marketIndex]
                    .sellOrderBook
                    .ordersQueue[_orderQueueIndex];
                _newOrderQueueIndex++;
            }
        }
        require(_isOrderInBook);

        // Update OrderBook and OrderQueue
        ExchangeMarket[_marketIndex].sellOrderBook.ordersCount--;
        ExchangeMarket[_marketIndex].sellOrderBook.ordersQueue = _newOrdersQueue;

        // refund token balance back to user's account
        tokenBalanceForAddress[msg.sender][_sellTokenIndex] += _quantity;

        emit LogCancelSellOrder(
            buyTokenSymbol,
            sellTokenSymbol,
            orderIndex,
            msg.sender,
            block.timestamp
        );
    }

    /* HELPER FUNCTION */

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

    /* GETTER FUNCTIONS */

    function getBuyOrderBook(string memory buyTokenSymbol, string memory sellTokenSymbol)
        public
        view
        returns (
            uint256[] memory,
            uint256[] memory,
            uint256[] memory
        )
    {
        uint8 _marketIndex = getMarketIndex(buyTokenSymbol, sellTokenSymbol);

        uint256[] memory indexes = new uint256[](
            ExchangeMarket[_marketIndex].buyOrderBook.ordersCount
        );
        uint256[] memory prices = new uint256[](
            ExchangeMarket[_marketIndex].buyOrderBook.ordersCount
        );
        uint256[] memory quantity = new uint256[](
            ExchangeMarket[_marketIndex].buyOrderBook.ordersCount
        );

        for (uint256 i = 1; i <= ExchangeMarket[_marketIndex].buyOrderBook.ordersCount; i++) {
            Order memory _order = ExchangeMarket[_marketIndex].buyOrderBook.orders[
                ExchangeMarket[_marketIndex].buyOrderBook.ordersQueue[i - 1]
            ];
            indexes[i - 1] = ExchangeMarket[_marketIndex].buyOrderBook.ordersQueue[i - 1];
            prices[i - 1] = _order.price;
            quantity[i - 1] = _order.quantity;
        }

        return (indexes, prices, quantity);
    }

    function getSellOrderBook(string memory sellTokenSymbol, string memory buyTokenSymbol)
        public
        view
        returns (
            uint256[] memory,
            uint256[] memory,
            uint256[] memory
        )
    {
        uint8 _marketIndex = getMarketIndex(sellTokenSymbol, buyTokenSymbol);

        uint256[] memory indexes = new uint256[](
            ExchangeMarket[_marketIndex].sellOrderBook.ordersCount
        );
        uint256[] memory prices = new uint256[](
            ExchangeMarket[_marketIndex].sellOrderBook.ordersCount
        );
        uint256[] memory quantity = new uint256[](
            ExchangeMarket[_marketIndex].sellOrderBook.ordersCount
        );

        for (uint256 i = 1; i <= ExchangeMarket[_marketIndex].sellOrderBook.ordersCount; i++) {
            Order memory _order = ExchangeMarket[_marketIndex].sellOrderBook.orders[
                ExchangeMarket[_marketIndex].sellOrderBook.ordersQueue[i - 1]
            ];
            indexes[i - 1] = ExchangeMarket[_marketIndex].sellOrderBook.ordersQueue[i - 1];
            prices[i - 1] = _order.price;
            quantity[i - 1] = _order.quantity;
        }

        return (indexes, prices, quantity);
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

    function getMarketIndex(string memory buyTokenSymbol, string memory sellTokenSymbol)
        public
        view
        returns (uint8)
    {
        for (uint8 i = 1; i <= marketIndex; i++) {
            if (
                keccak256(bytes(buyTokenSymbol)) ==
                keccak256(bytes(tokenInfo[buyToSell[i][0]].symbolName)) &&
                keccak256(bytes(sellTokenSymbol)) ==
                keccak256(bytes(tokenInfo[buyToSell[i][1]].symbolName))
            ) {
                return i;
            }
        }
        return 0;
    }

    function getTokenBalanceForUser(string memory symbolName) public view returns (uint256) {
        return tokenBalanceForAddress[msg.sender][getTokenIndex(symbolName)];
    }

    function getAllTokenBalanceForUser() public view returns (string[] memory, uint256[] memory) {
        string[] memory symbolNames = new string[](tokenIndex - 1);
        uint256[] memory balances = new uint256[](tokenIndex - 1);
        for (uint8 i = 1; i <= tokenIndex; i++) {
            symbolNames[i - 1] = tokenInfo[i].symbolName;
            balances[i - 1] = getTokenBalanceForUser(tokenInfo[i].symbolName);
        }
        return (symbolNames, balances);
    }

    //orderIndex, buy/sell tokensymbol, buy or sell, price, quantity
    function getOpenOrdersForUser()
        public
        view
        returns (
            uint256[] memory, /*orderIndex*/
            string[] memory, /*buy/sell tokensymbol*/
            string[] memory, /*buy/sell tokensymbol*/
            string[] memory, /*buy or sell*/
            uint256[] memory, /*price*/
            uint256[] memory, /*quantity*/
            uint8
        )
    {
        uint256[] memory orderIndexes = new uint256[](20); /*orderIndex*/
        string[] memory buySymbols = new string[](20); /*buy/sell tokensymbol*/
        string[] memory sellSymbols = new string[](20); /*buy/sell tokensymbol*/
        string[] memory types = new string[](20); /*buy or sell*/
        uint256[] memory prices = new uint256[](20); /*price*/
        uint256[] memory quantities = new uint256[](20); /*quantity*/
        uint8 count = 0;

        for (uint8 i = 1; i <= marketIndex; i++) {
            for (uint256 j = 1; j <= ExchangeMarket[i].sellOrderBook.ordersCount; j++) {
                Order memory _order = ExchangeMarket[i].sellOrderBook.orders[
                    ExchangeMarket[i].sellOrderBook.ordersQueue[j - 1]
                ];
                if (_order.user == msg.sender) {
                    count++;
                    orderIndexes[count - 1] = ExchangeMarket[i].sellOrderBook.ordersQueue[j - 1];
                    buySymbols[count - 1] = tokenInfo[buyToSell[i][0]].symbolName;
                    sellSymbols[count - 1] = tokenInfo[buyToSell[i][1]].symbolName;
                    types[count - 1] = "sell";
                    prices[count - 1] = _order.price;
                    quantities[count - 1] = _order.quantity;
                }
            }
            for (uint256 j = 1; j <= ExchangeMarket[i].buyOrderBook.ordersCount; j++) {
                Order memory _order = ExchangeMarket[i].buyOrderBook.orders[
                    ExchangeMarket[i].buyOrderBook.ordersQueue[j - 1]
                ];
                if (_order.user == msg.sender) {
                    count++;
                    orderIndexes[count - 1] = ExchangeMarket[i].buyOrderBook.ordersQueue[j - 1];
                    buySymbols[count - 1] = tokenInfo[buyToSell[i][0]].symbolName;
                    sellSymbols[count - 1] = tokenInfo[buyToSell[i][1]].symbolName;
                    types[count - 1] = "buy";
                    prices[count - 1] = _order.price;
                    quantities[count - 1] = _order.quantity;
                }
            }
        }

        return (orderIndexes, buySymbols, sellSymbols, types, prices, quantities, count);
    }

    function getAllTokens() public view returns (string[] memory, address[] memory) {
        string[] memory symbolNames = new string[](tokenIndex - 1);
        address[] memory addresses = new address[](tokenIndex - 1);

        for (uint8 i = 1; i <= tokenIndex; i++) {
            symbolNames[i - 1] = tokenInfo[i].symbolName;
            addresses[i - 1] = tokenInfo[i].contractAddress;
        }

        return (symbolNames, addresses);
    }

    function getAllMarkets() public view returns (string[] memory, string[] memory) {
        string[] memory buySymbols = new string[](marketIndex - 1);
        string[] memory sellSymbols = new string[](marketIndex - 1);

        for (uint8 i = 1; i <= marketIndex; i++) {
            buySymbols[i - 1] = tokenInfo[buyToSell[i][0]].symbolName;
            sellSymbols[i - 1] = tokenInfo[buyToSell[i][1]].symbolName;
        }

        return (buySymbols, sellSymbols);
    }
}
