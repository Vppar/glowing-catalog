(function (angular) {
    'use strict';

    // ////////////////////////////////////////////////////////
    // ////////////////////////////////////////////////////////
    function WarmupCtrl($scope, $rootScope, $log, UserService, WarmupService, SyncDriver) {
        UserService.redirectIfInvalidUser();
        $log.debug('Initializing WarmupCtrl...');


        /////////////////////////////////////////////////////////////////////
        /// DATE WORK AROUND START ******************************************

        /* This is a work around for handling warmup creation data persistence.
         * Things that need to be fixed in a proper implementation:
         *  * creation date should be set in entries (for now, this date is not
         *    being used anywhere);
         *  * creation date should be updated together with
         *    {@code warmupRef.timestamp}, ensuring it is updated only when
         *    we are sure that the warmup data itself has been stored.
         */

        var date = {
            value: null,
            persist: function () {
                $log.debug('Persisting warmup creation date...', date);
                if (this.value) {
                    persistCreationTimestamp(this.value.getTime());
                }
            }
        };


        function listenRemoteCreationTimestampChanges() {
            if (SyncDriver.refs && SyncDriver.refs.user) {
                var ref = SyncDriver.refs.user.child('warmup').child('creationTimestamp');
                ref.on('value', function (snapshot) {
                    var val = snapshot.val();

                    if (val) {
                        date.value = new Date(val);
                        setLocalCreationTimestamp(val);
                    }
                });
            } else {
                var removeListener = $rootScope.$on('FirebaseConnected', function () {
                    listenRemoteCreationTimestampChanges();
                    removeListener();
                });
            }
        }


        function persistCreationTimestamp(creationTimestamp) {
            if (creationTimestamp) {
                var ref = SyncDriver.refs.user.child('warmup').child('creationTimestamp');
                ref.set(creationTimestamp);
                setLocalCreationTimestamp(creationTimestamp);
            }
        }


        function getLocalCreationTimestamp() {
            var creationTimestamp = localStorage.getItem('warmupCreationTimestamp');
            return creationTimestamp ? parseInt(creationTimestamp) : null;
        }


        function setLocalCreationTimestamp(creationTimestamp) {
            localStorage.setItem('warmupCreationTimestamp', creationTimestamp);
        }


        var creationTimestamp = getLocalCreationTimestamp();
        date.value = creationTimestamp ? new Date(creationTimestamp) : new Date();

        listenRemoteCreationTimestampChanges();

        /// ************************************************* DATE WORK AROUND END
        ////////////////////////////////////////////////////////////////////////////

        $scope.date = date;
    }

    /**
     * These controllers replace the old {@code BalanceWarmupCtrl}. If any of
     * the old functionality is required, check release v1.0.1 of the app, where
     * it was still implemented.
     *
     * @see https://github.com/Tunts/glowing-catalog/tree/1.0.1
     */

    function CheckWarmupCtrl($scope, $log, $element, $location, CheckWarmupService, DialogService, ArrayUtils, EntityService, SyncDriver) {
        $log.debug('Initializing CheckWarmupCtrl...');

        var initialData = null;
        var data = {};

        var items = CheckWarmupService.getItems();

        items.total = CheckWarmupService.getTotal(items);

        initialData = {
            uuid: null,
            customerName: null,
            customerId: null,
            bank: null,
            agency: null,
            account: null,
            number: null,
            duedate: null,
            amount: null,
            used: false,
            redeemed: false
        };

        function addItem(item) {
            items.push(item);
            items.total += item.amount;
        }

        function createItemFromData(data) {
            var item = {};
            angular.extend(item, initialData, data);
            return item;
        }

        function calculateTotal() {
            items.total = CheckWarmupService.getTotal(items);
            return items.total;
        }

        function resetData() {
            angular.extend(data, initialData);
        }

        function add(data) {
            var formIsValid = $scope.newWarmupCheckForm.$valid;
            var amountIsSet = !!data.amount;

            if (formIsValid && amountIsSet) {
                addItem(createItemFromData(data));
                // Clear the form
                resetData();
                $element.find('input').removeClass('ng-dirty').addClass('ng-pristine');
            } else {
                $element.find('input').removeClass('ng-pristine').addClass('ng-dirty');
                $log.debug('Warmup check form is not valid!', data);
                DialogService.messageDialog({
                    title: 'Cheque a receber',
                    message: 'Dados inválidos. Por favor, certifique-se de que todos os campos foram preenchidos e estejam corretos.',
                    btnYes: 'OK'
                });
            }
        }

        function remove(item) {
            if (!item.used && !item.redeemed) {
                var index = items.indexOf(item);
                var itemInItems = ~index;
                if (itemInItems) {
                    items.splice(index, 1);
                    items.total -= item.amount;

                    if (items.total < 0) {
                        $log.debug('Invalid warmup check total! Cannot be lower than zero.', item, items);
                        items.total = 0;
                    }
                }
            } else {
                DialogService.messageDialog({
                    title: 'Cheque a receber',
                    message: 'Este cheque já teve baixa declarada e não pode ser removido.',
                    btnYes: 'OK'
                });
            }
        }

        function save() {
            var ref = SyncDriver.refs.user.child('warmup');

            $scope.date.persist();

            $log.debug('Saving check warmup entries:', items);

            CheckWarmupService.saveItems(ref, items).then(function () {
                $log.debug('Check warmup entries saved.');
            });

            // We'll consider data to be saved once it's stored in localStorage
            // and count that it will be replicated in Firebase eventually,
            // that's why the message dialog is shown synchronously.
            return DialogService.messageDialog({
                title: 'Cheques a receber',
                message: 'Cheques a receber salvos com sucesso!',
                btnYes: 'OK'
            });
        }

        function cancel() {
            $location.path('/');
        }

        function openChooseCustomerDialog() {
            return DialogService.openDialogChooseCustomerNoRedirect().then(function (uuid) {
                if (uuid) {
                    var customer = ArrayUtils.find(EntityService.list(), 'uuid', uuid);
                    data.customerName = customer.name;
                    data.customerId = uuid;
                }
            });
        }

        resetData();

        $scope.data = data;
        $scope.items = items;

        $scope.add = add;
        $scope.remove = remove;
        $scope.save = save;
        $scope.cancel = cancel;

        $scope.chooseCustomer = openChooseCustomerDialog;
    }


    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    function CreditCardWarmupCtrl($scope, $log, $element, $location, CreditCardWarmupService, DialogService, ArrayUtils, EntityService, SyncDriver) {
        $log.debug('Initializing CreditCardWarmupCtrl...');

        var initialData = null;
        var data = {};

        var items = CreditCardWarmupService.getItems();

        items.total = CreditCardWarmupService.getTotal(items);

        initialData = {
            uuid: null,
            customerName: null,
            customerId: null,
            duedate: null,
            amount: null,
            installments: '1/1',
            used: false,
            redeemed: false
        };

        function addItem(item) {
            items.push(item);
            items.total += item.amount;
        }

        function createItemFromData(data) {
            var item = {};
            angular.extend(item, initialData, data);

            var installment = null;
            var numberOfInstallments = null;
            if (item.installments) {
                installment = item.installments.replace('-', '/');
                if (installment.indexOf('/') > -1) {
                    var splitedInstallments = installment.split('/');
                    installment = splitedInstallments[0];
                    numberOfInstallments = splitedInstallments[1];
                }
            }

            if (Number(installment) <= Number(numberOfInstallments)) {
                item.installments = installment;

                if (numberOfInstallments) {
                    item.installments += ' de ' + numberOfInstallments;
                }
            } else {
                item = null;
            }

            return item;
        }

        function calculateTotal() {
            items.total = CreditCardWarmupService.getTotal(items);
            return items.total;
        }

        function resetData() {
            angular.extend(data, initialData);
        }

        function add(data) {
            var formIsValid = $scope.newCreditCardWarmupForm.$valid;
            var amountIsSet = !!data.amount;
            var itemFromData = createItemFromData(data);
            if (formIsValid && amountIsSet && itemFromData) {
                addItem(itemFromData);
                // Clear the form
                resetData();
                $element.find('input').removeClass('ng-dirty').addClass('ng-pristine');
            } else {

                if (!itemFromData) {
                    data.installments = '';
                }

                $element.find('input').removeClass('ng-pristine').addClass('ng-dirty');
                $log.debug('Warmup credit card form is not valid!', data);
                DialogService.messageDialog({
                    title: 'Contas a receber (Cartões)',
                    message: 'Dados inválidos. Por favor, certifique-se de que todos os campos foram preenchidos e estejam corretos.',
                    btnYes: 'OK'
                });
            }
        }

        function remove(item) {
            if (!item.used && !item.redeemed) {
                var index = items.indexOf(item);
                var itemInItems = ~index;
                if (itemInItems) {
                    items.splice(index, 1);
                    items.total -= item.amount;

                    if (items.total < 0) {
                        $log.debug('Invalid warmup credit card total! Cannot be lower than zero.', item, items);
                        items.total = 0;
                    }
                }
            } else {
                DialogService.messageDialog({
                    title: 'Contas a receber (Cartões)',
                    message: 'Esta conta (cartão) já teve baixa declarada e não pode ser removida.',
                    btnYes: 'OK'
                });
            }
        }


        function save() {
            var ref = SyncDriver.refs.user.child('warmup');

            $scope.date.persist();

            $log.debug('Saving credit card warmup entries:', items);

            CreditCardWarmupService.saveItems(ref, items).then(function () {
                $log.debug('CreditCard warmup entries saved.');
            });

            // We'll consider data to be saved once it's stored in localStorage
            // and count that it will be replicated in Firebase eventually,
            // that's why the message dialog is shown synchronously.
            return DialogService.messageDialog({
                title: 'Contas a receber (Cartões)',
                message: 'Contas a receber (Cartões) salvas com sucesso!',
                btnYes: 'OK'
            });
        }

        function cancel() {
            $location.path('/');
        }

        function openChooseCustomerDialog() {
            return DialogService.openDialogChooseCustomerNoRedirect().then(function (uuid) {
                if (uuid) {
                    var customer = ArrayUtils.find(EntityService.list(), 'uuid', uuid);
                    data.customerName = customer.name;
                    data.customerId = uuid;
                }
            });
        }

        resetData();

        $scope.data = data;
        $scope.items = items;

        $scope.add = add;
        $scope.remove = remove;
        $scope.save = save;
        $scope.cancel = cancel;

        $scope.chooseCustomer = openChooseCustomerDialog;

        $scope.installmentsRegex = /^[1-9][0-9]{0,1}((\/|\-| de )[1-9][0-9]{0,1}){1}$/;
    } // CreditCardWarmupCtrl


    //////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////
    function OnCuffWarmupCtrl($scope, $log, $element, $location, OnCuffWarmupService, DialogService, ArrayUtils, EntityService, SyncDriver) {
        $log.debug('Initializing OnCuffWarmupCtrl...');

        var initialData = null;
        var data = {};

        var items = OnCuffWarmupService.getItems();

        items.total = OnCuffWarmupService.getTotal(items);

        initialData = {
            uuid: null,
            customerName: null,
            customerId: null,
            duedate: null,
            amount: null,
            installments: '1/1',
            used: false,
            redeemed: false
        };

        function addItem(item) {
            items.push(item);
            items.total += item.amount;
        }

        function createItemFromData(data) {
            var item = {};
            angular.extend(item, initialData, data);

            var installment = null;
            var numberOfInstallments = null;
            if (item.installments) {
                installment = item.installments.replace('-', '/');
                if (installment.indexOf('/') > -1) {
                    var splitedInstallments = installment.split('/');
                    installment = splitedInstallments[0];
                    numberOfInstallments = splitedInstallments[1];
                }
            }

            if (Number(installment) <= Number(numberOfInstallments)) {
                item.installments = installment;

                if (numberOfInstallments) {
                    item.installments += ' de ' + numberOfInstallments;
                }
            } else {
                item = null;
            }

            return item;
        }

        function calculateTotal() {
            items.total = OnCuffWarmupService.getTotal(items);
            return items.total;
        }

        function resetData() {
            angular.extend(data, initialData);
        }

        function add(data) {
            var formIsValid = $scope.newOnCuffWarmupForm.$valid;
            var amountIsSet = !!data.amount;
            var itemFromData = createItemFromData(data);
            if (formIsValid && amountIsSet && itemFromData) {
                addItem(itemFromData);
                // Clear the form
                resetData();
                $element.find('input').removeClass('ng-dirty').addClass('ng-pristine');
            } else {
                if (!itemFromData) {
                    data.installments = '';
                }

                $element.find('input').removeClass('ng-pristine').addClass('ng-dirty');
                $log.debug('Warmup oncuff form is not valid!', data);
                DialogService.messageDialog({
                    title: 'Contas a receber (Diversas)',
                    message: 'Dados inválidos. Por favor, certifique-se de que todos os campos foram preenchidos e estejam corretos.',
                    btnYes: 'OK'
                });
            }
        }

        function remove(item) {
            if (!item.used && !item.redeemed) {
                var index = items.indexOf(item);
                var itemInItems = ~index;
                if (itemInItems) {
                    items.splice(index, 1);
                    items.total -= item.amount;

                    if (items.total < 0) {
                        $log.debug('Invalid warmup oncuff total! Cannot be lower than zero.', item, items);
                        items.total = 0;
                    }
                }
            } else {
                DialogService.messageDialog({
                    title: 'Contas a receber (Diversas)',
                    message: 'Esta conta já teve baixa declarada e não pode ser removida.',
                    btnYes: 'OK'
                });
            }
        }

        function save() {
            var ref = SyncDriver.refs.user.child('warmup');

            $scope.date.persist();

            $log.debug('Saving oncuff warmup entries:', items);

            OnCuffWarmupService.saveItems(ref, items).then(function () {
                $log.debug('OnCuff warmup entries saved.');
            });

            // We'll consider data to be saved once it's stored in localStorage
            // and count that it will be replicated in Firebase eventually,
            // that's why the message dialog is shown synchronously.
            DialogService.messageDialog({
                title: 'Contas a receber (Diversas)',
                message: 'Contas a receber (Diversas) salvas com sucesso!',
                btnYes: 'OK'
            });
        }

        function cancel() {
            $location.path('/');
        }

        function openChooseCustomerDialog() {
            return DialogService.openDialogChooseCustomerNoRedirect().then(function (uuid) {
                if (uuid) {
                    var customer = ArrayUtils.find(EntityService.list(), 'uuid', uuid);
                    data.customerName = customer.name;
                    data.customerId = uuid;
                }
            });
        }

        resetData();

        $scope.data = data;
        $scope.items = items;

        $scope.add = add;
        $scope.remove = remove;
        $scope.save = save;
        $scope.cancel = cancel;

        $scope.chooseCustomer = openChooseCustomerDialog;

        $scope.installmentsRegex = /^[1-9][0-9]{0,1}((\/|\-| de )[1-9][0-9]{0,1}){1}$/;
    } // OnCuffWarmupCtrl

    // ///////////////////////////////////////////////////////////////////////////////////////////////
    // ###############################################################################################
    // ###############################################################################################
    // ///////////////////////////////////////////////////////////////////////////////////////////////

    // /////////////////////////////////////////////////////////
    function StockWarmupCtrl($scope, $q, $log, SyncDriver, StockService, InventoryKeeper, ArrayUtils, StockWarmupService, DialogService) {
        // FIXME Revise this controller, verify if there is dead code or
        // unnecessary variables

        $log.debug('Initializing StockWarmupCtrl...');

        // #####################################################################################################
        // Local Functions
        // #####################################################################################################
        function resetWatchedQty() {
            for (var ix in $scope.main.stockReport.sessions) {
                // sessions
                var session = $scope.main.stockReport.sessions[ix];
                // lines of that session
                for (var ix2 in session.lines) {
                    // lines
                    var line = session.lines[ix2];
                    // items of that line
                    for (var ix3 in line.items) {
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

        // from principal!!!
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
            text: ''
        };
        $scope.main = {};
        $scope.main.stockReport = StockService.stockReport('all');

        /**
         * Method to summarize the products from the list
         *
         * @param pickerArray - List with the value of the selector from the
         *            html
         *
         * @param hide - boolean used to determine if the filter will consider
         *            the hide attribute on the items.
         *
         */
        $scope.summarizer =
            function (pickerArray, hide) {
                var diff = {
                    amount: 0,
                    points: 0
                };

                $scope.summary.total.sessions = {};

                for (var ix in pickerArray) {

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
                            total: 0,
                            minQty: 0,
                            orderQty: 0,
                            avg: 0,
                            pts: 0,
                            lines: {}
                        };
                    }
                    if (!$scope.summary.total.sessions[session].lines[line]) {
                        $scope.summary.total.sessions[session].lines[line] = {
                            total: 0,
                            minQty: 0,
                            orderQty: 0,
                            avg: 0,
                            pts: 0
                        };
                    }

                    // sum of the price per line and session
                    if ((pickerArray[ix] * price) > 0 && itemHide === false) {
                        $scope.summary.total.sessions[session].total += (pickerArray[ix] * price);
                        $scope.summary.total.sessions[session].lines[line].total += (pickerArray[ix] * price);
                    }
                    // sum of the minQty per line and session
                    if (minQty && itemHide === false) {
                        $scope.summary.total.sessions[session].minQty += minQty;
                        $scope.summary.total.sessions[session].lines[line].minQty += minQty;
                    }
                    // sum of the actual selected qty per line and
                    // session
                    if (qty > 0 && itemHide === false) {
                        $scope.summary.total.sessions[session].orderQty += qty;
                        $scope.summary.total.sessions[session].lines[line].orderQty += qty;
                    }
                    // sum of the points per line and session
                    if (qty > 0 && itemHide === false) {
                        $scope.summary.total.sessions[session].pts += (pickerArray[ix] * points);
                        $scope.summary.total.sessions[session].lines[line].pts += (pickerArray[ix] * points);
                    }
                }

                // the total overall
                $scope.summary.total.amount = diff.amount;
                $scope.summary.total.points = diff.points;

                // calculate the average value.
                for (var ix1 in $scope.summary.total.sessions) {
                    if ($scope.summary.total.sessions[ix1].orderQty > 0) {
                        $scope.summary.total.sessions[ix1].avg =
                            ($scope.summary.total.sessions[ix1].total) / ($scope.summary.total.sessions[ix1].orderQty);
                    }
                    for (var ix2 in $scope.summary.total.sessions[ix1].lines) {
                        if ($scope.summary.total.sessions[ix1].lines[ix2].orderQty > 0) {
                            $scope.summary.total.sessions[ix1].lines[ix2].avg =
                                ($scope.summary.total.sessions[ix1].lines[ix2].total) /
                                ($scope.summary.total.sessions[ix1].lines[ix2].orderQty);
                        }
                    }
                }
            };

        // end from principal

        var stockReport = $scope.main.stockReport;
        var currentProductWatcher = {};

        // #####################################################################################################
        // Local Functions
        // #####################################################################################################

        function setHideAttributes(sessions, hideLine, hideProduct) {
            for (var ix in sessions) {
                var session = sessions[ix];
                session.hide = false;
                for (var ix2 in session.lines) {
                    var line = session.lines[ix2];
                    line.hide = hideLine;
                    for (var ix3 in line.items) {
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
                        title: myTextFilter,
                        SKU: myTextFilter
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
            text: ''
        };

        // #####################################################################################################
        // Scope functions
        // #####################################################################################################

        $scope.clearFilter = function clearFilter() {
            $scope.productFilter.text = '';
        };

        $scope.toggleSession = function toggleSession(session) {
            if ($scope.productFilter.text === '') {
                for (var ix in session.lines) {
                    var line = session.lines[ix];
                    line.hide = !line.hide;
                }
            }
        };

        $scope.toggleLine = function toggleLine(line) {
            if ($scope.productFilter.text === '') {
                for (var ix in line.items) {
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

        $scope.confirm = function confirm() {
            var allProducts = InventoryKeeper.read();

            var ref = SyncDriver.refs.user.child('warmup');
            var entries = [];
            var items = angular.copy($scope.newStock.watchedQty);
            for (var idx in items) {
                if (items[idx] === 0) {
                    continue;
                }

                var discount = $scope.newStock.discounts[idx];
                var cost = ArrayUtils.find(allProducts, 'id', Number(idx)).price;
                var costWithDiscount = getCostWithDiscount(cost, discount);

                var entry = {
                    type: "stockAdd",
                    version: 1,
                    event: {
                        // $scope.newStock.watchedQty uses the product id as
                        // its index (see parts/warmu-up/warm-up-stock.html)
                        inventoryId: Number(idx),
                        cost: costWithDiscount,
                        quantity: items[idx]
                    }
                };
                entries.push(entry);
            }

            $scope.date.persist();

            return StockWarmupService.updateStockWarmup(ref, entries).then(function () {
                return DialogService.messageDialog({
                    title: 'Pronta Entrega',
                    message: 'Saldo inicial gravado com sucesso!',
                    btnYes: 'Ok'
                });
            }, function (err) {
                var errResult = null;
                if (err && err === 'timeout') {
                    errResult = DialogService.messageDialog({
                        title: 'Pronta Entrega',
                        message: 'Saldo inicial gravado com sucesso!',
                        btnYes: 'Ok'});
                } else {
                    errResult = $q.reject(err);
                }
                return errResult;
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

    // ////////////////////////////////////////////////////////
    // ########################################################
    // ////////////////////////////////////////////////////////
    angular.module('tnt.catalog.warmup.ctrl', [
        'tnt.catalog.sync.driver', 'tnt.catalog.warmup.service', 'tnt.catalog.service.dialog'
    ]).controller('WarmupCtrl', [
        '$scope', '$rootScope', '$log', 'UserService', 'WarmupService', 'SyncDriver', WarmupCtrl
    ]).controller(
        'OnCuffWarmupCtrl',
        [
            '$scope', '$log', '$element', '$location', 'OnCuffWarmupService', 'DialogService', 'ArrayUtils', 'EntityService',
            'SyncDriver', OnCuffWarmupCtrl
        ]).controller(
        'CreditCardWarmupCtrl',
        [
            '$scope', '$log', '$element', '$location', 'CreditCardWarmupService', 'DialogService', 'ArrayUtils', 'EntityService',
            'SyncDriver', CreditCardWarmupCtrl
        ]).controller(
        'CheckWarmupCtrl',
        [
            '$scope', '$log', '$element', '$location', 'CheckWarmupService', 'DialogService', 'ArrayUtils', 'EntityService',
            'SyncDriver', CheckWarmupCtrl
        ]).controller(
        'StockWarmupCtrl',
        [
            '$scope', '$q', '$log', 'SyncDriver', 'StockService', 'InventoryKeeper', 'ArrayUtils', 'StockWarmupService', 'DialogService',
            StockWarmupCtrl
        ]);
})(angular);
