(function(angular) {
    'use strict';

    angular.module('tnt.catalog.order.service', []).service(
            'OrderService', function OrderService($rootScope, $q, $log, Order, OrderKeeper, DataProvider) {

                var orderTemplate = {
                    // FIXME: generate codes dynamically.
                    // Should codes be generated here or in OrderKeeper?
                    code : 'mk-0001-14',
                    date : null,
                    canceled : false,
                    customerId : null,
                    items : null
                };

                var order = {};
                initOrder();

                /**
                 * Verifies if a order is valid.
                 * 
                 * @param order - Order object to be validated
                 * @return {Array} Array of objects containing the invalid
                 *         properties
                 */
                var isValid = function isValid(order) {
                    var invalidProperty, result = [], now = new Date();

                    // See validation helpers in the end of this file
                    invalidProperty = {
                        // FIXME: implement order code validation once the
                        // generator
                        // is implemented.
                        // code : isValidOrderCode(order.code),
                        date : angular.isDate(order.date) && order.date <= now,
                        canceled : isBoolean(order.canceled),
                        customerId : isValidCustomerId(order.customerId),
                        items : areValidItems(order.items)
                    };

                    for ( var ix in invalidProperty) {
                        if (invalidProperty.hasOwnProperty(ix)) {
                            if (!invalidProperty[ix]) {
                                // Create an empty object, set a property with
                                // the name of
                                // the invalid property, fill it with the
                                // invalid value and
                                // add the result.
                                var error = {};
                                error[ix] = order[ix];
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
                 * @throws Exception in case of a fatal error comming from the
                 *             keeper.
                 */
                var register = function register(order) {
                    var result = null;
                    var hasErrors = this.isValid(order);
                    if (hasErrors.length === 0) {
                        result = OrderKeeper.add(new Order(order));

                        // Broadcast order registration
                        // FIXME: check if the order has been successfully
                        // processed by the keeper?
                        $rootScope.$broadcast('OrderService.register', order);
                    } else {
                        result = $q.reject(hasErrors);
                    }
                    return result;
                };

                /**
                 * Returns the full orders list.
                 * 
                 * @return Array - Orders list.
                 */
                var list = function list() {
                    var result = null;
                    try {
                        result = OrderKeeper.list();
                    } catch (err) {
                        $log.debug('OrderService.list: Unable to recover the list of orders. ' + 'Err=' + err);
                    }
                    return result;
                };

                /**
                 * Returns a single order by its id.
                 * 
                 * @param id - Order id.
                 * @return {Order|null} The desired order;
                 */
                var read = function read(id) {
                    var result = null;
                    try {
                        result = OrderKeeper.read(id);
                    } catch (err) {
                        $log.debug('OrderService.read: Unable to find an order with the id=' + id + '. ' + 'Err=' + err);
                    }
                    return result;
                };

                /**
                 * Cancels an order.
                 * 
                 * @param id - Order id.
                 * @return boolean Result if the receivable is canceled.
                 */
                var cancel = function cancel(id) {
                    var result = true;
                    try {
                        result = OrderKeeper.cancel(id);

                        // Broadcast order cancelation
                        $rootScope.$broadcast('OrderService.cancel', result);
                    } catch (err) {
                        throw 'OrderService.cancel: Unable to cancel the order with id=' + id + '. ' + 'Err=' + err;
                    }
                    return result;
                };

                /**
                 * Adds the current order to the list of orders.
                 */
                // NOTE: This method saves a COPY of the actual order. If the
                // order
                // is changed between the calls to save() and clear(), this
                // changes
                // will be lost.
                //
                // NOTE: This DOES NOT clears the current order automatically.
                var save = function save() {
                    // Removes items without quantity
                    var selectedItems = [];
                    for ( var idx in order.items) {
                        var item = order.items[idx];
                        if (item.qty) {
                            selectedItems.push(item);
                        }
                    }

                    var savedOrder = angular.copy(order);
                    savedOrder.date = new Date();
                    savedOrder.items = selectedItems;

                    return this.register(savedOrder);
                };

                /**
                 * Reset the current order.
                 */
                var clear = function clear() {
                    // Reset the current order to an empty object.
                    for ( var idx in order) {
                        if (order.hasOwnProperty(idx)) {
                            delete order[idx];
                        }
                    }

                    initOrder();
                };


                //////////////////////////////////////////////
                // Item handling functions

                /**
                 * A very business-specific method that decides how to handle items in
                 * the order based on its attributes. Should handle adding, removing
                 * and updating items. Magical...
                 *
                 * @param {object} item The item to be handled.
                 */
                var handleItem = function handleItem(item) {
                  // NOTE: Coupons are handled by the PaymentService!

                  if (itemIsProduct(item)) {
                    handleProduct(item);

                  } else if (itemIsVoucher(item)) {
                    handleVoucher(item);

                  } else if (itemIsGiftCard(item)) {
                    handleGiftCard(item);
                  }
                };


                /**
                 * Adds an item to the order.items array.
                 */
                var addItem = function addItem(item) {
                  // FIXME: check if item is an instance of an expected entity?
                  var
                    isValidItem = validateItem(item),
                    itemIdx = order.items.length;

                  if (!isValidItem) {
                    throw 'OrderService.addItem: Invalid item';
                  }

                  order.items.push(item);

                  // Broadcast the addItem event
                  $rootScope.$broadcast('OrderService.addItem', item, itemIdx);
                };


                /**
                 * Updates the item at the given index with the values in the update
                 * object.
                 *
                 * @param {Number} idx Index of the item to update.
                 * @param {object} update An object containing the updated data for
                 *  the item.
                 */
                var updateItem = function updateItem(idx, update) {
                  var
                    isValidIdx = angular.isNumber(idx) && idx >= 0 && idx < order.items.length,
                    isValidUpdate = update && angular.isObject(update);

                  if (!isValidIdx) {
                    throw 'OrderService.updateItem: Invalid index';
                  }

                  if (!isValidUpdate) {
                    throw 'OrderService.updateItem: Invalid update values';
                  }

                  var existingItem = order.items[idx];

                  if (!angular.equals(existingItem, update)) {
                    angular.extend(existingItem, update);
                    // Broadcast updateItem event
                    $rootScope.$broadcast('OrderService.updateItem', existingItem);
                  }
                };


                /**
                 * Removes the item at the given index from the list.
                 * @param {Number} idx The index of the item to be removed in the
                 *    order.items list.
                 * @return {object} The removed item.
                 */
                var removeItem = function removeItem(idx) {
                  var isValidIdx = angular.isNumber(idx) && order.items[idx];

                  if (!isValidIdx) { return; }

                  var removedItem = order.items.splice(idx, 1);

                  // Broadcast removeItem event
                  $rootScope.$broadcast('OrderService.removeItem', removedItem, idx);

                  return removedItem;
                };


                /**
                 * Calculates the total amount of the order.
                 */
                var getOrderTotal = function getOrderTotal() {
                  var total = 0;
                  for (var idx in order.items) {
                    total += getItemTotal(order.items[idx]);
                  }

                  return total;
                };


                /**
                 * Returns the length of the items array (total of item types
                 * in the order).
                 * @return {Number}
                 */
                var getItemsCount = function getItemsCount() {
                  return order.items.length;
                };


                /**
                 * Returns the total quantity of items in the order (sum of
                 * quantities of all items).
                 * @return {Number}
                 */
                var getItemsQuantity = function getItemsQuantity() {
                  var qty = 0;
                  for (var idx in order.items) {
                    qty += (order.items[idx].qty || 0);
                  }
                  return qty;
                };


                // ============================================
                // Exposed properties and methods
                // ============================================

                this.order = order;
                this.isValid = isValid;
                this.register = register;
                this.list = list;
                this.read = read;
                this.cancel = cancel;
                this.save = save;
                this.clear = clear;
                this.getOrderTotal = getOrderTotal;
                this.handleItem = handleItem;
                this.addItem = addItem;
                this.updateItem = updateItem;
                this.removeItem = removeItem;
                this.getItemsCount = getItemsCount;
                this.getItemsQuantity = getItemsQuantity;



                // ===========================================
                // Helpers
                // ===========================================
                
                // Item handling helpers /////////////////////
                
                /**
                 * Checks if the given item is a voucher.
                 * @param {object} item
                 * @return {boolean}
                 */
                function itemIsVoucher(item) {
                  return item && item.type === 'voucher';
                }


                /**
                 * Checks if the given item is a giftCard.
                 * @param {object} item
                 * @return {boolean}
                 */
                function itemIsGiftCard(item) {
                  return item && item.type === 'giftCard';
                }


                /**
                 * Checks if the given item is a product.
                 * @param {object} item
                 * @return {boolean}
                 */
                function itemIsProduct(item) {
                  // Assuming its a product since it has a SKU
                  return item && angular.isDefined(item.SKU);
                }


                /**
                 * Gets the position of a product within the order by its SKU.
                 * @return {Number} The index of the given product in the items array
                 *  or -1 if the product is not in the order.
                 */
                function getProductIndex(SKU) {
                  var item;
                  for (var idx in order.items) {
                    item = order.items[idx];
                    if (item.SKU && item.SKU === SKU) {
                      return parseInt(idx);
                    }
                  }
                  return -1;
                }


                /**
                 * Returns the index of the voucher item in the order.
                 * NOTE: there should be only one voucher item in the order at
                 * any moment.
                 *
                 * @return {Number} The index of the voucher item or -1 if there's no
                 *  voucher in the order.
                 */
                function getVoucherIndex() {
                  var item;
                  for (var idx in order.items) {
                    if (order.items[idx].type === 'voucher') {
                      return parseInt(idx);
                    }
                  }
                  return -1;
                }


                /**
                 * Adds the gift card to the order.
                 * @param {object} giftCard
                 */
                // FIXME: I think this function could be smarter,
                // handling updates and removals, but it would mean
                // adding some sort of code or id to giftCards.
                function handleGiftCard(giftCard) {
                  if (giftCard && giftCard.price) {
                    addItem(giftCard);
                  }
                  console.log(order.items);
                }


                /**
                 * Adds or updates the voucher in the order.
                 * @param {object} voucher
                 */
                function handleVoucher(voucher) {
                  var
                    voucherIdx = getVoucherIndex(),
                    voucherInOrder = ~voucherIdx;

                  // Remove existing voucher
                  if (voucherInOrder) {
                    voucher.price ?
                      updateItem(voucherIdx, voucher) :
                      removeItem(voucherIdx);
                  } else if (voucher.price) {
                    addItem(voucher);
                  }
                }


                /**
                 * Adds, updates or removes products from the order based on
                 * the context.
                 * @param {object} product
                 */
                // Implements the logic previously defined in AddToBasketCtrl.
                function handleProduct(product) {
                  var
                    productIdx = getProductIndex(product.SKU),
                    productInOrder = ~productIdx;

                  if (productInOrder) {
                    product.qty ?
                      // Update existing item to new qty or...
                      updateItem(productIdx, product) :
                      // remove item if qty is 0
                      removeItem(productIdx);
                  } else if (product.qty) {
                    addItem(product);
                  }
                }


                // Total calculation helpers //////////////////

                /**
                 * Gets the price for an item.
                 * @param {object} item The item we want to know the price for.
                 * @return {Number}
                 */
                // FIXME: can't we normalize the attr name for price and
                // get rid of this function?
                function getItemPrice(item) {
                  var price = 0;

                  if (angular.isDefined(item.price)) {
                    price = item.price;
                  }

                  if (angular.isDefined(item.amount)) {
                    price = item.amount;
                  }

                  return price;
                }


                /**
                 * Gets the total price for an item.
                 * @param {object} item The item for which the total should be
                 *  calculated.
                 * @return {Number}
                 */
                function getItemTotal(item) {
                  return getItemPrice(item) * item.qty;
                }



                // Other helpers //////////////////////////////

                /**
                 * Checks if the given item is valid.
                 * @param {object} item The item to be checked.
                 * @return {boolean}
                 */
                // FIXME: it would be easier to debug if we threw an exception
                //  for each test instead of returning a boolean. We loose flexibility
                //  but it gets much easier to debug.
                function validateItem(item) {
                  return item &&
                    angular.isObject(item) &&
                    angular.isDefined(item.qty) &&
                    (angular.isDefined(item.amount) || angular.isDefined(item.price));
                }


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
                 * 
                 * @param {*} val Value to be checked.
                 */
                function isBoolean(val) {
                    return val === true || val === false;
                }

                /**
                 * Checks if the given id is a valid customer id.
                 * 
                 * @param {*} id The customer id to be validated.
                 */
                function isValidCustomerId(id) {
                    // Customer Id should be a number and there should be a user
                    // with such id
                    var result = false;
                    if (angular.isNumber(id)) {
                        // FIXME - Validate if is a real entityId
                        // for (var ix in customers) {
                        // if (customers[ix].id === id) {
                        // return true;
                        // }
                        // }
                        result = true;
                    }
                    return result;
                }

                /**
                 * Checks if the given array contains only valid items.
                 * 
                 * @param {*} items Array of items to validate.
                 */
                // FIXME: implement proper items validation
                function areValidItems(items) {
                    return angular.isArray(items) && items.length > 0;
                }


                //////////////////////////////////////////////
                // Event handling
                function triggerOrderItemsChanged() {
                  $rootScope.$broadcast('OrderService.orderItemsChanged');
                }

                $rootScope.$on('OrderService.addItem', triggerOrderItemsChanged);
                $rootScope.$on('OrderService.removeItem', triggerOrderItemsChanged);
                $rootScope.$on('OrderService.updateItem', triggerOrderItemsChanged);
                $rootScope.$on('OrderService.clear', triggerOrderItemsChanged);
            });
}(angular));
