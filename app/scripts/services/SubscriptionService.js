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
                 invalidProperty.planType = angular.isDefined(subscription.planType);
                 invalidProperty.subscriptionDate = angular.isDefined(subscription.subscriptionDate);
                 invalidProperty.consultant = angular.isDefined(subscription.consultant);

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
         }
        ]);
})(angular);
