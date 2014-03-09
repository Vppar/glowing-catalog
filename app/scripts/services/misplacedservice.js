'use strict';

angular.module('tnt.catalog.misplaced.service', []).service('Misplacedservice', function Misplacedservice() {

    function round(number, places) {
        places = places ? places : 2;
        var zeroes = Math.pow(10, places);
        return Math.round(number * zeroes) / zeroes;
    }

    function floor(number, places) {
        places = places ? places : 2;
        var zeroes = Math.pow(10, places);
        return Math.floor(number * zeroes) / zeroes;
    }

    /**
     * @param Number - The total amount
     * @param Number - The installment being edited
     * @param Array - The installments
     */
    this.recalc = function(total, current, installments, propertyName) {

        var gone = 0;
        var fixed = 0;

        for ( var ix in installments) {

            if (ix > current) {

                fixed = fixed ? fixed : floor((total - gone) / (installments.length - ix));
                var val = 0;

                /*jshint eqeqeq:false */
                // FIXME why does === fails here?
                if (ix == (installments.length - 1)) {
                    val = round(total - gone);
                } else {
                    val = fixed;
                }

                if (val > 0) {
                    installments[ix][propertyName] = val;
                } else {
                    installments[ix][propertyName] = 0;
                }

            }
            gone = round(gone + installments[ix][propertyName]);
        }

        return installments;
    };



    /**
     * Defines most of the logic required to handle discounts in the app.
     */
    this.discount = (function () {

        /**
         * Gets the total cost of a single item.
         * @param {object} item The item for which you want to know the
         *    total value.
         * @return {number}
         * @private
         */
        function _getItemTotal(item) {
            if (!item) { return 0; }
            var qty = item.qty;
            var cost = item.cost || item.price || item.amount;
            return qty * cost;
        }

        /**
         * Gets the total cost of a list of items.
         * @param {Array<object>} items The list of items for which the total
         *    should be calculated.
         * @param {function?} getTotal The function used to get the total value
         *    of each item. This function will be called once for each item.
         * @return {number}
         * @private
         */
        function _getItemsTotal(items, getTotal) {
            if (!items) { return 0; }

            getTotal = getTotal || _getItemTotal;

            var total = 0;

            for (var idx in items) {
                total += getTotal(items[idx]);
            }

            return total;
        }


        /**
         * Some float operations create slight innaccuracies in values.
         * This should normalize them.
         * @param {number} value The value to normalize.
         * @return {number} Normalized value.
         * @private
         */
        function _normalizeDecimals(value) {
            return Math.round(100 * value) / 100;
        }


        /**
         * Distributes a given value accross all items based on their ratio to
         * the total value (weighted distribution).
         * @param {Array<object>} items The items ammong which the value
         *    should be distributed accross.
         * @param {number} value The value to be distributed.
         * @param {function?} getTotal The function used to get the total value
         *    of each item. This function will be called once for each item.
         * @return {Array} An array of distributed values (first item is the
         *    weighted value of the first item, and so on).
         */
        function distributeByWeight(items, value, getTotal) {
            getTotal = getTotal || _getItemTotal;

            var total = _getItemsTotal(items, getTotal);
            var largestItemIndex = null;
            var largestItemTotal = 0;
            var tmpValue = 0;

            var weightedValues = [];

            for (var idx in items) {
                var item = items[idx];

                var itemTotal = getTotal(item);

                if (largestItemIndex === null || itemTotal > largestItemTotal) {
                    largestItemIndex = parseInt(idx);
                    largestItemTotal = itemTotal;
                }

                var itemRatio = itemTotal / total;
                var itemValue = _normalizeDecimals(value * itemRatio);
                var tmpValue = _normalizeDecimals(tmpValue + itemValue);

                weightedValues.push(itemValue);

                var isLastItem = parseInt(idx) === items.length - 1;
                var valueDoesNotMatch = tmpValue !== value;

                // Since we're rounding the values to the second decimal,
                // in many cases we'll end up with an inconsistency between the
                // given total value and the sum of all individual values
                // of each item. We handle this case by adjusting the value for
                // the largest item if needed, not allowing the sum of all values
                // to be greater or lower than the given total value.
                if (isLastItem && valueDoesNotMatch) {
                    var valuesDiff = value - tmpValue;
                    var largestValue = weightedValues[largestItemIndex];
                    weightedValues[largestItemIndex] = _normalizeDecimals(largestValue + valuesDiff);
                }
            }

            return weightedValues;
        }


        /**
         * Sets the item specific discount for the given item and unsets
         * its order discount.
         *
         * @param {object} item Item to which the specific discount is being
         *    given.
         * @param {number} discount The item-specific discount.
         */
        function setItemDiscount(item, discount) {
            if (discount || discount === 0) {
                item.itemDiscount = discount;
                unsetOrderDiscount(item);
            } else {
                unsetItemDiscount(item);
            }
        }


        /**
         * Unsets item discount in the given item.
         */
        function unsetItemDiscount(item) {
            delete item.itemDiscount;
        }


        /**
         * Sets the order discount for the given item and unsets
         * its item-specific discount.
         *
         * @param {object} item Item to which the order discount is being
         *    given.
         * @param {number} discount The share of the order discount given to
         *    the given item.
         */
        function setOrderDiscount(item, discount) {
            if (discount || discount === 0) {
                item.orderDiscount = discount;
                unsetItemDiscount(item);
            } else {
                unsetOrderDiscount(item);
            }
        }


        /**
         * Unsets the order discount from the given item.
         */
        function unsetOrderDiscount(item) {
            delete item.orderDiscount;
        }


        /**
         * Distributes the given item-specific discount accross the given
         * items.
         *
         * @param {Array<object>} items Array of items the discount should
         *    be distributed accross.
         * @param {number} discount The discount being distributed.
         */
        function distributeItemDiscount(items, discount) {
            var weightedDiscounts = distributeByWeight(items, discount);

            for (var idx in items) {
                setItemDiscount(items[idx], weightedDiscounts[idx]);
            }
        }


        /**
         * Distributes the given order discount accross the given items.
         * BEWARE!!! This will remove any item-specific discounts from the
         * given items. It's not this function's responsibility to check
         * for item-specific items in the list!
         *
         * @param {Array<object>} items Array of items the discount should
         *    be distributed accross.
         * @param {number} discount The discount being distributed, this will
         *    probably always be a list containing all items that DO NOT have
         *    item-specific discounts applied to them.
         */
        function distributeOrderDiscount(items, discount) {
            var weightedDiscounts = distributeByWeight(items, discount);

            for (var idx in items) {
                setOrderDiscount(items[idx], weightedDiscounts[idx]);
            }
        }



        /**
         * Gets all items that have an item discount applied to them from
         * the given list of items.
         * @param {Array<object>} items List of items to filter.
         * @return {Array<object>}
         */
        function getItemsWithItemDiscount(items) {
            var itemsWithDiscount = [];

            for (var idx in items) {
                var item = items[idx];
                item.itemDiscount && itemsWithDiscount.push(item);
            }

            return itemsWithDiscount;
        }


        // FIXME doc && test
        function getItemsWithoutItemDiscount(items) {
          var items = [];

          for (var idx in items) {
              var item = items[idx];
              if (!item.itemDiscount) {
                  items.push(item);
              }
          }

          return items;
        }


        /**
         * Gets all items that have an order discount applied to them from
         * the given list of items.
         * @param {Array<object>} items List of items to filter.
         * @return {Array<object>}
         */
        function getItemsWithOrderDiscount(items) {
            var itemsWithDiscount = [];

            for (var idx in items) {
                var item = items[idx];
                item.orderDiscount && itemsWithDiscount.push(item);
            }

            return itemsWithDiscount;
        }


        /**
         * Sums the item discounts of all items in the list.
         * @param {Array<object>} items List of items to filter.
         * @return {number} Total item discount from all given items.
         */
        function getTotalItemDiscount(items) {
            var discount = 0;

            for (var idx in items) {
                discount += items[idx].itemDiscount || 0;
            }

            return _normalizeDecimals(discount);
        }


        /**
         * Sums the order discount of all items in the list.
         * @param {Array<object>} items List of items to filter.
         * @return {number} Total order discount from all given items.
         */
        function getTotalOrderDiscount(items) {
            var discount = 0;

            for (var idx in items) {
                discount += items[idx].orderDiscount || 0;
            }

            return _normalizeDecimals(discount);
        }


        /**
         * Sums the total discount of all items in the list. This sums
         * all discounts, both item-specific and order discounts.
         * @param {Array<object>} items List of items to filter.
         * @return {number} Total order discount from all given items.
         */
        function getTotalDiscount(items) {
            var discount = 0;

            for (var idx in items) {
                var item = items[idx];
                discount += (item.itemDiscount || item.orderDiscount || 0);
            }

            return _normalizeDecimals(discount);
        }



        return {
            // These are being exposed just as a convenience. They should
            // be placed somewhere else, where they make more sense, like
            // the OrderService (not sure).
            _getItemTotal : _getItemTotal,
            _getItemsTotal : _getItemsTotal,

            distributeByWeight : distributeByWeight,
            distributeItemDiscount : distributeItemDiscount,
            distributeOrderDiscount : distributeOrderDiscount,

            getItemsWithItemDiscount : getItemsWithItemDiscount,
            getItemsWithOrderDiscount : getItemsWithOrderDiscount,

            getItemsWithoutItemDiscount : getItemsWithoutItemDiscount,

            getTotalItemDiscount : getTotalItemDiscount,
            getTotalOrderDiscount : getTotalOrderDiscount,
            getTotalDiscount : getTotalDiscount,

            setItemDiscount : setItemDiscount,
            setOrderDiscount : setOrderDiscount,

            unsetItemDiscount : unsetItemDiscount,
            unsetOrderDiscount : unsetOrderDiscount
        };
    })();

});
