(function(angular) {
    'use strict';

    angular.module('tnt.catalog.card.config.entity', []).factory('CardConfig', function CardConfig() {

        var service = function svc(uuid, ccDaysToExpire, ccOpRate1Installment, ccOpRate26Installment, ccOpRate712Installment, ccClosingDate, ccExpirationDate, dcDaysToExpire, dcOpRate) {

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

            if (arguments.length !== svc.length) {
                if (arguments.length === 1 && angular.isObject(arguments[0])) {
                    svc.prototype.isValid.apply(arguments[0]);
                    ObjectUtils.dataCopy(this, arguments[0]);
                } else {
                    throw 'CardConfig must be initialized with uuid';
                }
            } else {
                this.uuid = uuid;
                this.ccDaysToExpire = ccDaysToExpire;
                this.ccOpRate1Installment = ccOpRate1Installment;
                this.ccOpRate26Installment = ccOpRate26Installment;
                this.ccOpRate712Installment = ccOpRate712Installment;
                this.ccClosingDate = ccClosingDate;
                this.ccExpirationDate = ccExpirationDate;
                this.dcDaysToExpire = dcDaysToExpire;
                this.dcOpRate = dcOpRate;
            }
        };
        return service;
    });

    angular.module(
        'tnt.catalog.card.config.keeper',
        [
        'tnt.utils.array', 'tnt.catalog.journal.entity', 'tnt.catalog.journal.replayer',
        'tnt.catalog.journal.keeper', 'tnt.catalog.keeper'
    ]).service(
         'CardConfigKeeper',
        [
        '$q', 'Replayer', 'JournalEntry', 'JournalKeeper', 'ArrayUtils', 'CardConfig', 'IdentityService', CardConfigKeeper
    ])
        .run(['MasterKeeper',function(MasterKeeper){
            ObjectUtils.inherit(CardConfigKeeper, MasterKeeper);
        }]);
    
    function CardConfigKeeper($q, Replayer, JournalEntry, JournalKeeper, ArrayUtils, CardConfig, IdentityService) {

        var type = 20;
        var cardConfigCounter = 0;
        var currentEventVersion = 1;
        var cardConfigs = [];
        this.handlers = {};
       
        ObjectUtils.superInvoke(this, 'CardConfig', CardConfig, currentEventVersion);

        ObjectUtils.ro(this.handlers, 'cardConfigAddV1', function(cardConfig) {
            var eventData = IdentityService.getUUIDData (cardConfig.uuid);

            if (eventData.deviceId === IdentityService.getDeviceId ()) {
                cardConfigCounter = cardConfigCounter >= eventData.id ? cardConfigCounter : eventData.id;
            }
            cardConfigs.push(cardConfig);
            return cardConfig.uuid;
        });

        ObjectUtils.ro(this.handlers, 'cardConfigUpdateV1', function (cardConfig) {
            var cardConfigEntry = ArrayUtils.find(cardConfigs, 'uuid', cardConfig.uuid);
            if (cardConfigEntry) {
                cardConfig = angular.copy(cardConfig); 
                delete cardConfig.uuid;
                angular.extend(cardConfigEntry, cardConfig);
            } else {
                throw 'Unable to find an card config with uuid=\'' + cardConfig.uuid + '\'';
            }
            return cardConfigEntry.uuid;
        });

        ObjectUtils.ro(this.handlers, 'nukeCardConfigsV1', function () {
            cardConfigs.length = 0;
            return true;
        });
        
        Replayer.registerHandlers(this.handlers);

        function getNextId( ) {
            return ++cardConfigCounter;
        }
        
        this.add = function(cardConfig) {
            if (!(cardConfig instanceof this.eventType)) {
                return $q.reject('Wrong instance of CardConfig');
            }
            
            cardConfig.uuid = IdentityService.getUUID(type, getNextId());
            
            return this.journalize('Add', cardConfig);
        };

        this.update = function (cardConfig) {
            if (!(cardConfig instanceof this.eventType)) {
                return $q.reject('Wrong instance of CardConfig');
            }
            return this.journalize('Update', cardConfig);
        };
        
        this.list = function () {
            return angular.copy(cardConfigs);
        };
    }
    
    angular.module(
         'tnt.catalog.card.config',
        [
        'tnt.catalog.card.config.entity', 'tnt.catalog.card.config.keeper'
    ])
        .run(['CardConfigKeeper', function (CardConfigKeeper) {}]);

}(angular));