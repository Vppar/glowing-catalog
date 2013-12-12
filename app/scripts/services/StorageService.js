(function(angular, _undefined) {
    'use strict';

    angular.module('tnt.catalog.service.storage', [
        'tnt.catalog.service.data'
    ]).service('StorageService', function StorageService($log, DataProvider) {

        // Easy the access to DataProvider service.
        var data = DataProvider;

        /**
         * Function to return the next unique id.
         * 
         * @param name - Storage name
         * @return Id - Next id
         */
        var getNextId = function getNextId(name) {
            var storage = data[name];
            var nextId = _undefined;
            if (storage) {
                nextId = 0;
                for ( var idx in storage) {
                    var entity = storage[idx];
                    if (entity.id > nextId) {
                        nextId = entity.id;
                    }
                }
                nextId++;
            } else {
                $log.error('StorageService.getNextId: -Invalid storage, name=' + name);
            }
            return nextId;
        };

        this.getNextId = getNextId;
    });
}(angular));