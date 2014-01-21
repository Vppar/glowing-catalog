'use strict';

angular.module('glowingCatalogApp').service('Misplacedservice', function Misplacedservice() {

    function round(number, places) {
        places = places ? places : 2;
        var zeroes = Math.pow(10, places);
        return Math.round(number * zeroes) / zeroes;
    }

    /**
     * @param Number - The total amount
     * @param Number - The amount for the first installment
     * @param Number - The total installment count
     */
    this.calc = function(total, first, count) {

        if (first > total) {
            throw 'r u mad?';
        }

        var installments = [
            first
        ];
        var gone = first;

        for ( var i = 1; i < count; i++) {
            installments[i] = round((total - gone) / (count - i));
            gone = round(gone + installments[i]);
        }
        return installments;
    };

    /**
     * @param Number - The total amount
     * @param Number - The installment being edited
     * @param Array - The installments
     */
    this.recalc = function(total, current, installments) {

        var gone = 0;

        for ( var ix in installments) {

            if (ix > current) {
                installments[ix] = round((total - gone) / (installments.length - ix));
            }
            gone = round(gone + installments[ix]);
        }

        return installments;
    };

});
