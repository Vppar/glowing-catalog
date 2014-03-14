(function(angular) {
    'use strict';

    angular.module('tnt.catalog.type.entity', []).factory('Type', function Stock() {

        var service = function svc(id, name, classification) {

            var validProperties = [
                'id', 'name', 'classification'
            ];

            ObjectUtils.method(svc, 'isValid', function() {
                for ( var ix in this) {
                    var prop = this[ix];

                    if (!angular.isFunction(prop)) {
                        if (validProperties.indexOf(ix) === -1) {
                            throw 'Unexpected property ' + ix;
                        }
                    }
                }
            });

            if (arguments.length != svc.length) {
                if (arguments.length === 1 && angular.isObject(arguments[0])) {
                    svc.prototype.isValid.apply(arguments[0]);
                    ObjectUtils.dataCopy(this, arguments[0]);
                } else {
                    throw 'Type must be initialized with typeId, name and classification';
                }
            } else {
                this.id = id;
                this.name = name;
                this.classification = classification;
            }
            ObjectUtils.ro(this, 'id', this.id);
            ObjectUtils.ro(this, 'name', this.name);
            ObjectUtils.ro(this, 'classification', this.classification);
        };

        return service;
    });

    /**
     * The keeper for the current stock
     */
    angular.module('tnt.catalog.type.keeper', [
        'tnt.utils.array', 'tnt.catalog.journal.entity', 'tnt.catalog.journal.replayer', 'tnt.catalog.journal.keeper'
    ]).service(
            'TypeKeeper',
            [
                'Replayer', 'JournalEntry', 'JournalKeeper', 'ArrayUtils', 'Type',
                function TypeKeeper(Replayer, JournalEntry, JournalKeeper, ArrayUtils, Type) {

                    var currentEventVersion = 1;
                    var types = {
                        document : [
                            {
                                name : 'Pedido',
                                id : 1
                            }, {
                                name : 'Cheque',
                                id : 2
                            }, {
                                name : 'Contas a recebe',
                                id : 3
                            }
                        ],
                        classification : [
                            {
                                name : 'vendas de produtos',
                                id : 1
                            }, {
                                name : 'receitas diversas',
                                id : 2
                            }, {
                                name : 'acrescimo s/ recebimentos',
                                id : 3
                            }
                        ],
                        purchaseOrderStatus : [
                            {
                                name : 'pending',
                                id : 1
                            }, {
                                name : 'canceled',
                                id : 2
                            }, {
                                name : 'partiallyReceived',
                                id : 3
                            }, {
                                name : 'received',
                                id : 4
                            }, {
                                name : 'confirmed',
                                id : 5
                            },
                        ],
                    };
                    this.handlers = {};

                    ObjectUtils.ro(this.handlers, 'typeAddV1', function(event) {

                        var classList = types[event.classification];

                        // if classification list not exists, create one!
                        if (!classList) {
                            types[event.classification] = [];
                        }

                        var entry = ArrayUtils.find(types[event.classification], 'id', event.id);

                        if (entry === null) {

                            var type = new Type(types[event.classification].length, event.name, event.classification);
                            types[event.classification].push(type);

                        } else {
                            throw 'Somehow, we got a repeated type!?!?';
                        }

                    });

                    /**
                     * Registering the handlers with the Replayer
                     */
                    Replayer.registerHandlers(this.handlers);

                    this.add = function(type) {

                        if (!(type instanceof Type)) {
                            throw 'Wrong instance to TypeKeeper';
                        }

                        var stamp = (new Date()).getTime() / 1000;
                        // create a new journal entry
                        var entry = new JournalEntry(null, stamp, 'typeAdd', currentEventVersion, type);

                        // save the journal entry
                        return JournalKeeper.compose(entry);
                    };

                    this.list = function(classification) {
                        return angular.copy(types[classification]);
                    };

                }
            ]);

    angular.module('tnt.catalog.type', [
        'tnt.catalog.type.entity', 'tnt.catalog.type.keeper'
    ]);

}(angular));
