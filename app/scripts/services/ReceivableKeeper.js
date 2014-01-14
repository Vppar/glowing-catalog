(function(angular) {
    'use strict';

    angular.module('tnt.catalog.receivable.entity', []).factory('Receivable', function Receivable() {

        var service = function svc(title, document) {

            if (arguments.length != svc.length) {
                if (arguments.length === 1 && angular.isObject(arguments[0])) {
                    svc.prototype.isValid.apply(arguments[0]);
                    ObjectUtils.dataCopy(this, arguments[0]);
                } else {
                    throw 'Receivable must be initialized with title and document';
                }
            } else {
                this.title = title;
                this.document = document;
                this.canceled = false;
            }

            ObjectUtils.ro(this, 'id', this.id);
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