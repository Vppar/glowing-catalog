(function (angular) {
    'use strict';

    angular
        .module('tnt.catalog.scheduling.service', [
            'tnt.catalog.scheduling.entity', 'tnt.catalog.scheduling.keeper'
        ])
        .service(
            'SchedulingService',
            [
                '$q',
                'Schedule',
                'SchedulingKeeper',
                'logger',
                function SchedulingService ($q, Schedule, SchedulingKeeper, logger) {

                    var log = logger.getLogger('tnt.catalog.order.scheduling.SchedulingService');

                    /**
                     * Verifies if a order is valid.
                     * 
                     * @param order - Order object to be validated
                     * @return {Array} Array of objects containing the invalid
                     *         properties
                     */
                    var isValid = function isValid (schedule) {
                        var invalidProperty, result = [], now = new Date();
                        var date = new Date(schedule.date);
                        var created = new Date(schedule.created);
                        // See validation helpers in the end of this file
                        invalidProperty = {
                            date : angular.isDate(date),
                            created : angular.isDate(created),
                            status : schedule.status === true || schedule.status === false,
                            documentUUID : angular.isDefined(schedule.documentUUID),
                            items : areValidItems(schedule.items)
                        };

                        for ( var ix in invalidProperty) {
                            if (invalidProperty.hasOwnProperty(ix)) {
                                if (!invalidProperty[ix]) {
                                    // Create an empty object, set a property
                                    // with
                                    // the name of
                                    // the invalid property, fill it with the
                                    // invalid value and
                                    // add the result.
                                    var error = {};
                                    error[ix] = schedule[ix];
                                    result.push(error);
                                }
                            }
                        }

                        return result;
                    };

                    /**
                     * Register an order in the datastore.
                     * 
                     * @param order - Order object to be registered.
                     * @return Array - Array of objects containing the invalid
                     *         properties.
                     * @throws Exception in case of a fatal error comming from
                     *             the keeper.
                     */
                    var create =
                        function create (documentUUID, date, items, status) {

                            var result = null;
                            var created = new Date().getTime();

                            var schedule =
                                new Schedule(
                                    null,
                                    created,
                                    documentUUID,
                                    date.getTime(),
                                    status,
                                    items);
                            var hasErrors = this.isValid(schedule);
                            if (hasErrors.length === 0) {
                                result = SchedulingKeeper.create(schedule);
                            } else {
                                log.error(
                                    'SchedulingService.create: -Invalid schedule. ',
                                    hasErrors);
                                result = $q.reject(hasErrors);
                            }
                            return result;
                        };

                    /**
                     * Returns the full orders list.
                     * 
                     * @return Array - Orders list.
                     */
                    var list =
                        function list () {
                            var result = null;
                            try {
                                result = SchedulingKeeper.list();
                            } catch (err) {
                                log
                                    .debug('OrderService.list: Unable to recover the list of orders. ' +
                                        'Err=' + err);
                            }
                            return result;
                        };

                    /**
                     * Returns a single order by its id.
                     * 
                     * @param id - Order id.
                     * @return {Order|null} The desired order;
                     */
                    var readByDocument =
                        function readByDocument (id) {
                            var result = null;
                            try {
                                result = SchedulingKeeper.readByDocument(id);
                            } catch (err) {
                                log
                                    .debug('OrderService.read: Unable to find an order with the id=' +
                                        id + '. ' + 'Err=' + err);
                            }
                            return result;
                        };
                    /**
                     * Returns a single order by its id.
                     * 
                     * @param id - Order id.
                     * @return {Order|null} The desired order;
                     */
                    var readActiveByDocument =
                        function readActiveByDocument (id) {
                            var result = null;
                            try {
                                result = SchedulingKeeper.readActiveByDocument(id);
                            } catch (err) {
                                log
                                    .debug('OrderService.read: Unable to find an order with the id=' +
                                        id + '. ' + 'Err=' + err);
                            }
                            return result;
                        };

                    var readDeliveredByDocument =
                        function readDeliveredByDocument (id) {
                            var result = null;
                            try {
                                result = SchedulingKeeper.readDeliveredByDocument(id);
                            } catch (err) {
                                log
                                    .debug('OrderService.read: Unable to find an order with the id=' +
                                        id + '. ' + 'Err=' + err);
                            }
                            return result;
                        };

                    /**
                     * Returns a single order by its id.
                     * 
                     * @param id - Order id.
                     * @return {Order|null} The desired order;
                     */
                    var read =
                        function read (id) {
                            var result = null;
                            try {
                                result = SchedulingKeeper.read(id);
                            } catch (err) {
                                log
                                    .debug('OrderService.read: Unable to find an order with the id=' +
                                        id + '. ' + 'Err=' + err);
                            }
                            return result;
                        };

                    /**
                     * Updates an order.
                     * 
                     * @param id - Order id.
                     * @param itens - New items to update
                     * @return boolean Result if the receivable is canceled.
                     */
                    var update =
                        function update (id, date, items, status) {
                            var result = null;
                            try {
                                result = SchedulingKeeper.update(id, date.getTime(), items, status);
                                result['catch'](function (err) {
                                    log.debug(
                                        'OrderService.update: -Failed to update an order. ',
                                        err);
                                });
                            } catch (err) {
                                log
                                    .debug('OrderService.update: Unable to update the order with id=' +
                                        id + '. ' + 'Err=' + err);
                                result = $q.reject(err);
                            }
                            return result;
                        };

                    var remove = function (uuid) {
                        var result = null;
                        Scheduling.read(uiud);
                        if (hasErrors.length === 0) {
                            var stockEntry = new Stock(item.inventoryId, item.quantity, item.cost);
                            result = StockKeeper.remove(stockEntry.inventoryId, item.quantity);
                        } else {
                            log.error('StockService.remove: -Invalid item. ', hasErrors);
                            result = $q.reject(hasErrors);
                        }
                        return result;
                    };

                    this.isValid = isValid;
                    this.create = create;
                    this.list = list;
                    this.read = read;
                    this.readByDocument = readByDocument;
                    this.readActiveByDocument = readActiveByDocument;
                    this.readDeliveredByDocument = readDeliveredByDocument;
                    this.update = update;

                    // ===========================================
                    // Helpers
                    // ===========================================

                    /**
                     * Checks if the given array contains only valid items.
                     * 
                     * @param {*} items Array of items to validate.
                     */
                    // FIXME: implement proper items validation
                    function areValidItems (items) {
                        return angular.isArray(items) && items.length > 0;
                    }
                }
            ]);
}(angular));
