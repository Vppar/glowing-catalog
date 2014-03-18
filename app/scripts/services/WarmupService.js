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


        this.buildData = function (balanceData, stockData) {
            return [].concat(balanceData || [], stockData || []);
        };


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
                return false;
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
                        dueDate : event.duedate ? new Date(event.duedate) : null,
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
                    // TODO get entityId
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
                            duedate : item.dueDate && item.dueDate.getTime ? item.dueDate.getTime() : item.dueDate,
                            entityId : item.entityId,
                            amount : item.amount,
                            created : item.created || null,
                            payment : {
                                id : null,
                                account : item.account,
                                agency : item.agency,
                                bank : item.bank,
                                amount : item.amount,
                                dueDate : item.dueDate.getTime(),
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
            BOOKS : [
                11131, 11132, 11133, 11134, 11135, 11136, 11137, 11138, 11139
            ],

            takenBooks : [],

            isBookTaken : function (access) {
                return !!~this.takenBooks.indexOf(access);
            },

            takeBook : function (access) {
                if (!this.isBookTaken(access)) {
                    this.takenBooks.push(access);
                }
            },

            freeBook : function (access) {
                var idx = this.takenBooks.indexOf(access);
                if (~idx) {
                    this.takenBooks.splice(idx, 1);
                }
            },

            isUsed : function (book) {
                // TODO
                return false;
            },

            isCheckingAccountBook : function (access) {
                return !!~this.BOOKS.indexOf(access);
            },

            hasAvailableBook : function () {
                return this.takenBooks.length < this.BOOKS.length;
            },

            getAvailableBook : function () {
                for (var idx in this.BOOKS) {
                    var book = this.BOOKS[idx];
                    if (!this.isBookTaken(book)) {
                        return book;
                    }
                }

                return null;
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
                        this.isCheckingAccountBook(entry.event.access)
                    ) {
                        this.takenBooks.push(entry.event.access);
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



    function StockWarmupService($q, $log, $rootScope, WarmupService) {
    }


    angular.module('tnt.catalog.warmup.service', [])
        .service('WarmupService', ['$q', '$log', '$rootScope', WarmupService])
        .service('BalanceWarmupService', ['$q', '$log', '$rootScope', 'WarmupService', 'ArrayUtils', 'EntityService', 'IdentityService', BalanceWarmupService])
        .service('StockWarmupService', ['$q', '$log', '$rootScope', 'WarmupService', StockWarmupService]);

}(angular));
