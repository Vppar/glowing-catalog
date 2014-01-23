(function(angular) {
    'use strict';

    angular.module('tnt.catalog.order.service', [
      'tnt.catalog.order.entity',
      'tnt.catalog.order.keeper'
    ]).service('OrderService', function OrderService($log, Order, OrderKeeper, DataProvider) {


        var orderTemplate = {
          date : null,
          canceled : false,
          customerId : null,
          items : null
        };


        var order = {};
        initOrder();
        

        /**
         * Verifies if a order is valid.
         * @param order - Order object to be validated
         * @return {Array} Array of objects containing the invalid properties
         */
        var isValid = function isValid(order) {
          var
            invalidProperty,
            result = [],
            now = new Date();

          // See validation helpers in the end of this file
          invalidProperty = {
            date : angular.isDate(order.date) && order.date <= now,
            canceled : isBoolean(order.canceled),
            customerId : isValidCustomerId(order.customerId),
            items : areValidItems(order.items)
          };

          for (var ix in invalidProperty) {
            if (invalidProperty.hasOwnProperty(ix)) {
              if (!invalidProperty[ix]) {
                // Create an empty object, set a property with the name of
                // the invalid property, fill it with the invalid value and
                // add the result.
                result.push({}[ix] = order[ix]);
              }
            }
          }

          return result;
        };
        

        /**
         * Register an order in the datastore.
         *
         * @param order - Order object to be registered.
         * @return Array - Array of objects containing the invalid properties.
         * @throws Exception in case of a fatal error comming from the
         *  keeper.
         */
        var register = function register(order){
          var result = this.isValid(order);
          if (result.length === 0) {
            try {
              OrderKeeper.add(order);
            } catch (err) {
              throw 'OrderService.register: Unable to register an order=' +
                JSON.stringify(order) + '.' +
                'Err=' + err;
            }
          }
          return result;
        };
        

        /**
         * Returns the full orders list.
         * @return Array - Orders list.
         */
        var list = function list(){
          var result = null;
          try {
            result = OrderKeeper.list();
          } catch (err) {
            $log.debug('OrderService.list: Unable to recover the list of orders. ' +
                       'Err=' + err);
          }
          return result;
        };
        
        /**
         * Returns a single order by its id.
         * @param id - Order id.
         * @return {Order|null} The desired order;
         */
        var read = function read(id){
          var result = null;
          try {
            result = OrderKeeper.read(id);
          } catch (err) {
            $log.debug('OrderService.read: Unable to find an order with the id=' + id + '. ' +
                       'Err=' + err);
          }
          return result;
        };
        

        /**
         * Cancels an order.
         * @param id - Order id.
         * @return boolean Result if the receivable is canceled.
         */
        var cancel = function cancel(id){
          var result = true;
          try {
            OrderKeeper.cancel(id);
          } catch (err) {
            throw 'OrderService.cancel: Unable to cancel the order with id=' + id + '. ' +
              'Err=' + err;
          }
        };


        /**
         * Adds the current order to the list of orders.
         */
         // NOTE: This method saves a COPY of the actual order. If the order
         // is changed between the calls to save() and clear(), this changes
         // will be lost.
        var save = function save() {
          // Removes items without quantity
          var selectedItems = [];
          for (var idx in order.items) {
            var item = order.items[idx];
            if (item.qty) {
              selectedItems.push(item);
            }
          }

          var savedOrder = angular.copy(order);
          savedOrder.date = new Date();
          savedOrder.items = selectedItems;

          this.register(savedOrder);

          return savedOrder;
        };


        /**
         * Reset the current order.
         */
        var clear = function clear() {
          // Reset the current order to an empty object.
          for (var idx in order) {
            if (order.hasOwnProperty(idx)) {
              delete order[idx];
            }
          }

          initOrder();
        };
        
        
        this.order = order;
        this.isValid = isValid;
        this.register = register;
        this.list = list;
        this.read = read;
        this.cancel = cancel;
        this.save = save;
        this.clear = clear;


        // ===========================================
        // Helpers
        // ===========================================

        /**
         * Initializes a new order object based on the template.
         *
         * NOTE: it's not garanteed that the order will be reset after
         * calling this function. Use clear() if that's what you need.
         */
        function initOrder() {
          angular.extend(order, orderTemplate);
          order.items = [];
        }

        
        var customers = DataProvider.customers;

        /**
         * Checks if a value is a boolean.
         * @param {*} val Value to be checked.
         */
        function isBoolean(val) {
          return val === true || val === false;
        }


        /**
         * Checks if the given code is a valid order code.
         * @param {*} code The order's code to be validated.
         */
        // FIXME: check if this validation is enough.
        function isValidOrderCode(code) {
          // Considering:
          // - codes are strings
          // - codes cannot be empty
          return angular.isString(code) && code.length > 0;
        }


        /**
         * Checks if the given id is a valid customer id.
         * @param {*} id The customer id to be validated.
         */
        function isValidCustomerId(id) {
          // Customer Id should be a number and there should be a user
          // with such id
          if (angular.isNumber(id)) {
            var len, i;
            for (i = 0, len = customers.length; i < len; i += 1) {
              if (customers[i].id === id) {
                return true;
              }
            }
          }
          return false;
        }

        /**
         * Checks if the given array contains only valid paymentIds.
         * @param {*} ids Array of payment ids
         */
        // FIXME: implement proper paymentIds validation
        function areValidPaymentIds(ids) {
          return angular.isArray(ids) && ids.length > 0;
        }

        /**
         * Checks if the given array contains only valid items.
         * @param {*} items Array of items to validate.
         */
        // FIXME: implement proper items validation
        function areValidItems(items) {
          return angular.isArray(items) && items.length > 0;
        }
    });
}(angular));
