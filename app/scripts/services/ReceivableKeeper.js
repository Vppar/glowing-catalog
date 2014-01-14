(function(angular) {
    'use strict';

    angular.module('tnt.catalog.receivable.entity', []).factory('Receivable', function Receivable() {
        // AngularJS will instantiate a singleton by calling "new" on this
        // function
    });
    angular.module('tnt.catalog.receivable.keeper', [
        'tnt.utils.array'
    ]).service('ReceivableKeeper', function ReceivableKeeper() {
        // AngularJS will instantiate a singleton by calling "new" on this
        // function
    });
}(angular));