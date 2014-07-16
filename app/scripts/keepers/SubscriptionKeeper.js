(function(angular) {
    'use strict';

    angular.module('tnt.catalog.subscription.entity', []).factory('Subscription', function Subscription() {

        var service = function svc(uuid, planType, subscriptionDate, consultant) {

            var validProperties = [
                'uuid', 'planType', 'subscriptionDate', 'consultant'
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
                    throw 'Subscription must be initialized with plan, subscriptionDate and userId';
                }
            } else {
            	this.uuid = uuid; 
                this.planType = planType;
                this.subscriptionDate = subscriptionDate;
                this.consultant = consultant;
            }
        };
        return service;
    });

    angular.module(
    	'tnt.catalog.subscription.keeper', 
    	[
    	  'tnt.utils.array', 'tnt.catalog.journal.entity', 'tnt.catalog.journal.replayer', 
    	  'tnt.catalog.journal.keeper', 'tnt.catalog.keeper'
    	]).service(
    	  'SubscriptionKeeper', 
    	[
    	 '$q', 'Replayer', 'JournalEntry', 'JournalKeeper', 'ArrayUtils', 'Subscription', 'IdentityService', SubscriptionKeeper
    	 ])
    	.run(['MasterKeeper',function(MasterKeeper){
    		ObjectUtils.inherit(SubscriptionKeeper, MasterKeeper);
    	}]);
    
    function SubscriptionKeeper($q, Replayer, JournalEntry, JournalKeeper, ArrayUtils, Subscription, IdentityService) {

    	var type = 20;
    	var subscriptionCounter = 0;
        var currentEventVersion = 1;
        var subscriptions = [];
        this.handlers = {};
       
        ObjectUtils.superInvoke(this, 'Subscription', Subscription, currentEventVersion);

        ObjectUtils.ro(this.handlers, 'subscriptionAddV1', function(event) {
    		var eventData = IdentityService.getUUIDData (event.uuid);
    		
    		if (eventData.deviceId === IdentityService.getDeviceId ()) {
    			subscriptionCounter = subscriptionCounter >= eventData.id ? subscriptionCounter : eventData.id;
    		}
            subscriptions.push(event);
            return event.uuid;
        });

        ObjectUtils.ro(this.handlers, 'nukeSubscriptionsV1', function () {
        	subscriptions.length = 0;
            return true;
        });
        
        Replayer.registerHandlers(this.handlers);

        function getNextId( ) {
            return ++subscriptionCounter;
        }       
        
        this.add = function(subscription) {
            if (!(subscription instanceof this.eventType)) {
              return $q.reject('Wrong instance of Subscription');
            }
            
            subscription.uuid = IdentityService.getUUID(type, getNextId());
            
            return this.journalize('Add', subscription);
        };
        
        this.list = function list() {
            return angular.copy(subscriptions);
        };        
    }
    
    angular.module(
    	'tnt.catalog.subscription', 
    	[
    	 'tnt.catalog.subscription.entity', 'tnt.catalog.subscription.keeper'
    	])
    	.run(['SubscriptionKeeper', function (SubscriptionKeeper) {}]);

}(angular));