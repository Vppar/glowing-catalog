(function(angular) {
    'use strict';
    
    angular.module(
		 'tnt.catalog.subscription.service', 
		[
		 'tnt.catalog.subscription'
		]).service(
         'SubscriptionService',
        [
         '$q', 'logger', 'SubscriptionKeeper',
         function SubscriptionService($q, logger, SubscriptionKeeper) {

             this.isValid = function(subscription) {
                 var invalidProperty = {};
                 invalidProperty.planId = angular.isDefined(subscription.planId);
                 invalidProperty.date = angular.isDefined(subscription.date);
                 invalidProperty.userId = angular.isDefined(subscription.userId);
                 invalidProperty.status = angular.isDefined(subscription.status);

                 var result = [];
                 
                 for ( var ix in invalidProperty) {
                     if (!invalidProperty[ix]) {
                         var error = {};
                         error[ix] = subscription[ix];
                         result.push(error);
                     }
                 }

                 return result;
            };        	 
        	 
			this.add = function add(subscription) {
                var result = this.isValid(subscription);
                
                if (result.length === 0) {
                	return SubscriptionKeeper.add(subscription);
                } 
                else {
                    return $q.reject(result);
                }
			};
			
			this.list = function list( userId, status ){
				return SubscriptionKeeper.list(userId, status);
			};
         }
        ]);
})(angular);
