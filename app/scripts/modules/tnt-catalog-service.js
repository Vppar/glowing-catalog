(function(angular) {
    'use strict';
    
    angular.module('tnt.catalog.service', [
        'tnt.catalog.service.data', 'tnt.catalog.service.dialog', 'tnt.catalog.service.order', 'tnt.catalog.service.payment',
        'tnt.catalog.service.sms'
    ]);
}(angular));