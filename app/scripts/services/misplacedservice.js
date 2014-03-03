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



    // We could calculate the orderTotal here, but since it should already
    // be calculated in PaymentCtrl, we don't need to calculate it again IMO.
    this.distributeDiscount = function (orderTotal, discountTotal, orderItems) {
      var currTotalDiscount = 0;
      var largestProductIndex = null;
      var largestProductValue = 0;


      for (var idx in orderItems) {
        var item = orderItems[idx];

        if (!orderTotal || !discountTotal) {
          item.discount = 0;
          continue;
        }

        var itemTotal = item.qty * (item.price || item.cost);

        if (itemTotal > largestProductValue) {
          largestProductValue = itemTotal;
          largestProductIndex = idx;
        }

        var itemShare = itemTotal / orderTotal;
        var itemDiscount = Math.round(100 * discountTotal * itemShare) / 100;
        var isLastItem = parseInt(idx) === (orderItems.length - 1);
        var currTotalDiscount = Math.round(100 * (currTotalDiscount + itemDiscount)) / 100;
        var discountDoesNotMatch = currTotalDiscount !== discountTotal;

        item.discount = itemDiscount;

        // Since we're rounding the discounts to the second decimal,
        // in many cases we'll end up with an inconsistency between the
        // given total discount and the sum of all individual discounts
        // of each item. We handle this case by adjusting the value for
        // the last item if needed, not allowing the sum of all discounts
        // to be greater than the given total discount.
        if (isLastItem && discountDoesNotMatch) {
          var discountDiff = discountTotal - currTotalDiscount;
          var largestItem = orderItems[largestProductIndex];
          largestItem.discount = Math.round(100 * (largestItem.discount + discountDiff)) / 100;
        }
      }
    };

});
