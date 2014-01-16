(function(angular) {
    'use strict';

    angular.module('tnt.catalog.type.entity', []).factory('Type', function Stock() {

        var service = function svc(typeId, name) {

            var validProperties = [
                'typeId', 'name'
            ];

            ObjectUtils.method(svc, 'isValid', function() {
                for ( var ix in this) {
                    var prop = this[ix];

                    if (!angular.isFunction(prop)) {
                        if (validProperties.indexOf(ix) === -1) {
                            throw "Unexpected property " + ix;
                        }
                    }
                }
            });

            if (arguments.length != svc.length) {
                if (arguments.length === 1 && angular.isObject(arguments[0])) {
                    svc.prototype.isValid.apply(arguments[0]);
                    ObjectUtils.dataCopy(this, arguments[0]);
                } else {
                    throw 'Type must be initialized with typeId and name';
                }
            } else {
                this.typeId = typeId;
                this.name = name;
            }
            ObjectUtils.ro(this, 'typeId', this.typeId);
            ObjectUtils.ro(this, 'name', this.name);
        };

        return service;
    });

    /**
     * The keeper for the current stock
     */
    angular.module('tnt.catalog.type.keeper', [
        'tnt.utils.array'
    ]).service('TypeKeeper', function StockKeeper(Replayer, JournalEntry, JournalKeeper, ArrayUtils, Type) {

        var currentEventVersion = 1;
        var types = [];
        this.handlers = {};

        ObjectUtils.ro(this.handlers, 'typeAddV1', function(event) {
            var entry = ArrayUtils.find(types, 'typeId', event.typeId);

            if (entry === null) {
                event = new Type(event);
                types.push(event);
            }
        });

        
        this.add = function(type) {

            if (type instanceof Type) {
                type.isValid();
            } else {
                throw "Wrong instance";
            }

            var stamp = (new Date()).getTime() / 1000;
            // create a new journal entry
            var entry = new JournalEntry(null, stamp, 'typeAdd', currentEventVersion, type);

            // save the journal entry
            JournalKeeper.compose(entry);
        };
        
        this.list = function() {
            return angular.copy(types);
        };
        
        

    });

    angular.module('tnt.catalog.type', [
        'tnt.catalog.type.entity', 'tnt.catalog.type.keeper'
    ]);

}(angular));