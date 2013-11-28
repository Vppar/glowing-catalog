(function(angular) {
    'use strict';
    
    angular.module('tnt.catalog.payment', [
        'tnt.catalog.payment.add', 'tnt.catalog.payment.check', 'tnt.catalog.payment.creditcard', 'tnt.catalog.payment.exchange'
    ]);
}(angular));