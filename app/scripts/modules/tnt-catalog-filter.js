(function(angular) {
    'use strict';
    
    angular.module('tnt.catalog.filter', [
        'tnt.catalog.filter.findBy', 'tnt.catalog.filter.sum', 'tnt.catalog.filter.paymentType'
    ]);
}(angular));