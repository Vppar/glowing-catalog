(function (angular) {
    'use strict';

    /**
     * Service to manage operations over Receivables.
     * 
     * @author Arnaldo S. Rodrigues Jr.
     */
    angular
        .module(
            'tnt.catalog.receivable.service',
            [
                'tnt.catalog.receivable.entity',
                'tnt.catalog.coin.keeper',
                'tnt.catalog.service.book',
                'tnt.catalog.payment.entity'
            ])
        .service(
            'ReceivableService',
            [
                '$q',
                '$log',
                '$filter',
                'ArrayUtils',
                'Receivable',
                'CoinKeeper',
                'WebSQLDriver',
                'BookService',
                function ReceivableService ($q, $log, $filter, ArrayUtils, Receivable, CoinKeeper,
                    WebSQLDriver, BookService) {

                    var ReceivableKeeper = CoinKeeper('receivable');

                    /**
                     * Verifies if a receivable is valid or not.
                     * 
                     * @param receivable - Receivable object to be validated.
                     * @return Array - Array of objects containing the invalid
                     *         properties
                     */
                    var isValid = function isValid (receivable) {
                        var invalidProperty = {};
                        // FIXME - Verify if is a valid entityId
                        invalidProperty.entityId = true;
                        // FIXME - Verify if is a valid receivable type
                        // invalidProperty.type =
                        // angular.isDefined(receivable.type);
                        invalidProperty.amount = Number(receivable.amount) !== 0;

                        var result = [];

                        for ( var ix in invalidProperty) {
                            if (!invalidProperty[ix]) {
                                // Create a new empty object, set a property
                                // with the name of the invalid property,
                                // fill it with the invalid value and add to
                                // the result
                                var error = {};
                                error[ix] = receivable[ix];
                                result.push(error);
                            }
                        }

                        return result;
                    };

                    /**
                     * Returns the full receivables list.
                     * 
                     * @return Array - Receivables list.
                     */
                    var list =
                        function () {
                            var result = null;
                            try {
                                result = ReceivableKeeper.list();
                            } catch (err) {
                                $log
                                    .debug('ReceivableService.list: Unable to recover the list of receivables. Err=' +
                                        err);
                            }

                            return result;
                        };

                    /**
                     * Returns the full receivables list.
                     * 
                     * @return Array - Receivables list.
                     */
                    var listActive = function () {
                        return filterReceivablesByCanceled(this.list());
                    };

                    /**
                     * Returns the full receivables list.
                     * 
                     * @return Array - Receivables list.
                     */
                    var listByDocument =
                        function (document) {
                            var result = null;
                            try {
                                result =
                                    ArrayUtils
                                        .list(ReceivableKeeper.list(), 'documentId', document);
                            } catch (err) {
                                $log
                                    .debug('ReceivableService.list: Unable to recover the list of receivables. Err=' +
                                        err);
                            }

                            return result;
                        };

                    /**
                     * Returns the full receivables list.
                     * 
                     * @return Array - Receivables list.
                     */
                    var listActiveByDocument =
                        function (document) {
                            var receivables =
                                filterReceivablesByCanceled(this.listByDocument(document));
                            receivables = filterReceivablesByLiquidated(receivables);
                            return receivables;
                        };

                    /**
                     * Returns a single receivable by its id.
                     * 
                     * @param uuid - Receivable uuid.
                     * @return Receivable - The desired receivable.
                     */
                    var read = function read (uuid) {
                        return ReceivableKeeper.read(uuid);
                    };

                    /**
                     * Register a receivable in the datastore.
                     * 
                     * @param receivable - Receivable object to be registered.
                     * @return Array - Array of objects containing the invalid
                     *         properties.
                     * @throws Exception in case of a fatal error comming from
                     *             the keeper.
                     */
                    var register =
                        function register (receivable) {
                            var result = null;
                            var hasErrors = isValid(receivable);
                            if (hasErrors.length === 0) {
                                result = ReceivableKeeper.add(new Receivable(receivable));
                                result['catch']
                                    (function (err) {
                                        $log
                                            .error(
                                                'ReceivableService.register: -Failed to create a receivable. ',
                                                err);
                                    });
                            } else {
                                $log.error(
                                    'ReceivableService.register: -Invalid receivable. ',
                                    hasErrors);
                                result = $q.reject(hasErrors);
                            }
                            return result;
                        };

                    var bulkRegister =
                        function (payments, entity, document) {
                            var receivablesPromises = [];
                            for ( var ix in payments) {
                                var payment = payments[ix];
                                if (payment.amount !== 0) {
                                    var receivable = new Receivable({
                                        entityId : entity.uuid,
                                        documentId : document,
                                        type : payment.type,
                                        amount : payment.amount,
                                        duedate : payment.duedate,
                                        payment : payment
                                    });
                                    // FIXME set liquidate for cash
                                    if (payment.type === 'cash') {
                                        receivable.liquidated = payment.duedate;
                                    }
                                    receivablesPromises[ix] = register(receivable);
                                } else {
                                    $log.warn('Payment will be ignored because its amount is 0: ' +
                                        JSON.stringify(payment));
                                }
                            }
                            return $q.all(receivablesPromises);
                        };

                    /**
                     * Pseudo update a receivable in the datastore. What it
                     * really does is cancel the receivable and create a new
                     * one.
                     * 
                     * @param receivable - Receivable to be registered.
                     * @return Array - Array of objects containing the invalid
                     *         properties.
                     * @throws Exception in case of a fatal error comming from
                     *             the keeper.
                     */
                    var update =
                        function update (uuid, amount, duedate, remarks, paymentNew, typeNew,
                            typeOld, extra, discount) {
                            var result = null;
                            var receivable = this.read(uuid);
                            //save the original amount for future reference.
                            var originalAmount = receivable.amount;
                            
                            //update all changed fields
                            if (duedate) {
                                receivable.duedate = duedate.getTime();
                            }
                            if (remarks) {
                                receivable.remarks = remarks;
                            }
                            if (paymentNew) {
                                receivable.payment = paymentNew;
                            }
                            if (typeNew) {
                                receivable.type = typeNew;
                            }
                            if (extra) {
                                receivable.amount += extra;
                            } else if (discount) {
                                receivable.amount -= discount;
                            }
                            //verify is valid
                            result = isValid(receivable);
                            if (receivable && result.length === 0) {
                                try {
                                    // Update Receivable
                                    result = ReceivableKeeper.updateReceivable(receivable);
                                    
                                    // BookService interations
                                    var entries = [];

                                    if (typeNew) {
                                        var amountDiscOrExtra = extra ? extra : -discount;
                                        //discount
                                        entries = entries.concat(BookService.negotiation(receivable.uuid,receivable.entityId,amountDiscOrExtra));
                                        //payment new receivable.
                                        if (typeNew === 'oncuff') {
                                            entries =
                                                entries.concat(
                                                    BookService.payment(receivable.uuid,receivable.entityId,null,null,null,receivable.amount,null,null,null,null));
                                        } else if (typeNew === 'check') {
                                            entries =
                                                entries.concat(BookService.payment(
                                                    receivable.uuid, receivable.entityId,null,receivable.amount,null,null,null,null,null,null));
                                        }
                                        //liquidate old receivable.
                                        entries = entries.concat(BookService.liquidate(typeOld,receivable.uuid,receivable.entityId,originalAmount));
                                    } else if(originalAmount != receivable.amount){
                                        var amount = extra ? extra : -discount;
                                        entries = entries.concat(BookService.negotiation(
                                            receivable.uuid,
                                            receivable.entityId,
                                            amount));
                                    }
                                    if(entries.length > 0 ){
                                        var promises = writeBookEntries(entries);
                                        result = $q.all(promises);
                                    }

                                } catch (err) {
                                    $log
                                        .debug('ReceivableService.register: Unable to register a receivable=' +
                                            JSON.stringify(receivable) + '. Err=' + err);
                                    result = $q.reject(err);
                                }
                            }
                            return result;
                        };
                    
                        
                    /**
                     * Receive a payment to a receivable.
                     * 
                     * @param receivableUUID - Receivable id.
                     * @param receiveDate
                     * @param paymentType
                     * @param orderUUID
                     * @param entityUUID
                     * @param amount
                     * @return boolean - Result if the receivable is liquidated.
                     */
                    var receive =
                        function receive (receivableUUID, receiveDate, paymentType, orderUUID,
                            entityUUID, amount, account) {
                            var promises = [];
                            try {
                                promises.push(ReceivableKeeper.liquidate(
                                    receivableUUID,
                                    receiveDate));

                                var entries = null;
                                entries =
                                    BookService
                                        .deposit(account, amount, receivableUUID, entityUUID);
                                entries =
                                    entries.concat(BookService.liquidate(
                                        paymentType,
                                        receivableUUID,
                                        entityUUID,
                                        amount));
                                promises = promises.concat(writeBookEntries(entries));

                                var promise = $q.all(promises);
                            } catch (err) {
                                var logInfo = {
                                    receivableUUID : receivableUUID,
                                    receiveDate : receiveDate,
                                    paymentType : paymentType,
                                    orderUUID : orderUUID,
                                    entityUUID : entityUUID,
                                    amount : amount
                                };
                                $log
                                    .fatal('ReceivableService.register: Unable to receive a payment to a receivable=' +
                                        JSON.stringify(logInfo) + '. Err=' + err);
                                promise = $q.reject(err);
                            }
                            return promise;
                        };

                    function writeBookEntries (bookEntries) {
                        var bookEntryPromises = [];
                        for ( var ix in bookEntries) {
                            var entry = bookEntries[ix];
                            var entryPromise = BookService.write(entry);
                            bookEntryPromises.push(entryPromise);
                        }
                        return bookEntryPromises;
                    }

                    /**
                     * Cancels a receivable.
                     * 
                     * @param id - Receivable id.
                     * @return boolean - Result if the receivable is canceled.
                     */
                    var cancel =
                        function cancel (uuid) {
                            var result = true;
                            try {
                                ReceivableKeeper.cancel(uuid);
                            } catch (err) {
                                throw 'ReceivableService.register: Unable to cancel a receivable=' +
                                    JSON.stringify(receivable) + '. Err=' + err;
                            }
                            return result;
                        };

                    function receivableCanceledFilter (receivable) {
                        return (receivable.canceled === undefined);
                    }

                    function filterReceivablesByCanceled (receivables) {
                        return $filter('filter')(receivables, receivableCanceledFilter);
                    }

                    function filterReceivablesByLiquidated (receivables) {
                        return $filter('filter')(receivables, receivableLiquidateFilter);
                    }
                    ;

                    function receivableLiquidateFilter (receivable) {
                        return (receivable.liquidated === undefined);
                    }

                    this.isValid = isValid;
                    this.register = register;
                    this.bulkRegister = bulkRegister;
                    this.listByDocument = listByDocument;
                    this.listActiveByDocument = listActiveByDocument;
                    this.update = update;
                    this.read = read;
                    this.list = list;
                    this.listActive = listActive;
                    this.receive = receive;
                    this.cancel = cancel;

                    // #################################################################################################
                    // CHECK STUFF
                    // #################################################################################################

                    this.listChecks =
                        function () {
                            var checkReceivables =
                                ArrayUtils.list(ReceivableKeeper.list(), 'type', 'check');
                            var checks = [];
                            for ( var ix in checkReceivables) {
                                checkReceivables[ix].payment.uuid = checkReceivables[ix].uuid;
                                checks.push(checkReceivables[ix].payment);
                            }
                            return checks;
                        };

                    this.readCheck = function (uuid) {
                        return this.read(uuid).payment;
                    };

                    var self = this;
                    /**
                     * Validates the if there's a check for the given uuid and
                     * if the transition is valid, then calls the Keeper or
                     * return a rejected promise.
                     * 
                     * @param {String} - uuid of the desired check.
                     * @param {Number} - position of the new state.
                     * @return - JournalKeeper promise in case of success or a
                     *         rejected promise with the error message.
                     */
                    this.changeState =
                        function (uuid, newState) {
                            var check = this.readCheck(uuid);
                            if (!check) {
                                return $q.reject('Couldn\'t find a receivable for the uuid: ' +
                                    uuid);
                            }
                            check.uuid = uuid;
                            if (check.state) {
                                var oldState = check.state;
                            } else {
                                var oldState = 1;
                            }
                            var result = validateStateTransition(oldState, newState);

                            if (result) {
                                // update the state
                                check.state = newState;

                                var promise = null;

                                // If the check goes from 1 to 2 or 3, you also
                                // need
                                // to liquidate the Receivable.
                                if (oldState === 1 && (newState === 2 || newState === 3)) {
                                    promise = ReceivableKeeper.liquidate(uuid, new Date());
                                    // If the check goes from 2 or 3 to 1, you
                                    // also
                                    // need to re-enable the
                                    // Receivable(executionDate=null).
                                } else if (newState === 1 && (oldState === 2 || oldState === 3)) {
                                    promise = ReceivableKeeper.liquidate(uuid, null);
                                } else {
                                    // Otherwise just change the check.
                                    return ReceivableKeeper.updateCheck(check);
                                }

                                // resolving the promises from the liquidate
                                if (promise) {
                                    return promise.then(function (result) {
                                        $log.info('Receivable Liquidated with succes: ' + result);
                                        $log.info('Starting to Update the check state.');
                                        return ReceivableKeeper.updateCheck(check);
                                    }, function (error) {
                                        $log.fatal('Failed to Liquidate the Receivable: ' + uuid +
                                            '. Cause: ' + error);
                                        return $q.reject();
                                    });
                                }

                            } else {
                                return $q.reject('Invalid transition from "' + check.state +
                                    '" to "' + newState + '"');
                            }
                        };

                    /**
                     * Validates if the desired transition from A->B is
                     * possible.
                     * 
                     * @param - Current state of the Check.
                     * @param - Desired state for the Check.
                     * @return {boolean} - true if possible, false otherwise.
                     */
                    var validateStateTransition = function (currentState, newState) {
                        var result = true;
                        var resp = self.states()[currentState].indexOf(newState);
                        if (resp === -1) {
                            result = false;
                        }
                        return result;
                    };

                    /**
                     * Check States Map.
                     */
                    this.states = function () {
                        return {
                            '1' : [
                                2, 3
                            ],
                            '2' : [
                                1, 4
                            ],
                            '3' : [
                                1, 4
                            ],
                            '4' : [
                                2, 3
                            ]
                        };
                    };

                }
            ]).run([
            'ReceivableService', function (ReceivableService) {
            }
        ]);
}(angular));
