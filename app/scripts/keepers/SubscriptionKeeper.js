(function(angular) {
    'use strict';

    angular.module('tnt.catalog.subscription.entity', []).factory('Subscription', function Subscription() {

        var service = function svc(planId, date, userId, status) {

            var validProperties = [
                'planId', 'date', 'userId', 'status'
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
                    throw 'Subscription must be initialized with plan, date and userId';
                }
            } else {
                this.planId = planId;
                this.date = date;
                this.userId = userId;
                this.status = status;
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
    	 '$q', 'Replayer', 'JournalEntry', 'JournalKeeper', 'ArrayUtils', 'Subscription', SubscriptionKeeper
    	 ])
    	.run(['MasterKeeper',function(MasterKeeper){
    		ObjectUtils.inherit(SubscriptionKeeper, MasterKeeper);
    	}]);
    
    function SubscriptionKeeper($q, Replayer, JournalEntry, JournalKeeper, ArrayUtils, Subscription) {

        var currentEventVersion = 1;
        var subscriptions = [];
        this.handlers = {};
       
        ObjectUtils.superInvoke(this, 'Subscription', Subscription, currentEventVersion);

        ObjectUtils.ro(this.handlers, 'subscriptionAddV1', function(event) {
            var event = new Subscription(event);
            subscriptions.push(event);
            return event.userId;
        });
        
        ObjectUtils.ro(this.handlers, 'nukeSubscriptionsV1', function () {
        	subscriptions.length = 0;
            return true;
        });
        
        Replayer.registerHandlers(this.handlers);

        this.add = function(subscription) {

            if (!(subscription instanceof this.eventType)) {
              return $q.reject('Wrong instance of Subscription');
            }
            
            return this.journalize('Add', subscription);
        };

        this.list = function( userId, status ){
        	var result = ArrayUtils.filter(subscriptions , {
        		'userId': userId,
        		'status': status
        	});
        	
        	return angular.copy(result);
        };
    }
    
    angular.module(
    	'tnt.catalog.subscription', 
    	[
    	 'tnt.catalog.subscription.entity', 'tnt.catalog.subscription.keeper'
    	])
    	.run(['SubscriptionKeeper', function (SubscriptionKeeper) {}]);

}(angular));
