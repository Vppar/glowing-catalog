(function(angular) {
    'use strict';

    angular.module(
    		'tnt.catalog.subscription.ctrl', 
    		[
    		 'tnt.catalog.user', 'tnt.catalog.service.dialog', 'tnt.catalog.consultant.service', 'tnt.catalog.consultant', 
    		 'tnt.catalog.subscription.service', 'tnt.catalog.subscription'
    		]).controller(
    		 'SubscriptionCtrl', 
    		[
    		 '$scope', '$log', '$location', 'DataProvider', 'ConsultantService', 'DialogService', 'dialog', 'CepService', 'logger', 
    		 'SubscriptionService', 'Subscription', 
             function($scope, $log, $location, DataProvider, ConsultantService, DialogService, dialog, CepService, 
            		 logger, SubscriptionService, Subscription ) {
    	
    			var log = logger.getLogger('tnt.catalog.subscription.ctrl.SubscriptionCtrl');

    			if (ConsultantService.get()) {
	                $scope.consultant = ConsultantService.get();
	            } else {
	                $scope.consultant = {"address":{}};
	            }
    			
    			$scope.plan = undefined;
    			
    			$scope.states = DataProvider.states;
    			
    			$scope.paymentPlans = DataProvider.paymentPlans;
    			
    			$scope.cepValid = false;
    			
		        $scope.openPaymentScreen = function () {
		        	dialog.close(true);
		        	DialogService.openDialogSubscriptionRenewal();
		        };
		        
		        $scope.openEmailScreen = function () {
		        	dialog.close(true);
		        	DialogService.openDialogSubscriptionEmail();
		        };
		        
		        $scope.cancel = function () {
		        	dialog.close(true);
		        	$location.path('/login');
		        };

		        $scope.getSubscription = function(){
		        	var subscriptions = SubscriptionService.list($scope.consultant.uuid,'PENDING');
		        	
		        	if( subscriptions && subscriptions.length > 0 ){
		        		$scope.plan = subscriptions[0].planId;
		        		$scope.saveSubscription();
		        	}
		        };
		        
		        $scope.saveConsultant = function () {
		        	$scope.failed = true;
		        	
                    if ($scope.subscriptionForm.$valid) {
                        if (ConsultantService.get()) {
                            return ConsultantService.update($scope.consultant).then(function() {
                                log.info('Consultant Updated.');
                                $scope.saveSubscription();
                            }, function(err) {
                                log.error('Failed to updated the consultant.');
                                log.debug(err);
                            });
                        } else {
                            return ConsultantService.create($scope.consultant).then(function() {
                                log.info('Consultant Created.');
                                $scope.saveSubscription();
                            }, function(err) {
                                log.fatal('Failed to create the consultant.');
                                log.debug(err);
                            });
                        }                    	
                    }
                    else {
	                    DialogService.messageDialog({
	                    	title : 'Assinatura',
	                    	message : 'Os campos destacados são de preenchimento obrigatório.',
	                    	btnYes : 'OK'
	                    });
                    }
		        };
		
		        $scope.saveSubscription = function(){
		        	var subscription = new Subscription($scope.plan, new Date(), $scope.consultant.uuid,'PENDING');
                    
                    SubscriptionService.add(subscription).then(function() {
                        log.info('Subscription Updated.');
                        $scope.openEmailScreen();
                    }, function(err) {
                        log.error('Failed to updated Subscription.');
                        log.debug(err);
                    });
		        };
		        
                $scope.getCep = function() {
                    var cepPromise = CepService.search($scope.consultant.cep);

                    var promiseResult = cepPromise.then(function(address) {
                    	completeAddress(address);
                    }, function(error) {
                        if (error.status === 404) {
                            DialogService.messageDialog({
                                title : 'Erro ao buscar o CEP.',
                                message : 'Verifique se o CEP foi digitado corretamente.',
                                btnYes : 'OK'
                            });
                        } else if (error.status === 500) {
                            DialogService.messageDialog({
                                title : 'Erro ao buscar o CEP.',
                                message : 'Não foi possível contactar o serviço de CEP, verifique sua conexão com a internet.',
                                btnYes : 'OK'
                            });
                        }
                    });

                    return promiseResult;
                };
                
                var completeAddress = function completeAddress(address) {
                    $scope.consultant.address.street = address.logradouro;
                    $scope.consultant.address.neighborhood = address.bairro;
                    $scope.consultant.address.state = address.uf;
                    $scope.consultant.address.city = address.localidade;
                };
                
                
                function warmup(){
                    var promise = ConsultantService.getDataAccount();
                      if(!$scope.consultant.uuid){
                          promise.then(function(userDataAccount){
                              if(angular.isObject(userDataAccount)){
                                  populateFields(userDataAccount);
                              }
                          });
                      }
                  }
                  
                  function populateFields(userDataAccount){
                      //adress fields
                	  $scope.consultant.cep = userDataAccount.cep;
                      $scope.consultant.address.street = userDataAccount.address.street;
                      $scope.consultant.address.neighborhood = userDataAccount.address.neighborhood;
                      $scope.consultant.address.state = userDataAccount.address.state;
                      $scope.consultant.address.city = userDataAccount.address.city;
                      $scope.consultant.address.number = userDataAccount.address.number;
                      $scope.consultant.complement = userDataAccount.address.complement;
                  }
                  
                  warmup();
                  
                  $scope.$watch('cepValid',function(){
                      if($scope.cepValid === true){
                          $scope.getCep();
                      }
                  });
                  
       
    		 }]);
}(angular));
