(function(angular) {
    'use strict';
    var paymentTypes = [{
        id: 1,
        description: 'cash'
    },{
        id: 2,
        description: 'check'
    },{
        id: 3,
        description: 'creditcard'
    },{
        id: 4,
        description: 'exchange'
    },{
        id: 5,
        description: 'advance'
    }];
    
    angular.module('tnt.catalog.filter.paymentType', [
        'tnt.catalog.filter.findBy'
    ]).filter('paymentType', ['$filter', function($filter) {
        /**
         * Find the first item in the array that the property is an exact match
         * of the informed property. If not found return an empty object.
         */
        return function(array, type, field) {
            var filteredPayments = [];
            var paymentType = $filter('findBy')(paymentTypes, 'description', type);
            for ( var idx in array) {
                var payment = array[idx];
                if (payment.typeId === paymentType.id) {
                    if (field) {
                        filteredPayments.push(payment[field]);
                    } else {
                        filteredPayments.push(payment);
                    }
                }
            }
            return filteredPayments;
        };
    }]);
})(angular);