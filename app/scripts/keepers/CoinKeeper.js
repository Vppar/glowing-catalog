(function(angular) {
    'use strict';

    angular.module('tnt.catalog.coin.entity', ['tnt.identity', 'tnt.catalog.journal']).factory('Coin', function Coin() {

        var service = function svc(uuid, created, entityId, amount, duedate) {

            var validProperties = [
                'uuid', 'created', 'entityId', 'documentId', 'type', 'payment', 'amount', 'duedate', 'canceled', 'liquidated', 'remarks', 'document'
            ];

            ObjectUtils.method(svc, 'isValid', function() {
                for ( var ix in this) {
                    var prop = this[ix];
                    if (!angular.isFunction(prop)) {
                        if (validProperties.indexOf(ix) === -1) {
                            throw 'Unexpected property ' + ix;
                        }
                    }
                }
            });

            if (arguments.length != svc.length) {
                if (arguments.length === 1 && angular.isObject(arguments[0])) {
                    svc.prototype.isValid.apply(arguments[0]);
                    ObjectUtils.dataCopy(this, arguments[0]);
                } else {
                    throw 'Coin must be initialized with uuid, created, entityId, amount, duedate';
                }
            } else {
                this.uuid = uuid;
                this.created = created;
                this.entityId = entityId;
                this.amount = amount;
                this.duedate = duedate;
            }
            ObjectUtils.ro(this, 'uuid', this.uuid);
            ObjectUtils.ro(this, 'created', this.created);
            ObjectUtils.ro(this, 'entityId', this.entityId);
            ObjectUtils.ro(this, 'amount', this.amount);
            ObjectUtils.ro(this, 'duedate', this.duedate);
        };

        return service;
    });

    angular.module('tnt.catalog.receivable.entity', [
        'tnt.catalog.coin.entity'
    ]).factory('Receivable', function Receivable(Coin) {
        return Coin;
    });

    angular.module('tnt.catalog.expense.entity', [
        'tnt.catalog.coin.entity'
    ]).factory('Expense', function Expense(Coin) {
        return Coin;
    });

    angular.module(
            'tnt.catalog.coin.keeper',
            [
                'tnt.utils.array', 'tnt.catalog.expense.entity', 'tnt.catalog.receivable.entity', 'tnt.catalog.coin.entity',
                'tnt.catalog.journal.replayer', 'tnt.catalog.payment.entity'
            ]).factory('CoinKeeper', ['ArrayUtils', 'Coin', 'IdentityService', 'JournalKeeper', 'JournalEntry', 'Replayer', 'CheckPayment', function CoinKeeper(ArrayUtils, Coin, IdentityService, JournalKeeper, JournalEntry, Replayer, CheckPayment) {

        var keepers = {};
        function instance(name) {

            // FIXME - Make it flexible
            var type = (name === 'receivable' ? 1 : 2);
            var currentEventVersion = 1;
            var currentCounter = 0;
            var vault = [];

            this.handlers = {};

            function getNextId() {
                return ++currentCounter;
            }

            /**
             * Registering handlers
             */
            ObjectUtils.ro(this.handlers, name + 'AddV1', function(event) {
                // Get the coin info from type map, get the respective entity
                // and instantiate
                var eventData = IdentityService.getUUIDData(event.uuid);

                if (eventData.deviceId === IdentityService.getDeviceId()) {
                    currentCounter = currentCounter >= eventData.id ? currentCounter : eventData.id;
                }

                event = new Coin(event);
                vault.push(event);

                return event.uuid;
            });

            ObjectUtils.ro(this.handlers, name + 'CancelV1', function(event) {

                var coin = ArrayUtils.find(vault, 'uuid', event.uuid);

                if (coin) {
                    coin.canceled = event.canceled;
                } else {
                    throw 'Unable to find a ' + name + ' with uuid=\'' + event.uuid + '\'';
                }
            });
            ObjectUtils.ro(this.handlers, name + 'LiquidateV1', function(event) {
                var coin = ArrayUtils.find(vault, 'uuid', event.uuid);
                if (coin) {
                    // Get the coin info from type map and get the respective
                    // liquidate variable name
                    coin.liquidated = event.liquidated;
                } else {
                    throw 'Unable to find a ' + name + ' with uuid=\'' + event.uuid + '\'';
                }

                return event.uuid;
            });
            
            ObjectUtils.ro(this.handlers, name + 'updateCheckV1', function(event) {
                var coin = ArrayUtils.find(vault, 'uuid', event.uuid);
                if (coin) {
                    coin.payment = event.payment;
                } else {
                    throw 'Unable to find a ' + name + ' with uuid=\'' + event.uuid + '\'';
                }

                return event.uuid;
            });

            // Nuke event for clearing the vault list
            ObjectUtils.ro(this.handlers, 'nukeCoinsV1', function() {
                vault.length = 0;
                return true;
            });


            /**
             * Registering the handlers with the Replayer
             */
            Replayer.registerHandlers(this.handlers);

            /**
             * Returns a copy of all coins in the vault
             * 
             * @return Array - Coins in the vault.
             */
            var list = function list() {
                return angular.copy(vault);
            };

            /**
             * Return a copy of a coin by its uuid
             * 
             * @param uuid - uuid of the target coin.
             */
            var read = function read(uuid) {
                return angular.copy(ArrayUtils.find(vault, 'uuid', uuid));
            };

            /**
             * Adds a coin to the list
             * 
             * @param coin - Receivable to be added.
             */
            var add = function add(coin) {
                var coinObj = angular.copy(coin);
                
                coinObj.created = (new Date()).getTime();
                coinObj.uuid = IdentityService.getUUID(type, getNextId());

                var event = new Coin(coinObj);

                // create a new journal entry
                var entry = new JournalEntry(null, event.created, name + 'Add', currentEventVersion, event);

                // save the journal entry
                return JournalKeeper.compose(entry);

            };

            /**
             * Liquidate a coin.
             * 
             * @param uuid - Identifier to the coin.
             * @param executionDate - Date that the coin was executed(payed or
             *            received).
             */
            var liquidate = function liquidate(uuid, executionDate) {
                var coin = ArrayUtils.find(vault, 'uuid', uuid);
                if (!coin) {
                    throw 'Unable to find a ' + name + ' with uuid=\'' + uuid + '\'';
                }
                var liqEv = {
                    uuid : uuid,
                };
                liqEv.liquidated = executionDate;
                var stamp = (new Date()).getTime();
                // create a new journal entry

                var entry = new JournalEntry(null, stamp, name + 'Liquidate', currentEventVersion, liqEv);

                // save the journal entry
                return JournalKeeper.compose(entry);
            };

            /**
             * Cancels a coin.
             * 
             * @param uuid - uuid of the coin to be canceled.
             */
            var cancel = function cancel(uuid) {

                var coin = ArrayUtils.find(vault, 'uuid', uuid);
                if (!coin) {
                    throw 'Unable to find a ' + name + ' with uuid=\'' + uuid + '\'';
                }
                var time = (new Date()).getTime();
                var stamp = time / 1000;
                var cancelEv = {
                    uuid : uuid,
                    canceled : time
                };

                // create a new journal entry
                var entry = new JournalEntry(null, stamp, name + 'Cancel', currentEventVersion, cancelEv);

                // save the journal entry
                JournalKeeper.compose(entry);
            };
            
            
            /**
             * Change the state of a receivable.
             * 
             * @param {check} - check with the updated state. 
             */
            var changeState = function(check){
                var receivable = angular.copy(ArrayUtils.find(vault, 'uuid', check.uuid));
                check = new CheckPayment(check);
                receivable.payment = check;
                
                var event = new Coin(receivable);
                
                // create a new journal entry
                var entry = new JournalEntry(null, event.created, name + 'UpdateCheck', currentEventVersion, event);

                // save the journal entry
                return JournalKeeper.compose(entry);
                
            };

            // Publishing
            this.list = list;
            this.read = read;
            this.add = add;
            this.liquidate = liquidate;
            this.cancel = cancel;
            this.changeState = changeState;
        }

        return function(name) {
            if (!keepers[name]) {
                keepers[name] = new instance(name);
            }
            return keepers[name];
        };

        angular.module('tnt.catalog.coin.keeper', [
            'tnt.utils.array', 'tnt.catalog.expense.entity', 'tnt.catalog.receivable.entity', 'tnt.catalog.coin.entity'
        ]);
    }]);
}(angular));
