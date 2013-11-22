(function(angular) {
    'use strict';
    angular.module('tnt.catalog.filter.paymentType', [
        'tnt.catalog.filter.findBy', 'tnt.catalog.service.data'
    ]).filter('paymentType', function($filter, DataProvider) {
        /**
         * Find the first item in the array that the property is an exact match
         * of the informed property. If not found return an empty object.
         */
        return function(array, type, field) {
            var filteredPayments = [];
            var paymentType = $filter('findBy')(DataProvider.paymentTypes, 'description', type);
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
    });
})(angular);