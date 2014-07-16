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
                    $scope.consultant = {
                            address : {
                                street : '',
                                number : '',
                                neighborhood : '',
                                city : '',
                                state : ''
                            },
                            birthDate : {
                                year : '1988'
                            }
                        };	                
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

		        $scope.saveConsultant = function () {
		        	$scope.failed = true;
		        	
		        	var subscriptionList = SubscriptionService.list();
		        	if( subscriptionList /*&& subscriptionList.length && subscriptionList.length == 0*/){
		        		var newExpirationDate = new Date();
		        		newExpirationDate.setDate(new Date().getDate()+4);		        		
		        		$scope.consultant.subscriptionExpirationDate = newExpirationDate.getTime() ;
		        		console.log(new Date($scope.consultant.subscriptionExpirationDate));
		        	} 
		        	
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
	                    	message : 'Os campos destacados s�o de preenchimento obrigat�rio.',
	                    	btnYes : 'OK'
	                    });
                    }
		        };
		
		        $scope.saveSubscription = function(){
		        	var subscription = new Subscription(null, $scope.plan, new Date().getTime(), $scope.consultant);
                    
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
                                message : 'N�o foi poss�vel contactar o servi�o de CEP, verifique sua conex�o com a internet.',
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
                      $scope.consultant.name = userDataAccount.name;
                      $scope.consultant.cep  = userDataAccount.cep;
                      $scope.consultant.gender = getGender(userDataAccount.gender);
                      $scope.consultant.cpf = userDataAccount.document;
                      $scope.consultant.email = userDataAccount.email;
                      $scope.consultant.phone = userDataAccount.landline;
                      $scope.consultant.cellphone = userDataAccount.cellphone;
                      $scope.consultant.emailPrimer = userDataAccount.emailPrimer;
                      $scope.consultant.emailDirector = userDataAccount.emailDirector;
                      $scope.consultant.primerCode = userDataAccount.primerCode;
                      $scope.consultant.unityNumber = userDataAccount.unityNumber;
                      $scope.consultant.emissary = userDataAccount.rg;
                      
                      //banking
                      $scope.consultant.bank = userDataAccount.banking.bank;
                      $scope.consultant.agency = userDataAccount.banking.agency;
                      $scope.consultant.account = userDataAccount.banking.account;
                      $scope.consultant.accountHolder = userDataAccount.banking.holderName;
                      $scope.consultant.holderDocument = userDataAccount.banking.holderDocument;
                      $scope.consultant.accountType = userDataAccount.banking.accountType;
                      
                      //adress fields
                      $scope.consultant.address.street = userDataAccount.address.street;
                      $scope.consultant.address.neighborhood = userDataAccount.address.neighborhood;
                      $scope.consultant.address.state = userDataAccount.address.state;
                      $scope.consultant.address.city = userDataAccount.address.city;
                      $scope.consultant.address.number = userDataAccount.address.number;
                      $scope.consultant.complement = userDataAccount.address.complement;

                      //empty fields on firebase
                      $scope.consultant.mkCode = userDataAccount.mkCode;
                      $scope.consultant.marital = userDataAccount.marital;
                      $scope.consultant.countryOrigin = userDataAccount.countryOrigin || 'Brasil' ;
                      
                      $scope.consultant.birthDate.day = getBirthDayByPiece(userDataAccount.birthday, 'day');
                      $scope.consultant.birthDate.month = getBirthDayByPiece(userDataAccount.birthday, 'month');
                      $scope.consultant.birthDate.year = getBirthDayByPiece(userDataAccount.birthday, 'year');
                  }
                  
                  function getBirthDayByPiece(date, piece){
                      var pieces = date.split('-');
                      var result = undefined;
                      if(piece === 'day'){
                          result = pieces[2];
                      }else if(piece ==='month'){
                          result = pieces[1];
                      }else if(piece === 'year'){
                          result = pieces[0];
                      }
                      return result;
                  }
                  
                  function getGender(code){
                      var result = undefined;
                      if(code === '1'){
                          result = 'Masculino';
                      }else if(code === '2' ){
                          result = 'Feminino';
                      }
                      return result;
                  }
                  
                  warmup();
                  
                  $scope.$watch('cepValid',function(){
                      if($scope.cepValid === true){
                          $scope.getCep();
                      }
                  });
                  
       
    		 }]);
}(angular));
