(function(angular) {
    'use strict';

    angular.module('tnt.catalog.receivable.entity', []).factory('Receivable', function Receivable() {

        var service = function svc(){
        };
        
        return service;
    });
    angular.module('tnt.catalog.receivable.keeper', [
        'tnt.utils.array'
    ]).service('ReceivableKeeper', function ReceivableKeeper(Receivable) {
        // AngularJS will instantiate a singleton by calling "new" on this
        // function
    });
}(angular));