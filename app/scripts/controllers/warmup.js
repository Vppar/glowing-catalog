(function(angular) {
    'use strict';

    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    function WarmupCtrl($scope, $log, UserService, WarmupService) {
        UserService.redirectIfIsNotLoggedIn();
        $log.debug('Initializing WarmupCtrl...');


        $scope.date = {
            value : null
        };
    }


    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    function BalanceWarmupCtrl($scope, $log, SyncDriver, DialogService, ArrayUtils, EntityService, BalanceWarmupService) {
        $log.debug('Initializing BalanceWarmupCtrl...');

        var balance = {};
        var check = {};
        var checkingAccount = {};

        balance.total = 0;

        balance.cash = {
            total : 0,
            item : BalanceWarmupService.cash.getItem()
        };

        balance.cash.total = balance.cash.item.balance;


        check = {
            bank : null,
            agency : null,
            account : null,
            clientName : null,
            entityId : null,
            number : null,
            amount : 0,
        };


        balance.check = {
            edit : (function () {
                var item = null;

                function setItem(targetItem) {
                    item = targetItem || null;
                    self.newItem = !item;
                }

                function editInternal(targetItem) {
                    $log.debug('editing check item', targetItem);
                    setItem(targetItem);
                    resetData();
                }

                var self = editInternal;

                self.data = {};
                self.newItem = true;

                function resetData() {
                    self.data.bank = item ? item.bank : null;
                    self.data.agency = item ? item.agency : null;
                    self.data.account = item ? item.account : null;
                    self.data.clientName = item ? item.clientName : null;
                    self.data.entityId = item ? item.entityId : null;
                    self.data.number = item ? item.number : null;
                    self.data.duedate = item ? item.duedate : null;
                    self.data.amount = item ? item.amount : 0;
                }

                function saveItem() {
                    if ($scope.warmupCheckForm.$valid) {
                        $log.debug('Saving check item...', item);
                        if (item) {
                            item.bank = self.data.bank;
                            item.agency = self.data.agency;
                            item.account = self.data.account;
                            item.clientName = self.data.clientName;
                            item.entityId = self.data.entityId;
                            item.number = self.data.number;
                            item.duedate = self.data.duedate.getTime();
                            item.amount = self.data.amount;
                        } else {
                            balance.check.addItem(self.data);
                        }

                        clearData();
                    }
                }

                function clearData() {
                    setItem(null);
                    resetData();
                }


                function openChooseCustomerDialog() {
                    DialogService.openDialogChooseCustomerNoRedirect().then(function (uuid) {
                        if (uuid) {
                            var customer = ArrayUtils.find(EntityService.list(), 'uuid', uuid);
                            self.data.clientName = customer.name;
                            self.data.entityId = uuid;
                        }
                    })
                }

                self.reset = resetData;
                self.save = saveItem;
                self.clear = clearData;
                self.openChooseCustomerDialog = openChooseCustomerDialog;

                return editInternal;
            })(),

            total : BalanceWarmupService.check.getTotal(),
            items : BalanceWarmupService.check.getItems(),

            addItem : function (data) {
                var item = {};
                ObjectUtils.dataCopy(item, data);
                this.items.push(item);
                // It's safe to assume new items have not been used...
                item.used = false;
                $log.debug('Adding check item', item);
            },

            removeItem : function (item) {
                var idx = this.items.indexOf(item);
                if (~idx) {
                    this.items.splice(idx, 1);
                }
            }
        };


        balance.checkingAccount = {
            edit : (function () {
                var item = null;

                function setItem(targetItem) {
                    item = targetItem || null;
                    self.newItem = !item;
                }


                function editInternal(targetItem) {
                    setItem(targetItem);
                    resetData();
                }

                var self = editInternal;

                self.data = {};
                self.newItem = true;

                function resetData() {
                    self.data.bank = item ? item.bank : null;
                    self.data.agency = item ? item.agency : null;
                    self.data.account = item ? item.account : null;
                    self.data.balance = item ? item.balance : 0;
                }

                function saveItem() {
                    if ($scope.warmupCheckingAccountForm.$valid) {
                        if (item) {
                            item.bank = self.data.bank;
                            item.agency = self.data.agency;
                            item.account = self.data.account;
                            item.balance = self.data.balance;
                        } else {
                            balance.checkingAccount.addItem(self.data);
                        }

                        clearData();
                    }
                }

                function clearData() {
                    setItem(null);
                    resetData();
                }

                self.reset = resetData;
                self.save = saveItem;
                self.clear = clearData;

                return editInternal;
            })(),
            
            total : BalanceWarmupService.checkingAccount.getTotal(),
            items : BalanceWarmupService.checkingAccount.getItems(),

            hasAvailableBook : BalanceWarmupService.checkingAccount.book.hasAvailable(),

            addItem : function (data) {
                data = data || {};
                var item = {};
                ObjectUtils.dataCopy(item, data);
                item.access = BalanceWarmupService.checkingAccount.book.getAvailable();

                if (!item.access) {
                    $log.error('No checking account book available!');
                } else {
                    // It's safe to assume new items have not been used...
                    item.used = false;
                    this.items.push(item);
                    $log.debug('Added checkingAccount item', item);
                }
            },

            removeItem : function (item) {
                // MUST check if the book has no entries before allowing it to be
                // removed
                $log.debug('Removing checking account item', item);
                var idx = this.items.indexOf(item);
                if (~idx) {
                    // FIXME check if the item has entries
                    this.items.splice(idx, 1);
                    BalanceWarmupService.checkingAccount.book.untake(item.access);
                }
            }
        };


        balance.confirm = function () {
            $log.debug('Warmup balance confirmed');
            var ref = SyncDriver.refs.user.child('warmup');
            var cash = balance.cash.item;
            var check = balance.check.items;
            var checkingAccount = balance.checkingAccount.items;
            var date = $scope.date;

            if (date.value && date.value.getTime) {
                for (var idx in check) {
                    check[idx].created = date.value.getTime();
                }
            }

            return BalanceWarmupService
                .updateBalanceWarmup(ref, cash, check, checkingAccount)
                .then(function () {
                    return DialogService.messageDialog({
                        title : 'Saldo inicial',
                        message : 'Saldo inicial armazenado com sucesso!',
                        btnYes : 'Ok'
                    });
                });
        };


        $scope.check = check;
        $scope.checkingAccount = checkingAccount;
        $scope.balance = balance;


        function updateBalanceTotal() {
            balance.total = balance.cash.total +
                balance.check.total +
                balance.checkingAccount.total;
        }


        function updateCheckTotal() {
            var total = 0;

            for (var idx in balance.check.items) {
                total += balance.check.items[idx].amount;
            }

            balance.check.total = total;
        }


        function updateCheckingAccountTotal() {
            var total = 0;

            for (var idx in balance.checkingAccount.items) {
                total += balance.checkingAccount.items[idx].balance;
            }

            balance.checkingAccount.total = total;
        }

        function checkAvailableBooks() {
            balance.checkingAccount.hasAvailableBook = BalanceWarmupService.checkingAccount.book.hasAvailable();
        }





        $scope.$watchCollection('balance.checkingAccount.items', updateCheckingAccountTotal);
        $scope.$watchCollection('balance.checkingAccount.items', checkAvailableBooks);
        $scope.$watchCollection('balance.check.items', updateCheckTotal);

        $scope.$watch('balance.cash.total', updateBalanceTotal);
        $scope.$watch('balance.check.total', updateBalanceTotal);
        $scope.$watch('balance.checkingAccount.total', updateBalanceTotal);
    }




    ///////////////////////////////////////////////////////////
    function StockWarmupCtrl($scope, $log, SyncDriver, StockService, InventoryKeeper, ArrayUtils, StockWarmupService, DialogService) {
        //FIXME Revise this controller, verify if there is dead code or unnecessary variables
        

        $log.debug('Initializing StockWarmupCtrl...');
        

        // #####################################################################################################
        // Local Functions
        // #####################################################################################################
        function resetWatchedQty() {
            for ( var ix in $scope.main.stockReport.sessions) {
                // sessions
                var session = $scope.main.stockReport.sessions[ix];
                // lines of that session
                for ( var ix2 in session.lines) {
                    // lines
                    var line = session.lines[ix2];
                    // items of that line
                    for ( var ix3 in line.items) {
                        var item = line.items[ix3];
                        // backup items to use when a recals is
                        // needed
                        $scope.newStock.items[item.id] = item;
                        $scope.newStock.watchedQty[item.id] = 0;
                    }
                }
            }

            updateProductQty();
        }

        function updateProductQty() {
            var warmupStock = StockWarmupService.getLocalStockEntries();

            for (var idx in warmupStock) {
                var entry = warmupStock[idx];
                var event = entry.event;
                var item = $scope.newStock.items[event.inventoryId];

                var discountedPrice = event.cost;
                var originalPrice = item.price;

                var discount = (100 - (discountedPrice / originalPrice) * 100);

                $scope.newStock.discounts[event.inventoryId] = discount ? (Math.round(100 * discount) / 100) : 0;
                $scope.newStock.watchedQty[event.inventoryId] = event.quantity;
            }
        }


        function getCostWithDiscount(cost, discount) {
            discount = parseInt(discount);

            return Math.round(100 * cost * ((100 - discount) / 100)) / 100;
        }


        //from principal!!!
        /**
         * Summary tab
         */
        $scope.summary = {};
        $scope.summary.total = {};

        $scope.newStock = {};
        $scope.newStock.items = {};
        $scope.newStock.watchedQty = {};
        $scope.newStock.discounts = {};
        $scope.filter = {
                        text : ''
                    };
        $scope.main = {};
        $scope.main.stockReport = StockService.stockReport('all');


        /**
                     * Method to summarize the products from the list
                     * 
                     * @param pickerArray - List with the value of the selector
                     *            from the html
                     * 
                     * @param hide - boolean used to determine if the filter
                     *            will consider the hide attribute on the items.
                     * 
                     */
                    $scope.summarizer =
                        function (pickerArray, hide) {
                            var diff = {
                                amount : 0,
                                points : 0
                            };

                            $scope.summary.total.sessions = {};

                            for ( var ix in pickerArray) {

                                // get the necessary values from the item
                                var price = $scope.newStock.items[ix].price;
                                var points = $scope.newStock.items[ix].points;
                                var session = $scope.newStock.items[ix].session;
                                var line = $scope.newStock.items[ix].line;
                                var minQty = $scope.newStock.items[ix].minQty;
                                var qty = pickerArray[ix];
                                var itemHide;

                                // if the method receives hide as true, then the
                                // itemHide will be the same as the hide
                                // property of the item, that way the items with
                                // hide = true won't be considered.
                                // Otherwise the itemHide receives false and all
                                // items will be considered.
                                if (hide === true) {
                                    itemHide = $scope.newStock.items[ix].hide;
                                } else {
                                    itemHide = false;
                                }

                                diff.amount += (pickerArray[ix] * price);
                                diff.points += (pickerArray[ix] * points);

                                // create the objects for the current session
                                // and line.
                                if (!$scope.summary.total.sessions[session]) {
                                    $scope.summary.total.sessions[session] = {
                                        total : 0,
                                        minQty : 0,
                                        orderQty : 0,
                                        avg : 0,
                                        pts : 0,
                                        lines : {}
                                    };
                                }
                                if (!$scope.summary.total.sessions[session].lines[line]) {
                                    $scope.summary.total.sessions[session].lines[line] = {
                                        total : 0,
                                        minQty : 0,
                                        orderQty : 0,
                                        avg : 0,
                                        pts : 0
                                    };
                                }

                                // sum of the price per line and session
                                if ((pickerArray[ix] * price) > 0 && itemHide === false) {
                                    $scope.summary.total.sessions[session].total +=
                                        (pickerArray[ix] * price);
                                    $scope.summary.total.sessions[session].lines[line].total +=
                                        (pickerArray[ix] * price);
                                }
                                // sum of the minQty per line and session
                                if (minQty && itemHide === false) {
                                    $scope.summary.total.sessions[session].minQty += minQty;
                                    $scope.summary.total.sessions[session].lines[line].minQty +=
                                        minQty;
                                }
                                // sum of the actual selected qty per line and
                                // session
                                if (qty > 0 && itemHide === false) {
                                    $scope.summary.total.sessions[session].orderQty += qty;
                                    $scope.summary.total.sessions[session].lines[line].orderQty +=
                                        qty;
                                }
                                // sum of the points per line and session
                                if (qty > 0 && itemHide === false) {
                                    $scope.summary.total.sessions[session].pts +=
                                        (pickerArray[ix] * points);
                                    $scope.summary.total.sessions[session].lines[line].pts +=
                                        (pickerArray[ix] * points);
                                }
                            }

                            // the total overall
                            $scope.summary.total.amount = diff.amount;
                            $scope.summary.total.points = diff.points;

                            // calculate the average value.
                            for ( var ix1 in $scope.summary.total.sessions) {
                                if ($scope.summary.total.sessions[ix1].orderQty > 0) {
                                    $scope.summary.total.sessions[ix1].avg =
                                        ($scope.summary.total.sessions[ix1].total) /
                                            ($scope.summary.total.sessions[ix1].orderQty);
                                }
                                for ( var ix2 in $scope.summary.total.sessions[ix1].lines) {
                                    if ($scope.summary.total.sessions[ix1].lines[ix2].orderQty > 0) {
                                        $scope.summary.total.sessions[ix1].lines[ix2].avg =
                                            ($scope.summary.total.sessions[ix1].lines[ix2].total) /
                                                ($scope.summary.total.sessions[ix1].lines[ix2].orderQty);
                                    }
                                }
                            }
                        };


        //end from principal

        

        var stockReport = $scope.main.stockReport;
        var currentProductWatcher = {};

        // #####################################################################################################
        // Local Functions
        // #####################################################################################################

        function setHideAttributes(sessions, hideLine, hideProduct) {
            for ( var ix in sessions) {
                var session = sessions[ix];
                session.hide = false;
                for ( var ix2 in session.lines) {
                    var line = session.lines[ix2];
                    line.hide = hideLine;
                    for ( var ix3 in line.items) {
                        var item = line.items[ix3];
                        item.hide = hideProduct;
                    }
                }
            }
        }

        function productFilter(newVal, oldVal) {
            $scope.filter.text = newVal;
            if (newVal !== oldVal) {
                var myTextFilter = String($scope.productFilter.text);
                if (myTextFilter.length >= 3) {
                    $scope.selectedLevel = 3;
                    var objFilter = {
                        title : myTextFilter,
                        SKU : myTextFilter
                    };
                    StockService.updateReport(stockReport, objFilter);
                } else if (String(oldVal).length >= 3) {
                    StockService.updateReport(stockReport);
                }
            }
            
            if ($scope.productFilter.text === '') {
                $scope.summarizer($scope.newStock.watchedQty, false);
            } else {
                $scope.summarizer($scope.newStock.watchedQty, true);
            }
        }

        // #####################################################################################################
        // Scope variables
        // #####################################################################################################

        $scope.selectedLevel = 1;
        $scope.selectedSession = 1;

        $scope.productFilter = {
            text : ''
        };

        // #####################################################################################################
        // Scope functions
        // #####################################################################################################

        $scope.clearFilter = function clearFilter() {
            $scope.productFilter.text = '';
        };

        $scope.toggleSession = function toggleSession(session) {
            if ($scope.productFilter.text === '') {
                for ( var ix in session.lines) {
                    var line = session.lines[ix];
                    line.hide = !line.hide;
                }
            }
        };

        $scope.toggleLine = function toggleLine(line) {
            if ($scope.productFilter.text === '') {
                for ( var ix in line.items) {
                    var item = line.items[ix];
                    item.hide = !item.hide;
                }
            }
        };

        $scope.showLevel = function showLevel(level) {
            // Disable watcher
            disableProductWatcher();
            // Clear filter
            $scope.clearFilter();
            // Enable watcher
            enableProductWatcher();

            switch (level) {
            case 1:
                setHideAttributes(stockReport.sessions, true, true);
                break;
            case 2:
                setHideAttributes(stockReport.sessions, false, true);
                break;
            case 3:
                setHideAttributes(stockReport.sessions, false, false);
                break;
            }

            $scope.selectedLevel = level;
        };
        
        $scope.confirm = function confirm(){
            var allProducts = InventoryKeeper.read();

            var ref = SyncDriver.refs.user.child('warmup');
            var entries = [];
            var items = angular.copy($scope.newStock.watchedQty);
            for (var idx in items) {
                if(items[idx] === 0){
                    continue;
                }

                var discount = $scope.newStock.discounts[idx];
                var cost = ArrayUtils.find(allProducts,'id', Number(idx)).price;
                var costWithDiscount = getCostWithDiscount(cost, discount);

                var entry = {
                    type : "stockAdd",
                    version : 1,
                    event : {
                        // $scope.newStock.watchedQty uses the product id as
                        // its index (see parts/warmu-up/warm-up-stock.html)
                        inventoryId : Number(idx),  
                        cost : costWithDiscount,
                        quantity : items[idx]
                    }
                };
                entries.push(entry);
            }

            StockWarmupService.updateStockWarmup(ref, entries).then(function () {
                return DialogService.messageDialog({
                    title : 'Estoque inicial',
                    message : 'Dados iniciais de estoque armazenados com sucesso!',
                    btnYes : 'Ok'
                });
            });
        };

        // #####################################################################################################
        // Watchers
        // #####################################################################################################
        $scope.$watchCollection('newStock.watchedQty', function (newObj) {
            if ($scope.filter.text === '') {
                $scope.summarizer(newObj, false);
            } else {
                $scope.summarizer(newObj, true);
            }
        });

        function enableProductWatcher() {
            currentProductWatcher = $scope.$watch('productFilter.text', productFilter);
        }

        function disableProductWatcher() {
            currentProductWatcher();
        }

        // #####################################################################################################
        // Controller warm up
        // #####################################################################################################

        // Enable watcher
        enableProductWatcher();
        $scope.showLevel(1);

        resetWatchedQty();
    }



    //////////////////////////////////////////////////////////
    //########################################################
    //////////////////////////////////////////////////////////
    angular.module('tnt.catalog.warmup.ctrl', [
        'tnt.catalog.sync.driver',
        'tnt.catalog.warmup.service'
    ])
        .controller(
            'WarmupCtrl',
            ['$scope', '$log', 'UserService', 'WarmupService', WarmupCtrl]
        )
        .controller(
            'BalanceWarmupCtrl',
            ['$scope', '$log', 'SyncDriver', 'DialogService', 'ArrayUtils', 'EntityService', 'BalanceWarmupService', BalanceWarmupCtrl]
        )
        .controller(
            'StockWarmupCtrl',
            ['$scope', '$log', 'SyncDriver', 'StockService', 'InventoryKeeper', 'ArrayUtils', 'StockWarmupService', 'DialogService', StockWarmupCtrl]
        );
}(angular));
