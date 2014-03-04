(function(angular) {
    'use strict';

    angular.module('tnt.catalog.service.delivery', [
        'tnt.catalog.service.storage'
    ]).service('DeliveryService', ['StorageService', function DeliveryService(StorageService) {

        /**
         * Storage name of this service.
         */
        var name = 'deliveries';
        
    }]);
}(angular));