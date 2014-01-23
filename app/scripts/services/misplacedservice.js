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

});
