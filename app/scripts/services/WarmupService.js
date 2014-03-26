(function (angular) {
    'use strict';

    function WarmupService($q, $log, $rootScope) {
        var self = this;

        var local = {};
        this.local = local;


        this.getLocalData = function () {
            var warmup = localStorage.getItem('warmup');
            return warmup ? JSON.parse(warmup) : {};
        };


        this.setLocalData = function (timestamp, data) {
            var warmup = {
                timestamp : timestamp,
                data : data
            };

            localStorage.setItem('warmup', JSON.stringify(warmup));
            
            local.timestamp = timestamp;
            local.data = data;

            $log.debug('Local warmup data set');
            $rootScope.$broadcast('LocalWarmupDataSet');
        };


        this.updateLocalData = function (ref, timestamp) {
            var deferred = $q.defer();

            ref.child('data')
                .child(timestamp)
                .once('value', function (snapshot) {
                    var data = snapshot.val();

                    if (data) {
                        $log.debug('Local data updated');
                        self.setLocalData(timestamp, data);
                        deferred.resolve(timestamp);
                        $rootScope.$broadcast('LocalWarmupDataUpdated');
                    } else {
                        $log.fatal('Warmup data not found', timestamp);
                        deferred.reject('Warmup data not found');
                    }
                });

            return deferred.promise;
        };


        this.setRemoteData = function (ref, timestamp, data) {
            var deferred = $q.defer();

            ref.child('data')
                .child(timestamp)
                .transaction(function (currentValue) {
                    // If there's already data stored for the given timestamp,
                    // it MUST NOT be overriden!
                    if (!currentValue) {
                        return {
                            // Firebase objects are ordered by priority, from
                            // the lowest to the highest, therefore we need to
                            // invert the timestamp value before using it as
                            // the priority to make them be ordered from the
                            // newest to the oldest.
                            '.priority' : timestamp * -1,
                            '.value' : data
                        };
                    }
                }, function (err, committed) {
                    if (err) {
                        $log.error('Unable to update remote data!', err);
                        deferred.reject(err);
                    } else if (!committed) {
                        $log.error('Data already exists for the given timestamp!', timestamp);
                        deferred.reject('Data already exists for the given timestamp');
                    } else {
                        $log.debug('Remote warmup data successfully stored');
                        deferred.resolve(timestamp);
                    }
                });

            return deferred.promise;
        };


        this.setRemoteTimestamp = function (ref, timestamp) {
            var deferred = $q.defer();

            ref.child('timestamp')
                .transaction(function (remoteTimestamp) {
                    if (!remoteTimestamp || remoteTimestamp < timestamp) {
                        return timestamp;
                    }
                }, function (err, committed, snapshot) {
                    if (err) {
                        $log.error('Unable to update remote timestamp!', err);
                        deferred.reject(err);
                    } else if (!committed) {
                        var remoteTimestamp = snapshot.val();
                        if (remoteTimestamp > timestamp) {
                            $log.debug('Remote timestamp is newer than the one being stored.');
                            deferred.reject('Remote timestamp is newer', remoteTimestamp, timestamp);
                        } else {
                            $log.debug('Remote timestamp already up-to-date.');
                            deferred.resolve(timestamp);
                        }
                    } else {
                        $log.debug('Remote timestamp updated!');
                        deferred.resolve(timestamp);
                        $rootScope.$broadcast('RemoteWarmupDataUpdated');
                    }
                });

            return deferred.promise;
        };


        this.updateRemoteData = function (ref, timestamp, data) {
            if (!ref) {
                $log.error('Missing reference to remote location');
                return $q.reject('Missing reference to remote location');
            }

            if (!timestamp && timestamp !== 0) {
                $log.error('Missing timestamp');
                return $q.reject('Missing timestamp');
            }

            // Remote data is updated in a two-step process:
            // 1. add the updated data to the data object, using the
            //    timestamp as its key;
            // 2. set the timestamp value, indicating which warmup
            //    data object is the current one;
            return self.setRemoteData(ref, timestamp, data)
                .then(function () {
                    return self.setRemoteTimestamp(ref, timestamp)
                        .then(function () {
                            $rootScope.$broadcast('RemoteWarmupDataUpdated', timestamp, data);
                        });
                });
        };



        this.watchRemoteData = (function () {
            function _setRemoteTimestampListener(ref) {
                ref.child('timestamp')
                    .on('value', function (snapshot) {
                        var remoteTimestamp = snapshot.val();

                        var hasRemoteData = remoteTimestamp || remoteTimestamp === 0;
                        var hasLocalData = local.timestamp || local.timestamp === 0;

                        var remoteDataIsNewer = hasRemoteData && (!hasLocalData || remoteTimestamp > local.timestamp);
                        var localDataIsNewer = hasLocalData && (!hasRemoteData || remoteTimestamp < local.timestamp);

                        if (remoteDataIsNewer) {
                            self.updateLocalData(ref, remoteTimestamp);
                        } else if (localDataIsNewer) {
                            self.setRemoteData(ref, local.timestamp, local.data);
                        }
                    });
            }


            function _watchRemoteData(ref) {
                if (!ref) {
                    $log.error('Missing reference to remote data');
                    return;
                }

                _setRemoteTimestampListener(ref);
            }

            return _watchRemoteData;
        })();


        this.updateWarmup = function (warmupRef, data) {
            var timestamp = new Date().getTime();
            self.setLocalData(timestamp, data);
            return self.updateRemoteData(warmupRef, timestamp, data);
        };


        /////////////////////////////////////////////////////////////
        // WarmupService initialization
        /////////////////////////////////////////////////////////////

        // Update the data in our local object
        angular.extend(local, this.getLocalData());
    }




    /////////////////////////////////////////////////////////////////////
    //###################################################################
    /////////////////////////////////////////////////////////////////////
    function CheckWarmupService($q, $log, $rootScope, ArrayUtils, EntityService, IdentityService, WarmupService) {
        var local = WarmupService.local;


        function getItems() {
            var entries = getEntries();
            var items = [];

            for (var idx in entries) {
                var entry = entries[idx];
                items.push(createItem(entry));
            }

            return items;
        }


        function getEntries() {
            var entries = local.data || [];
            var checkEntries = [];

            for (var idx in entries) {
                var entry = entries[idx];
                if (
                    entry.type === 'receivableAdd' &&
                    entry.event.type === 'check'
                ) {
                    checkEntries.push(entry);
                }
            }

            return checkEntries;
        }


        function getOtherEntries() {
            var entries = local.data || [];
            var checkEntries = [];

            for (var idx in entries) {
                var entry = entries[idx];
                if (
                    entry.type !== 'receivableAdd' ||
                    (entry.event && entry.event.type !== 'check')
                ) {
                    checkEntries.push(entry);
                }
            }

            return checkEntries;
        }


        function createEntry(item, idx) {
            // Convert to a timestamp if needed
            var duedate = item.duedate && item.duedate.getTime ? item.duedate.getTime() : item.duedate;

            var payment = {
                id : null,
                account : item.account,
                agency : item.agency,
                bank : item.bank,
                amount : item.amount,
                dueDate : duedate,
                number : item.number,
                type : 'check'
            };

            var event = {
                // When generating the UUID:
                // 0 is an arbitrary deviceId used in warmup entries
                // 1 is the CoinKeeper's op for generating UUIDs
                uuid : item.uuid || IdentityService.internalGetUUID(0, 1, idx),
                type : 'check',
                duedate : duedate,
                entityId : item.customerId,
                amount : item.amount,
                created : item.created || null,
                payment : payment
            };

            var entry = {
                uuid : null,
                type : 'receivableAdd',
                version : 1,
                event : event
            };

            return entry;
        }


        function createItem(entry) {
            var item = {};

            var event = entry.event;
            var payment = event.payment;

            var customer = ArrayUtils.find(EntityService.list(), 'uuid', event.entityId);

            if (!customer) {
                $log.error('Missing customer for warmup entry!', entry);
            }

            angular.extend(item, {
                uuid : event.uuid,
                bank : event.payment.bank,
                agency : payment.agency,
                account : payment.account,
                duedate : event.duedate ? new Date(event.duedate) : null,
                amount : event.amount,
                number : payment.number,
                customerName : customer && customer.name,
                customerId : event.entityId,
                used : isUsed(event),
                redeemed : isRedeemed(event)
            });

            return item;
        }


        function isUsed(event) {
            // TODO
            return true;
        }


        function isRedeemed(event) {
            // TODO
            return true;
        }


        function createEntries(items) {
            $log.debug('Creating warmup entries for check', items);
            var entries = [];

            for (var idx in items) {
                var item = items[idx];
                if (typeof item === 'object') {
                    entries.push(createEntry(item, idx));
                }
            }

            return entries;
        }


        function getTotal(items) {
            if (!items) { return 0; }

            var total = 0;

            for (var idx in items) {
                total += items[idx].amount;
            }

            return total;
        }


        function saveItems(warmupRef, items) {
            var entries = createEntries(items);
            var otherEntries = getOtherEntries();
            var data = [].concat(entries, otherEntries);
            return WarmupService.updateWarmup(warmupRef, data);
        }


        this.getEntries = getEntries;
        this.getItems = getItems;
        this.getTotal = getTotal;
        this.saveItems = saveItems;
    }


    function CreditCardWarmupService() {
    }


    function OtherReceivablesWarmupService() {
    }



    /////////////////////////////////////////////////////////////////////
    //###################################################################
    /////////////////////////////////////////////////////////////////////
    function BalanceWarmupService($q, $log, $rootScope, WarmupService, ArrayUtils, EntityService, IdentityService) {
        var local = WarmupService.local;

        ///////////////////////////////////////////////////
        this.cash = {
            getTotal : function () {
                var entry = this.getEntry();
                return entry ? entry.event.balance : 0;
            },

            getItem : function () {
                var entry = this.getEntry();
                var item = {
                    balance : 0
                };

                if (entry) {
                    var event = entry.event;
                    item.uuid = event.uuid;
                    item.balance = event.balance;
                }

                return item;
            },

            getEntry : function () {
                var entries = local.data || [];

                for (var idx in entries) {
                    var entry = entries[idx];
                    // FIXME set type
                    if (entry.type === 'addBook' && entry.event.access === 11111) {
                        return entry;
                    }
                }

                return null;
            },

            createEntry : function (item) {
                $log.debug('Creating warmup entry for cash', item);
                // TODO
                return {
                    type : 'addBook',
                    version : 1,
                    event : {
                        // When generating the UUID:
                        // 0 is an arbitrary deviceId used in warmup entries
                        // 8 is the BookKeeper's op for generating UUIDs
                        // We'll use the access number for "caixa" (11111) as Id, as it
                        // shoud be unique across books
                        uuid : item.uuid || IdentityService.internalGetUUID(0, 8, 11111),
                        access : 11111,
                        name : 11111,
                        type : 'synthetic',
                        nature : 'debit',
                        balance : item.balance || 0
                    }
                };
            }
        };



        ///////////////////////////////////////////////////
        this.check = {
            isUsed : function (receivable) {
                // TODO
                return true;
            },

            getTotal : function () {
                var items = this.getItems();
                var total = 0;
                
                for (var idx in items) {
                    total += items[idx].amount;
                }

                return total;
            },

            getItems : function () {
                var entries = this.getEntries();
                var items = [];

                for (var idx in entries) {
                    var entry = entries[idx];
                    var event = entry.event;
                    var customer = ArrayUtils.find(EntityService.list(), 'uuid', event.entityId);

                    if (!customer) {
                        $log.error('Missing customer for warmup entry!', entry);
                    }

                    var item = {
                        uuid : event.uuid,
                        bank : event.payment.bank,
                        agency : event.payment.agency,
                        account : event.payment.account,
                        duedate : event.duedate ? new Date(event.duedate) : null,
                        amount : event.amount,
                        number : event.payment.number,
                        clientName : customer && customer.name,
                        entityId : event.entityId,
                        used : this.isUsed(event)
                    };

                    items.push(item);
                }

                return items;
            },

            getEntries : function () {
                var entries = local.data || [];
                var checkEntries = [];

                for (var idx in entries) {
                    var entry = entries[idx];
                    if (entry.type === 'receivableAdd') {
                        checkEntries.push(entry);
                    }
                }

                return checkEntries;
            },

            createEntries : function (items) {
                $log.debug('Creating warmup entries for check', items);
                var entries = [];
                for (var idx in items) {
                    var item = items[idx];
                    var duedate = item.duedate && item.duedate.getTime ? item.duedate.getTime() : item.duedate;
                    entries.push({
                        uuid : null,
                        type : 'receivableAdd',
                        version : 1,
                        event : {
                            // When generating the UUID:
                            // 0 is an arbitrary deviceId used in warmup entries
                            // 1 is the CoinKeeper's op for generating UUIDs
                            uuid : item.uuid || IdentityService.internalGetUUID(0, 1, idx),
                            type : 'check',
                            duedate : duedate,
                            entityId : item.entityId,
                            amount : item.amount,
                            created : item.created || null,
                            payment : {
                                id : null,
                                account : item.account,
                                agency : item.agency,
                                bank : item.bank,
                                amount : item.amount,
                                dueDate : duedate,
                                number : item.number,
                                type : 'check'
                            }
                        }
                    });
                }

                return entries;
            }
        };





        ///////////////////////////////////////////////////
        this.checkingAccount = {
            book : (function () {
                var AVAILABLE_BOOKS = [
                    11131, 11132, 11133, 11134, 11135, 11136, 11137, 11138, 11139
                ];

                var books = {};

                // Set initial status for the access number...
                for (var idx in AVAILABLE_BOOKS) {
                    var access = AVAILABLE_BOOKS[idx];
                    books[access] = false;
                }

                function isTaken(access) {
                    return books[access];
                }

                function take(access) {
                    books[access] = true;
                }

                function untake(access) {
                    books[access] = false;
                }

                function exists(access) {
                    access = parseInt(access);
                    return !!access && !!~AVAILABLE_BOOKS.indexOf(access);
                }

                function hasAvailable() {
                    return !!nextAvailable();
                }

                function nextAvailable() {
                    for (var idx in books) {
                        if (!books[idx]) {
                            return idx;
                        }
                    }

                    return null;
                }

                function getAvailable() {
                    var access = nextAvailable();
                    if (access) {
                        take(access);
                    }
                    return access;
                }


                return {
                    exists : exists,
                    isTaken : isTaken,
                    take : take,
                    untake : untake,
                    hasAvailable : hasAvailable,
                    nextAvailable : nextAvailable,
                    getAvailable : getAvailable
                };
            })(),

            isUsed : function (book) {
                // TODO
                return true;
            },


            getTotal : function () {
                var items = this.getItems();
                var total = 0;
                
                for (var idx in items) {
                    total += items[idx].balance;
                }

                return total;
            },

            getItems : function () {
                var entries = this.getEntries();
                var items = [];

                for (var idx in entries) {
                    var entry = entries[idx];
                    var event = entry.event;
                    var accountData = this.getDataFromBookName(event.name);
                    var item = {
                        uuid : event.uuid,
                        access : event.access,
                        bank : accountData.bank,
                        agency : accountData.agency,
                        account : accountData.account,
                        balance : event.balance,
                        used : this.isUsed(event)
                    };
                    items.push(item);
                }

                $log.debug('Existing warmup checking account items', items);
                return items;
            },

            getEntries : function () {
                var entries = local.data || [];
                var checkingAccountEntries = [];

                for (var idx in entries) {
                    var entry = entries[idx];
                    if (
                        entry.type === 'addBook' &&
                        this.book.exists(entry.event.access)
                    ) {
                        this.book.take(entry.event.access);
                        checkingAccountEntries.push(entry);
                    }
                }

                return checkingAccountEntries;
            },

            createEntries : function (items) {
                $log.debug('Creating warmup entries for checkingAccounts', items);
                var entries = [];
                for (var idx in items) {
                    var item = items[idx];
                    var bookName = this.getBookName(item.bank, item.agency, item.account);

                    entries.push({
                        type : 'addBook',
                        version : 1,
                        event : {
                            // When generating the UUID:
                            // 0 is an arbitrary deviceId used in warmup entries
                            // 8 is the BookKeeper's op for generating UUIDs
                            // We'll use the item.access number as Id, as it shoud
                            // be unique across books
                            uuid : item.uuid || IdentityService.internalGetUUID(0, 8, item.access),
                            access : item.access,
                            name : bookName,
                            type : 'synthetic',
                            nature : 'debit',
                            balance : item.balance || 0,
                        }
                    });
                }

                return entries;
            },

            getBookName : function (bank, agency, account) {
                return '' + bank + ' Ag' + agency + ' Cc' + account;
            },

            getDataFromBookName : function (name) {
                var data = name.split(/[\sa-zA-Z\.]+/);
                return {
                    bank : parseInt(data[0]),
                    agency : parseInt(data[1]),
                    account : parseInt(data[2])
                };
            }
        };





        ///////////////////////////////////////////////////
        function _getLocalStockEntries() {
            var entries = local.data || [];
            var result = [];

            for (var idx in entries) {
                var entry = entries[idx];
                if (entry.type === 'stockAdd') {
                    result.push(entry);
                }
            }

            return result;
        }


        this.buildData = function (cashItem, checkItems, checkingAccountItems) {
            var data = [];
            data.push(this.cash.createEntry(cashItem));
            data = data.concat(this.check.createEntries(checkItems));
            data = data.concat(this.checkingAccount.createEntries(checkingAccountItems));
            return data;
        };


        this.updateBalanceWarmup = function (warmupRef, cashItem, checkItems, checkingAccountItems) {
            var balanceData = this.buildData(cashItem, checkItems, checkingAccountItems);
            var stockData = _getLocalStockEntries();
            var data = WarmupService.buildData(balanceData, stockData);
            return WarmupService.updateWarmup(warmupRef, data);
        };
    }



    /////////////////////////////////////////////////////////////////////////
    //#######################################################################
    /////////////////////////////////////////////////////////////////////////
    function StockWarmupService($q, $log, $rootScope, WarmupService) {
        var local = WarmupService.local;

        this.getLocalStockEntries = function () {
            var entries = local.data || [];
            var result = [];

            for (var idx in entries) {
                var entry = entries[idx];
                if (entry.type === 'stockAdd') {
                    result.push(entry);
                }
            }

            return result;
        };


        this.getLocalNonStockEntries = function () {
            var entries = local.data || [];
            var result = [];

            for (var idx in entries) {
                var entry = entries[idx];
                if (entry.type !== 'stockAdd') {
                    result.push(entry);
                }
            }

            return result;
        };


        this.updateStockWarmup = function (warmupRef, stockData) {
            var otherData = this.getLocalNonStockEntries();
            var data = [].concat(otherData, stockData);
            return WarmupService.updateWarmup(warmupRef, data);
        };


    }


    angular.module('tnt.catalog.warmup.service', [])
        .service('WarmupService', ['$q', '$log', '$rootScope', WarmupService])
        .service('CheckWarmupService', ['$q', '$log', '$rootScope', 'ArrayUtils', 'EntityService', 'IdentityService', 'WarmupService', CheckWarmupService])
        .service('CreditCardWarmupService', ['$q', '$log', '$rootScope', 'WarmupService', 'ArrayUtils', 'EntityService', 'IdentityService', CreditCardWarmupService])
        .service('OtherReceivablesWarmupService', ['$q', '$log', '$rootScope', 'WarmupService', 'ArrayUtils', 'EntityService', 'IdentityService', OtherReceivablesWarmupService])
        //.service('BalanceWarmupService', ['$q', '$log', '$rootScope', 'WarmupService', 'ArrayUtils', 'EntityService', 'IdentityService', BalanceWarmupService])
        .service('StockWarmupService', ['$q', '$log', '$rootScope', 'WarmupService', StockWarmupService]);

}(angular));
