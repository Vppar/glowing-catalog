(function (angular) {
    'use strict';

    angular
        .module('tnt.catalog.card.config.entity', [])
        .factory(
            'CardConfig',
            function CardConfig () {

                var service =
                    function svc (uuid) {
                        var validProperties = 
                            [
                                'uuid',
                                'ccDaysToExpire', 
                                'ccOpRate1Installment', 
                                'ccOpRate26Installment', 
                                'ccOpRate712Installment', 
                                'ccClosingDate', 
                                'ccExpirationDate', 
                                'dcDaysToExpire', 
                                'dcOpRate'
                            ];

                        ObjectUtils.method(svc, 'isValid', function () {
                            for ( var ix in this) {
                                var prop = this[ix];

                                if (!angular.isFunction(prop)) {
                                    if (validProperties.indexOf(ix) === -1) {
                                        throw 'Unexpected property ' + ix;
                                    }
                                }
                            }
                        });

                        if (arguments.length !== svc.length) {
                            if (arguments.length === 1 && angular.isObject(arguments[0])) {
                                svc.prototype.isValid.apply(arguments[0]);
                                ObjectUtils.dataCopy(this, arguments[0]);
                            } else {
                                throw 'CardConfig must be initialized with uuid';
                            }
                        } else {
                            this.uuid = uuid;
                        }

                        ObjectUtils.ro(this, 'uuid', this.uuid);
                    };
                return service;
            });

    /**
     * The keeper for the current entity
     */
    angular.module(
        'tnt.catalog.card.config.keeper',
        [
            'tnt.utils.array',
            'tnt.catalog.journal.entity',
            'tnt.catalog.journal.replayer',
            'tnt.catalog.card.config.entity',
            'tnt.catalog.journal.keeper',
            'tnt.identity'
        ]).service(
        'CardConfigKeeper',
        [
            '$q',
            'Replayer',
            'JournalEntry',
            'JournalKeeper',
            'ArrayUtils',
            'CardConfig',
            'IdentityService',
            function CardConfigKeeper ($q, Replayer, JournalEntry, JournalKeeper, ArrayUtils,
                CardConfig, IdentityService) {

                var type = 99;
                var currentEventVersion = 1;
                var currentCounter = 0;
                var cardConfigs = [];
                this.handlers = {};

                function getNextId () {
                    return ++currentCounter;
                }

                ObjectUtils.ro(this.handlers, 'nukeCardConfigV1', function () {
                    cardConfigs.length = 0;
                    return true;
                });

                ObjectUtils.ro(this.handlers, 'cardConfigCreateV1', function (cardConfig) {

                    var cardConfigData = IdentityService.getUUIDData(cardConfig.uuid);

                    if (cardConfigData.deviceId === IdentityService.getDeviceId()) {
                        currentCounter =
                            currentCounter >= cardConfigData.id ? currentCounter
                                : cardConfigData.id;
                    }
                    cardConfig = new CardConfig(cardConfig);
                    cardConfigs.push(cardConfig);
                    $rootScope.$broadcast('cardConfigCreate');
                    return cardConfig.uuid;
                });

                ObjectUtils.ro(this.handlers, 'cardConfigUpdateV1', function (cardConfig) {
                    var entry = ArrayUtils.find(cardConfigs, 'uuid', cardConfig.uuid);

                    if (entry !== null) {
                        cardConfig = angular.copy(cardConfig);
                        delete cardConfig.uuid;
                        angular.extend(entry, cardConfig);
                        $rootScope.$broadcast('cardConfigUpdate');
                    } else {
                        throw 'CardConfig not found.';
                    }
                    return entry.uuid;
                });

                Replayer.registerHandlers(this.handlers);

                this.create =
                    function (entity) {

                        if (!(entity instanceof CardConfig)) {
                            return $q.reject('Wrong instance to CardConfigKeeper');
                        }

                        var entityObj = angular.copy(entity);

                        entityObj.created = (new Date()).getTime();
                        entityObj.uuid = IdentityService.getUUID(type, getNextId());

                        var cardConfig = new CardConfig(entityObj);

                        var entry =
                            new JournalEntry(
                                null,
                                cardConfig.created,
                                'cardConfigCreate',
                                currentEventVersion,
                                cardConfig);

                        return JournalKeeper.compose(entry);
                    };

                this.update =
                    function (cardConfig) {

                        var stamp = (new Date()).getTime() / 1000;

                        var entry =
                            new JournalEntry(
                                null,
                                stamp,
                                'cardConfigUpdate',
                                currentEventVersion,
                                cardConfig);

                        return JournalKeeper.compose(entry);
                    };

                this.read = function (uuid) {
                    return ArrayUtils.find(this.list(), 'uuid', uuid);
                };

                this.list = function () {
                    return angular.copy(cardConfigs);
                };

            }
        ]);

    angular.module('tnt.catalog.card.config', [
        'tnt.catalog.card.config.entity', 'tnt.catalog.card.config.keeper'
    ]).run(function(CardConfigKeeper) {
        // Warming up CardConfigKeeper
    });

}(angular));