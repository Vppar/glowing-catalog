'use strict';

angular.module('tnt.catalog.misplaced.service',[]).service('Misplacedservice', function Misplacedservice() {

    function round(number, places) {
        places = places ? places : 2;
        var zeroes = Math.pow(10, places);
        return Math.round(number * zeroes) / zeroes;
    }

    /**
     * @param Number - The total amount
     * @param Number - The installment being edited
     * @param Array - The installments
     */
    this.recalc = function(total, current, installments, propertyName) {

        var gone = 0;

        for ( var ix in installments) {

            if (ix > current) {
                installments[ix][propertyName] = round((total - gone) / (installments.length - ix));
            }
            gone = round(gone + installments[ix][propertyName]);
        }

        return installments;
    };

});
