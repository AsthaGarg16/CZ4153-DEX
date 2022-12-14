// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";
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
        mapping(uint8 => OrderBook) Orders;
    }

    //Mapping for storage

    mapping(uint8 => Token) tokenInfo;
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

    event LogAddMarket(
        uint256 marketIndex,
        string symbolName,
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

    event LogFulfillOrder(
        uint8 typeOfOrder,
        uint8 symbolName1,
        uint8 symbolName2,
        uint256 price,
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
    function addToken(string memory symbolName, address EC20TokenAddress)
        public
        onlyOwner
    {
        require(!hasToken(symbolName), "Token already exists");
        require(tokenIndex + 1 >= tokenIndex, "Token Index overflow");

        tokenIndex++;
        tokenInfo[tokenIndex].symbolName = symbolName;
        tokenInfo[tokenIndex].contractAddress = EC20TokenAddress;

        if (tokenIndex > 1) {
            addMarket(symbolName);
        }

        emit LogAddToken(
            tokenIndex,
            symbolName,
            EC20TokenAddress,
            block.timestamp
        );
    }

    //A Market is added with combination with previous tokens so all exchanges are available
    function addMarket(string memory symbolName) public onlyOwner {
        require(marketIndex + 1 >= marketIndex, "Market Index overflow");

        for (uint8 i = 1; i < tokenIndex; i++) {
            console.log("Adding market ", tokenIndex, i);
            marketIndex++;
            uint8[] memory toAdd = new uint8[](2);
            toAdd[0] = tokenIndex;
            toAdd[1] = i;
            buyToSell[marketIndex] = toAdd;
        }

        console.log("Total markets ", marketIndex);

        emit LogAddMarket(marketIndex, symbolName, block.timestamp);
    }

    // Address's Tokens account management - ability to deposit tokens
    function depositToken(string memory symbolName, uint256 amount)
        public
        returns (uint256 tokenBalance)
    {
        require(hasToken(symbolName), "Token not present");
        require(
            getTokenBalanceForUser(symbolName) + amount >=
                getTokenBalanceForUser(symbolName),
            "Amount overflow"
        );
        uint8 _tokenIndex = getTokenIndex(symbolName);
        tokenBalanceForAddress[msg.sender][_tokenIndex] += amount;
        IERC20 token = IERC20(tokenInfo[_tokenIndex].contractAddress);
        require(
            token.transferFrom(msg.sender, address(this), amount) == true,
            "Transfer could not happen"
        );
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
        IERC20 token = IERC20(tokenInfo[_tokenIndex].contractAddress);
        require(token.transfer(msg.sender, amount) == true);

        emit LogWithdrawToken(symbolName, msg.sender, amount, block.timestamp);
        return getTokenBalanceForUser(symbolName);
    }

    //Adding order to the orderbook
    function addOrder(
        uint8 tokenIndex1,
        uint8 tokenIndex2,
        uint8 typeOfOrder,
        Order memory toAdd
    ) private {
        console.log("In add order");
        (, uint256[] memory prices, ) = getOrderBook(
            tokenIndex1,
            tokenIndex2,
            typeOfOrder
        );

        uint8 _marketIndex = getMarketIndex(tokenIndex1, tokenIndex2);
        uint256 _newOrderIndex = ++ExchangeMarket[_marketIndex]
            .Orders[typeOfOrder]
            .orderIndex;
        uint256[] memory _newOrdersQueue = new uint256[](_newOrderIndex);
        bool _isOrderAdded = false;

        if (ExchangeMarket[_marketIndex].Orders[typeOfOrder].ordersCount == 0) {
            _newOrdersQueue[0] = _newOrderIndex;
            _isOrderAdded = true;
        } else {
            uint256 _newOrdersQueueIndex = 0;
            for (
                uint256 i = 0;
                i <
                ExchangeMarket[_marketIndex].Orders[typeOfOrder].ordersCount;
                i++
            ) {
                if (!_isOrderAdded && toAdd.price > prices[i]) {
                    _newOrdersQueue[_newOrdersQueueIndex++] = _newOrderIndex;
                    _isOrderAdded = true;
                }
                _newOrdersQueue[_newOrdersQueueIndex++] = ExchangeMarket[
                    _marketIndex
                ].Orders[typeOfOrder].ordersQueue[i];
            }
            if (!_isOrderAdded) {
                _newOrdersQueue[_newOrdersQueueIndex] = _newOrderIndex;
            }
        }
        ExchangeMarket[_marketIndex]
            .Orders[typeOfOrder]
            .ordersQueue = _newOrdersQueue;
        ExchangeMarket[_marketIndex].Orders[typeOfOrder].ordersCount++;
        ExchangeMarket[_marketIndex].Orders[typeOfOrder].orders[
            _newOrderIndex
        ] = Order({
            quantity: toAdd.quantity,
            price: toAdd.price,
            user: msg.sender,
            timestamp: block.timestamp
        });

        console.log("is order added", _isOrderAdded);
    }

    //Public function to place orders
    //0 - buy, 1- sell for typeOfOrder
    function createOrder(
        uint8 typeOfOrder,
        string memory buySymbolName,
        string memory sellSymbolName,
        uint256 price,
        uint256 quantity,
        bool isMarketOrder
    ) public {
        console.log("creating order");
        require(hasToken(buySymbolName), "Token not present");
        require(hasToken(sellSymbolName), "Token not present");
        console.log("creating order", typeOfOrder);
        uint8 _primaryTokenIndex;
        uint8 _secondaryTokenIndex;
        uint8 _marketIndex;
        uint256 _qty_balance = quantity;

        if (typeOfOrder == 0) {
            _primaryTokenIndex = getTokenIndex(buySymbolName);
            _secondaryTokenIndex = getTokenIndex(sellSymbolName);
            require(
                (!isMarketOrder &&
                    tokenBalanceForAddress[msg.sender][_secondaryTokenIndex] >=
                    price * quantity) || isMarketOrder,
                "Not enough funds"
            );
        } else {
            _primaryTokenIndex = getTokenIndex(sellSymbolName); //A
            _secondaryTokenIndex = getTokenIndex(buySymbolName); //B
            require(
                (!isMarketOrder &&
                    tokenBalanceForAddress[msg.sender][_primaryTokenIndex] >=
                    price * quantity) || isMarketOrder,
                "Not enough funds"
            );
        }
        _marketIndex = getMarketIndex(_primaryTokenIndex, _secondaryTokenIndex);
        uint8 index = typeOfOrder == 0 ? 1 : 0;
        console.log("index", index);

        if (ExchangeMarket[_marketIndex].Orders[index].ordersCount > 0) {
            // fulfil buyOrder by checking against which sell orders can be fulfil
            _qty_balance = fulfillOrder(
                index,
                _primaryTokenIndex,
                _secondaryTokenIndex,
                Order({
                    quantity: quantity,
                    price: price,
                    timestamp: block.timestamp,
                    user: msg.sender
                }),
                isMarketOrder
            );
        }
        if (_qty_balance > 0) {
            Order memory toAdd = Order({
                quantity: _qty_balance,
                price: price,
                timestamp: block.timestamp,
                user: msg.sender
            });
            if (!isMarketOrder) {
                addOrder(
                    _primaryTokenIndex,
                    _secondaryTokenIndex,
                    typeOfOrder,
                    toAdd
                );
            }
        }
        if (typeOfOrder == 0) {
            tokenBalanceForAddress[msg.sender][_secondaryTokenIndex] -=
                price *
                _qty_balance;
        } else {
            tokenBalanceForAddress[msg.sender][_primaryTokenIndex] -=
                price *
                _qty_balance;
        }

        // fire event
        emit LogCreateBuyOrder(
            buySymbolName,
            sellSymbolName,
            price,
            _qty_balance,
            msg.sender,
            block.timestamp
        );
    }

    //Try if buy order can be immediately fulfilled even if partially
    function fulfillOrder(
        uint8 typeOfOrder,
        uint8 _primaryTokenIndex,
        uint8 _secondaryTokenIndex,
        Order memory toFulfill,
        bool isMarketOrder
    ) private returns (uint256) {
        console.log("in fulfill order");
        uint8 _marketIndex = getMarketIndex(
            _primaryTokenIndex,
            _secondaryTokenIndex
        );

        uint256 _currOrdersCount = ExchangeMarket[_marketIndex]
            .Orders[typeOfOrder]
            .ordersCount;
        console.log("_currOrdersCount", _currOrdersCount);
        uint256 _countOrderFulfiled = 0;
        for (uint256 i = 0; i < _currOrdersCount; i++) {
            if (toFulfill.quantity == 0) break;

            uint256 _orderIndex = ExchangeMarket[_marketIndex]
                .Orders[typeOfOrder]
                .ordersQueue[i];

            uint256 _orderAmount = ExchangeMarket[_marketIndex]
                .Orders[typeOfOrder]
                .orders[_orderIndex]
                .quantity;
            address _orderOwner = ExchangeMarket[_marketIndex]
                .Orders[typeOfOrder]
                .orders[_orderIndex]
                .user;
            console.log(
                "In fulfillOrder",
                _orderIndex,
                _orderAmount,
                _orderOwner
            );
            if (
                typeOfOrder == 1 &&
                toFulfill.price <
                ExchangeMarket[_marketIndex]
                    .Orders[typeOfOrder]
                    .orders[_orderIndex]
                    .price &&
                !isMarketOrder
            ) break;
            else if (
                typeOfOrder == 0 &&
                toFulfill.price >
                ExchangeMarket[_marketIndex]
                    .Orders[typeOfOrder]
                    .orders[_orderIndex]
                    .price &&
                !isMarketOrder
            ) break;

            if (toFulfill.quantity >= _orderAmount) {
                toFulfill.quantity -= _orderAmount;

                ExchangeMarket[_marketIndex]
                    .Orders[typeOfOrder]
                    .orders[_orderIndex]
                    .quantity = 0;
                _countOrderFulfiled++;
                emit LogFulfillOrder(
                    typeOfOrder,
                    _primaryTokenIndex,
                    _secondaryTokenIndex,
                    toFulfill.price,
                    _orderAmount,
                    block.timestamp
                );
                if (typeOfOrder == 1) {
                    //price is fixed
                    tokenBalanceForAddress[_orderOwner][
                        _secondaryTokenIndex
                    ] += _orderAmount;
                    tokenBalanceForAddress[msg.sender][_primaryTokenIndex] +=
                        ExchangeMarket[_marketIndex]
                            .Orders[typeOfOrder]
                            .orders[_orderIndex]
                            .price *
                        _orderAmount;
                    tokenBalanceForAddress[msg.sender][
                        _secondaryTokenIndex
                    ] -= _orderAmount;
                } else {
                    tokenBalanceForAddress[_orderOwner][
                        _primaryTokenIndex
                    ] += _orderAmount;
                    tokenBalanceForAddress[msg.sender][_secondaryTokenIndex] +=
                        ExchangeMarket[_marketIndex]
                            .Orders[typeOfOrder]
                            .orders[_orderIndex]
                            .price *
                        _orderAmount;
                    tokenBalanceForAddress[msg.sender][
                        _primaryTokenIndex
                    ] -= _orderAmount;
                }
            } else {
                ExchangeMarket[_marketIndex]
                    .Orders[typeOfOrder]
                    .orders[_orderIndex]
                    .quantity -= toFulfill.quantity;
                emit LogFulfillOrder(
                    typeOfOrder,
                    _primaryTokenIndex,
                    _secondaryTokenIndex,
                    toFulfill.price,
                    _orderAmount,
                    block.timestamp
                );

                if (typeOfOrder == 1) {
                    tokenBalanceForAddress[_orderOwner][
                        _secondaryTokenIndex
                    ] += toFulfill.quantity;
                    tokenBalanceForAddress[msg.sender][_primaryTokenIndex] +=
                        ExchangeMarket[_marketIndex]
                            .Orders[typeOfOrder]
                            .orders[_orderIndex]
                            .price *
                        toFulfill.quantity;
                    tokenBalanceForAddress[_orderOwner][
                        _secondaryTokenIndex
                    ] -= toFulfill.quantity;
                } else {
                    tokenBalanceForAddress[_orderOwner][
                        _primaryTokenIndex
                    ] += toFulfill.quantity;
                    tokenBalanceForAddress[msg.sender][_secondaryTokenIndex] +=
                        ExchangeMarket[_marketIndex]
                            .Orders[typeOfOrder]
                            .orders[_orderIndex]
                            .price *
                        toFulfill.quantity;
                    tokenBalanceForAddress[_orderOwner][
                        _primaryTokenIndex
                    ] -= toFulfill.quantity;
                }

                toFulfill.quantity = 0;
            }
        }

        console.log("Orders fulfilled ", _countOrderFulfiled);

        // update sellOrderBook - ordersBook and ordersCount
        updateOrderBook(
            _currOrdersCount,
            _countOrderFulfiled,
            typeOfOrder,
            _marketIndex
        );

        return toFulfill.quantity;
    }

    //Function to update existing order in orderbook
    function updateOrderBook(
        uint256 _currOrdersCount,
        uint256 _countOrderFulfiled,
        uint8 typeOfOrder,
        uint8 _marketIndex
    ) private {
        //change naming
        console.log("Updating order book");
        uint256 _newOrdersCount = _currOrdersCount - _countOrderFulfiled;

        uint256[] memory _newSellOrdersQueue = new uint256[](_newOrdersCount);
        for (uint256 i = 0; i < _newOrdersCount; i++) {
            _newSellOrdersQueue[i] = ExchangeMarket[_marketIndex]
                .Orders[typeOfOrder]
                .ordersQueue[i + _countOrderFulfiled];
            console.log("_newSellOrdersQueue[i]", _newSellOrdersQueue[i]);
        }

        ExchangeMarket[_marketIndex]
            .Orders[typeOfOrder]
            .ordersCount = _newOrdersCount;
        ExchangeMarket[_marketIndex]
            .Orders[typeOfOrder]
            .ordersQueue = _newSellOrdersQueue;
        ExchangeMarket[_marketIndex]
            .Orders[typeOfOrder]
            .orderIndex = _newOrdersCount;
    }

    //User's ability to cancel orders that were placed
    function cancelOrder(
        uint8 typeOfOrder,
        string memory buyTokenSymbol,
        string memory sellTokenSymbol,
        uint256 orderIndex
    ) public {
        require(hasToken(buyTokenSymbol));
        require(hasToken(sellTokenSymbol));

        uint8 _primaryTokenIndex;
        uint8 _secondaryTokenIndex;
        uint8 _marketIndex;

        if (typeOfOrder == 0) {
            _primaryTokenIndex = getTokenIndex(buyTokenSymbol);
            _secondaryTokenIndex = getTokenIndex(sellTokenSymbol);
        } else {
            _primaryTokenIndex = getTokenIndex(sellTokenSymbol);
            _secondaryTokenIndex = getTokenIndex(buyTokenSymbol);
        }

        require(
            ExchangeMarket[_marketIndex].Orders[typeOfOrder].ordersCount > 0
        );

        // Check order is in OrderBook
        // Create new orderQueue
        bool _isOrderInBook = false;
        uint256 _newOrderQueueIndex = 0;
        uint256[] memory _newOrdersQueue = new uint256[](
            ExchangeMarket[_marketIndex].Orders[typeOfOrder].ordersCount - 1
        );
        uint256 _price;
        uint256 _quantity;

        for (
            uint256 _orderQueueIndex = 0;
            _orderQueueIndex <
            ExchangeMarket[_marketIndex].Orders[typeOfOrder].ordersCount;
            _orderQueueIndex++
        ) {
            if (
                orderIndex ==
                ExchangeMarket[_marketIndex].Orders[typeOfOrder].ordersQueue[
                    _orderQueueIndex
                ]
            ) {
                _isOrderInBook = true;
                _price = ExchangeMarket[_marketIndex]
                    .Orders[typeOfOrder]
                    .orders[orderIndex]
                    .price;
                _quantity = ExchangeMarket[_marketIndex]
                    .Orders[typeOfOrder]
                    .orders[orderIndex]
                    .quantity;
            } else {
                _newOrdersQueue[_newOrderQueueIndex] = ExchangeMarket[
                    _marketIndex
                ].Orders[typeOfOrder].ordersQueue[_orderQueueIndex];
                _newOrderQueueIndex++;
            }
        }
        require(_isOrderInBook);

        // Update OrderBook and OrderQueue
        ExchangeMarket[_marketIndex].Orders[typeOfOrder].ordersCount--;
        ExchangeMarket[_marketIndex]
            .Orders[typeOfOrder]
            .ordersQueue = _newOrdersQueue;

        // refund ether balance back to user's account
        if (typeOfOrder == 0) {
            tokenBalanceForAddress[msg.sender][_secondaryTokenIndex] +=
                _price *
                _quantity;
        } else {
            tokenBalanceForAddress[msg.sender][_primaryTokenIndex] +=
                _price *
                _quantity;
        }

        emit LogCancelBuyOrder(
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

    function getOrderBook(
        uint8 buyTokenIndex,
        uint8 sellTokenIndex,
        uint8 type_of_order
    )
        public
        view
        returns (
            uint256[] memory,
            uint256[] memory,
            uint256[] memory
        )
    {
        console.log("GetOrderbook ");
        console.log("type_of_order", type_of_order);
        uint8 _marketIndex = getMarketIndex(buyTokenIndex, sellTokenIndex);

        OrderBook storage order_book = ExchangeMarket[_marketIndex].Orders[
            type_of_order
        ];

        console.log(_marketIndex);

        uint256[] memory indexes = new uint256[](order_book.ordersCount);
        uint256[] memory prices = new uint256[](order_book.ordersCount);
        uint256[] memory quantity = new uint256[](order_book.ordersCount);

        console.log("order_book.ordersCount", order_book.ordersCount);

        for (uint256 i = 1; i <= order_book.ordersCount; i++) {
            Order memory _order = order_book.orders[
                order_book.ordersQueue[i - 1]
            ];
            indexes[i - 1] = order_book.ordersQueue[i - 1];
            prices[i - 1] = _order.price;
            quantity[i - 1] = _order.quantity;
            console.log(
                "entry orderbook",
                indexes[i - 1],
                prices[i - 1],
                quantity[i - 1]
            );
        }
        //console.log("entry orderbook", indexes[0], prices[0], quantity[0]);

        return (indexes, prices, quantity);
    }

    function getTokenIndex(string memory symbolName)
        public
        view
        returns (uint8)
    {
        for (uint8 i = 1; i <= tokenIndex; i++) {
            if (
                keccak256(bytes(symbolName)) ==
                keccak256(bytes(tokenInfo[i].symbolName))
            ) {
                return i;
            }
        }
        return 0;
    }

    function getMarketIndex(
        string memory buyTokenSymbol,
        string memory sellTokenSymbol
    ) public view returns (uint8) {
        for (uint8 i = 1; i <= marketIndex; i++) {
            if (
                keccak256(bytes(buyTokenSymbol)) ==
                keccak256(bytes(tokenInfo[buyToSell[i][0]].symbolName)) &&
                keccak256(bytes(sellTokenSymbol)) ==
                keccak256(bytes(tokenInfo[buyToSell[i][1]].symbolName))
            ) {
                console.log("Returning market index ", i);
                return i;
            }
        }
        console.log("Returning market index ", 0);
        return 0;
    }

    function getMarketIndex(uint8 buyTokenIndex, uint8 sellTokenIndex)
        public
        view
        returns (uint8)
    {
        for (uint8 i = 1; i <= marketIndex; i++) {
            if (
                buyTokenIndex == buyToSell[i][0] &&
                sellTokenIndex == buyToSell[i][1]
            ) {
                console.log("Returning market index ", i);
                return i;
            }
        }
        console.log("Returning market index ", 0);
        return 0;
    }

    function getTokenBalanceForUser(string memory symbolName)
        public
        view
        returns (uint256)
    {
        return tokenBalanceForAddress[msg.sender][getTokenIndex(symbolName)];
    }

    function getAllTokenBalanceForUser()
        public
        view
        returns (string[] memory, uint256[] memory)
    {
        string[] memory symbolNames = new string[](tokenIndex);
        uint256[] memory balances = new uint256[](tokenIndex);
        for (uint8 i = 1; i <= tokenIndex; i++) {
            console.log(
                "balance ",
                getTokenBalanceForUser(tokenInfo[i].symbolName)
            );
            symbolNames[i - 1] = tokenInfo[i].symbolName;
            balances[i - 1] = getTokenBalanceForUser(tokenInfo[i].symbolName);
        }
        return (symbolNames, balances);
    }

    function getAllTokens()
        public
        view
        returns (string[] memory, address[] memory)
    {
        string[] memory symbolNames = new string[](tokenIndex);
        address[] memory addresses = new address[](tokenIndex);

        for (uint8 i = 1; i <= tokenIndex; i++) {
            symbolNames[i - 1] = tokenInfo[i].symbolName;
            addresses[i - 1] = tokenInfo[i].contractAddress;
        }

        return (symbolNames, addresses);
    }

    function getMarketIndex() public view returns (uint8) {
        return marketIndex;
    }

    function getAllMarkets()
        public
        view
        returns (string[] memory, string[] memory)
    {
        string[] memory buySymbols = new string[](marketIndex);
        string[] memory sellSymbols = new string[](marketIndex);
        console.log("markets number ", marketIndex);

        for (uint8 i = 1; i <= marketIndex; i++) {
            console.log(
                "Market ",
                tokenInfo[2].symbolName,
                tokenInfo[1].symbolName
            );
            buySymbols[i - 1] = tokenInfo[buyToSell[i][0]].symbolName;
            sellSymbols[i - 1] = tokenInfo[buyToSell[i][1]].symbolName;
        }

        return (buySymbols, sellSymbols);
    }
}
