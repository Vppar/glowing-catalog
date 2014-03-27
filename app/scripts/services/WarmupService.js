(function(angular) {
    'use strict';

    function WarmupService($q, $log, $rootScope) {
        var self = this;

        var local = {};
        this.local = local;

        this.getLocalData = function() {
            var warmup = localStorage.getItem('warmup');
            return warmup ? JSON.parse(warmup) : {};
        };

        this.setLocalData = function(timestamp, data) {
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

        this.updateLocalData = function(ref, timestamp) {
            var deferred = $q.defer();

            ref.child('data').child(timestamp).once('value', function(snapshot) {
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

        this.setRemoteData = function(ref, timestamp, data) {
            var deferred = $q.defer();

            ref.child('data').child(timestamp).transaction(function(currentValue) {
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
            }, function(err, committed) {
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

        this.setRemoteTimestamp = function(ref, timestamp) {
            var deferred = $q.defer();

            ref.child('timestamp').transaction(function(remoteTimestamp) {
                if (!remoteTimestamp || remoteTimestamp < timestamp) {
                    return timestamp;
                }
            }, function(err, committed, snapshot) {
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

        this.updateRemoteData = function(ref, timestamp, data) {
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
            // timestamp as its key;
            // 2. set the timestamp value, indicating which warmup
            // data object is the current one;
            return self.setRemoteData(ref, timestamp, data).then(function() {
                return self.setRemoteTimestamp(ref, timestamp).then(function() {
                    $rootScope.$broadcast('RemoteWarmupDataUpdated', timestamp, data);
                });
            });
        };

        this.watchRemoteData = (function() {
            function _setRemoteTimestampListener(ref) {
                ref.child('timestamp').on('value', function(snapshot) {
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

        this.updateWarmup = function(warmupRef, data) {
            var timestamp = new Date().getTime();
            self.setLocalData(timestamp, data);
            return self.updateRemoteData(warmupRef, timestamp, data);
        };

        // ///////////////////////////////////////////////////////////
        // WarmupService initialization
        // ///////////////////////////////////////////////////////////

        // Update the data in our local object
        angular.extend(local, this.getLocalData());
    }

    // ///////////////////////////////////////////////////////////////////
    // ###################################################################
    // ///////////////////////////////////////////////////////////////////
    function CheckWarmupService($q, $log, $rootScope, ArrayUtils, EntityService, IdentityService, WarmupService, ReceivableService) {
        var local = WarmupService.local;

        function getItems() {
            var entries = getEntries();
            var items = [];

            for ( var idx in entries) {
                var entry = entries[idx];
                items.push(createItem(entry));
            }

            return items;
        }

        function getEntries() {
            var entries = local.data || [];
            var checkEntries = [];

            for ( var idx in entries) {
                var entry = entries[idx];
                if (entry.type === 'receivableAdd' && entry.event && entry.event.type === 'check') {
                    checkEntries.push(entry);
                }
            }

            return checkEntries;
        }

        function getOtherEntries() {
            var entries = local.data || [];
            var checkEntries = [];

            for ( var idx in entries) {
                var entry = entries[idx];
                if (entry.type !== 'receivableAdd' || (entry.event && entry.event.type !== 'check')) {
                    checkEntries.push(entry);
                }
            }

            return checkEntries;
        }

        function createEntry(item, idx) {
            // Convert to a timestamp if needed
            var duedate = item.duedate && item.duedate.getTime ? item.duedate.getTime() : item.duedate;
            var created = new Date().getTime();

            var payment = {
                id : null,
                created : created,
                account : item.account,
                agency : item.agency,
                bank : item.bank,
                amount : item.amount,
                duedate : duedate,
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
                created : created,
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

        // FIXME - Remove this method from controller and from html validation
        function isUsed(event) {
            return false;
        }

        function isRedeemed(event) {
            var recoveredReceivable = ReceivableService.read(event.uuid);
            return Boolean(recoveredReceivable && recoveredReceivable.liquidated);
        }

        function createEntries(items) {
            $log.debug('Creating warmup entries for check', items);
            var entries = [];

            for ( var idx in items) {
                var item = items[idx];
                if (typeof item === 'object') {
                    entries.push(createEntry(item, idx));
                }
            }

            return entries;
        }

        function getTotal(items) {
            if (!items) {
                return 0;
            }

            var total = 0;

            for ( var idx in items) {
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
    } // CheckWarmupService

    // ///////////////////////////////////////////////////////////////////
    // ###################################################################
    // ///////////////////////////////////////////////////////////////////
    function CreditCardWarmupService($q, $log, $rootScope, ArrayUtils, EntityService, IdentityService, WarmupService, ReceivableService) {
        var local = WarmupService.local;

        function getItems() {
            var entries = getEntries();
            var items = [];

            for ( var idx in entries) {
                var entry = entries[idx];
                items.push(createItem(entry));
            }

            return items;
        }

        function getEntries() {
            var entries = local.data || [];
            var creditCardEntries = [];

            for ( var idx in entries) {
                var entry = entries[idx];
                if (entry.type === 'receivableAdd' && entry.event && entry.event.type === 'creditCard') {
                    creditCardEntries.push(entry);
                }
            }

            return creditCardEntries;
        }

        function getOtherEntries() {
            var entries = local.data || [];
            var creditCardEntries = [];

            for ( var idx in entries) {
                var entry = entries[idx];
                if (entry.type !== 'receivableAdd' || (entry.event && entry.event.type !== 'creditCard')) {
                    creditCardEntries.push(entry);
                }
            }

            return creditCardEntries;
        }

        function createEntry(item, idx) {
            // Convert to a timestamp if needed
            var duedate = item.duedate && item.duedate.getTime ? item.duedate.getTime() : item.duedate;
            var created = new Date().getTime();
            var installment = null;
            var numberOfInstallments = null;
            if (item.installments) {
                if (item.installments.indexOf(' de ') > -1) {
                    var splitedInstallments = item.installments.split(' de ');
                    installment = splitedInstallments[0];
                    numberOfInstallments = splitedInstallments[1];
                }
            }

            var payment = {
                id : null,
                amount : item.amount,
                created : created,
                ccDueDate : null,
                ccNumber : '0000',
                duedate : duedate,
                flag : null,
                installments : installment,
                owner : item.customerName,
                type : 'creditCard'
            };

            if (numberOfInstallments) {
                payment.numberOfInstallments = numberOfInstallments;
            }

            var event = {
                // When generating the UUID:
                // 0 is an arbitrary deviceId used in warmup entries
                // 1 is the CoinKeeper's op for generating UUIDs
                uuid : item.uuid || IdentityService.internalGetUUID(0, 1, idx),
                amount : item.amount,
                created : created,
                documentId : item.documentId,
                duedate : duedate,
                entityId : item.customerId,
                type : 'creditCard',
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

            var installments = payment.installments;
            if (payment.numberOfInstallments) {
                installments += ' de ' + payment.numberOfInstallments;
            }

            angular.extend(item, {
                uuid : event.uuid,
                duedate : event.duedate ? new Date(event.duedate) : null,
                amount : event.amount,
                customerName : customer && customer.name,
                customerId : event.entityId,
                documentId : event.documentId,
                installments : installments,
                used : isUsed(event),
                redeemed : isRedeemed(event)
            });

            return item;
        }

        // FIXME - Remove this method from controller and from html validation
        function isUsed(event) {
            return false;
        }

        function isRedeemed(event) {
            var recoveredReceivable = ReceivableService.read(event.uuid);
            return Boolean(recoveredReceivable && recoveredReceivable.liquidated);
        }

        function createEntries(items) {
            var entries = [];

            for ( var idx in items) {
                var item = items[idx];
                // Don't create an entry for the data in the 'total' attribute
                if (typeof item === 'object') {
                    entries.push(createEntry(item, idx));
                }
            }

            $log.debug('Entries:', entries);

            return entries;
        }

        function getTotal(items) {
            if (!items) {
                return 0;
            }

            var total = 0;

            for ( var idx in items) {
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
    } // CreditCardWarmupService

    // ///////////////////////////////////////////////////////////////////
    // ###################################################################
    // ///////////////////////////////////////////////////////////////////
    function OtherReceivablesWarmupService() {
    }

    // ///////////////////////////////////////////////////////////////////////
    // #######################################################################
    // ///////////////////////////////////////////////////////////////////////
    function StockWarmupService($q, $log, $rootScope, WarmupService) {
        var local = WarmupService.local;

        this.getLocalStockEntries = function() {
            var entries = local.data || [];
            var result = [];

            for ( var idx in entries) {
                var entry = entries[idx];
                if (entry.type === 'stockAdd') {
                    result.push(entry);
                }
            }

            return result;
        };

        this.getLocalNonStockEntries = function() {
            var entries = local.data || [];
            var result = [];

            for ( var idx in entries) {
                var entry = entries[idx];
                if (entry.type !== 'stockAdd') {
                    result.push(entry);
                }
            }

            return result;
        };

        this.updateStockWarmup = function(warmupRef, stockData) {
            var otherData = this.getLocalNonStockEntries();
            var data = [].concat(otherData, stockData);
            return WarmupService.updateWarmup(warmupRef, data);
        };

    }

    angular.module('tnt.catalog.warmup.service', []).service('WarmupService', [
        '$q', '$log', '$rootScope', WarmupService
    ]).service('CheckWarmupService', [
        '$q', '$log', '$rootScope', 'ArrayUtils', 'EntityService', 'IdentityService', 'WarmupService', 'ReceivableService', CheckWarmupService
    ]).service('CreditCardWarmupService', [
        '$q', '$log', '$rootScope', 'ArrayUtils', 'EntityService', 'IdentityService', 'WarmupService', 'ReceivableService', CreditCardWarmupService
    ]).service('OtherReceivablesWarmupService', [
        '$q', '$log', '$rootScope', 'WarmupService', 'ArrayUtils', 'EntityService', 'IdentityService', OtherReceivablesWarmupService
    ])
    // .service('BalanceWarmupService', ['$q', '$log', '$rootScope',
    // 'WarmupService', 'ArrayUtils', 'EntityService', 'IdentityService',
    // BalanceWarmupService])
    .service('StockWarmupService', [
        '$q', '$log', '$rootScope', 'WarmupService', StockWarmupService
    ]);

})(angular);