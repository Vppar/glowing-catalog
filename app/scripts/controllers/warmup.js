(function(angular) {
    'use strict';

    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    function WarmupCtrl($scope, $log, UserService, WarmupService) {
        UserService.redirectIfIsNotLoggedIn();
        $log.debug('Initializing WarmupCtrl...');
    }


    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    function BalanceWarmupCtrl($scope, $log, SyncDriver, DialogService, ArrayUtils, EntityService, BalanceWarmupService) {
        $log.debug('Initializing BalanceWarmupCtrl...');

        var balance = {};
        var check = {};
        var checkingAccount = {};


        balance.total = 0;
        balance.date = null;

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
            openChooseCustomerDialog : function () {
                DialogService.openDialogChooseCustomerNoRedirect().then(function (uuid) {
                    if (uuid) {
                        var customer = ArrayUtils.find(EntityService.list(), 'uuid', uuid);
                        check.clientName = customer.name;
                        check.entityId = uuid;
                    }
                })
            }
        };
        

        balance.check = {
            total : BalanceWarmupService.check.getTotal(),
            items : BalanceWarmupService.check.getItems(),

            addItem : function () {
                var item = {};
                ObjectUtils.dataCopy(item, check);
                this.items.push(item);
                $log.debug('Adding check item', item);
                this.reset();
            },

            removeItem : function (item) {
                console.log('Removing check item', item);
                var idx = this.items.indexOf(item);
                if (~idx) {
                    this.items.splice(idx, 1);
                }
            },

            reset : function () {
                check.bank = null;
                check.agency = null;
                check.account = null;
                check.clientName = null;
                check.entityId = null;
                check.number = null;
                check.amount = 0;
            }
        };


        checkingAccount = {
            bank : null,
            agency : null,
            account : null,
            balance : 0
        };

        balance.checkingAccount = {
            
            total : BalanceWarmupService.checkingAccount.getTotal(),
            items : BalanceWarmupService.checkingAccount.getItems(),

            hasAvailableBook : BalanceWarmupService.checkingAccount.hasAvailableBook(),

            addItem : function () {
                var item = {};
                ObjectUtils.dataCopy(item, checkingAccount);
                item.access = BalanceWarmupService.checkingAccount.getAvailableBook();
                BalanceWarmupService.checkingAccount.takeBook(item.access);
                this.items.push(item);
                $log.debug('Added checkingAccount item', item);
                this.reset();
            },

            removeItem : function (item) {
                // MUST check if the book has no entries before allowing it to be
                // removed
                $log.debug('Removing check item', item);
                var idx = this.items.indexOf(item);
                if (~idx) {
                    // FIXME check if the item has entries
                    this.items.splice(idx, 1);
                    BalanceWarmupService.checkingAccount.freeBook(item.access);
                }
            },

            reset : function () {
                checkingAccount.bank = null;
                checkingAccount.agency = null;
                checkingAccount.account = null;
                checkingAccount.balance = 0;
            }
        };


        balance.confirm = function () {
            $log.debug('Warmup balance confirmed');
            var ref = SyncDriver.refs.user.child('warmup');
            var cash = balance.cash.item;
            var check = balance.check.items;
            var checkingAccount = balance.checkingAccount.items;

            if (balance.date && balance.date.getTime) {
                for (var idx in check) {
                    check[idx].created = balance.date.getTime();
                }
            }

            return BalanceWarmupService.updateBalanceWarmup(ref, cash, check, checkingAccount);
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
            balance.checkingAccount.hasAvailableBook = BalanceWarmupService.checkingAccount.hasAvailableBook();
        }





        $scope.$watchCollection('balance.checkingAccount.items', updateCheckingAccountTotal);
        $scope.$watchCollection('balance.checkingAccount.items', checkAvailableBooks);
        $scope.$watchCollection('balance.check.items', updateCheckTotal);

        $scope.$watch('balance.cash.total', updateBalanceTotal);
        $scope.$watch('balance.check.total', updateBalanceTotal);
        $scope.$watch('balance.checkingAccount.total', updateBalanceTotal);
    }




    ///////////////////////////////////////////////////////////
    function StockWarmupCtrl($scope, $log, SyncDriver, StockService, InventoryKeeper, ArrayUtils, StockWarmupService) {
        //FIXME Revise this controller, verify if there is dead code or unnecessary variables
        

        $log.debug('Initializing StockWarmupCtrl...');

        var allProducts = InventoryKeeper.read();
        
        // #####################################################################################################
        // Local Functions
        // #####################################################################################################

        //from principal!!!
        /**
         * Summary tab
         */
        $scope.summary = {};
        $scope.summary.total = {};

        $scope.newStock = {};
        $scope.newStock.items = {};
        $scope.newStock.watchedQty = {};
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
            var products = [];
            var items = angular.copy($scope.newStock.watchedQty);
            for (var idx in items) {
                if(items[idx] === 0){
                    continue;
                }
                var entry = {
                    "type": "stockAdd",
                    "version": 1,
                    "event": {
                        "inventoryId": Number(idx),  
                        "cost": ArrayUtils.find(allProducts,'id', Number(idx)).price,
                        "quantity": items[idx]
                    }
                };
                products.push(entry);
            }
            //FIXME Remove log when integrate with service
            console.log(products);
        };

        // #####################################################################################################
        // Watchers
        // #####################################################################################################

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
            ['$scope', '$log', 'SyncDriver', 'StockService', 'InventoryKeeper', 'ArrayUtils', 'StockWarmupService', StockWarmupCtrl]
        );
}(angular));
