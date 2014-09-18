(function(angular) {
'use strict';
angular.module(
    'tnt.catalog.subscription.ctrl',
    [
    'tnt.catalog.service.dialog', 'tnt.catalog.consultant.service', 'tnt.catalog.consultant',
    'tnt.catalog.subscription.service', 'tnt.catalog.subscription', 'tnt.catalog.config'
    ]).controller(
        'SubscriptionCtrl',
        [
        '$scope', '$location', '$window', 'DataProvider', 'ConsultantService', 'DialogService', 'dialog', 'CepService', 'logger',
        'SubscriptionService', 'Subscription', 'CatalogConfig', 'UserService',
            function($scope, $location, $window, DataProvider, ConsultantService, DialogService, dialog, CepService,
                logger, SubscriptionService, Subscription, CatalogConfig, UserService) {

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

            $scope.paymentPlans = DataProvider.paymentPlans;

            if( dialog.data && dialog.data.planType ){
                $scope.planType = dialog.data.planType;
            }
            else {
                $scope.planType = undefined;
            }
 
            $scope.states = DataProvider.states;
            $scope.cepValid = false;
            $scope.paymentType = CatalogConfig.PAYMENT_TYPE_BILLET;
            $scope.numberOfDaysToExpiration;

            var completeAddress = function completeAddress(address) {
                $scope.consultant.address.street = address.logradouro;
                $scope.consultant.address.neighborhood = address.bairro;
                $scope.consultant.address.state = address.uf;
                $scope.consultant.address.city = address.localidade;
            };
          
            $scope.continuePaymentFlow = function (planType, paymentType) {
            	dialog.close(true);    
                $scope.planType = planType;
                $scope.paymentType = paymentType;
                
                if(!DateUtils.getDeviceDate()) {
                   $location.path('/login');
                } else {
                    if(CatalogConfig.PAYMENT_TYPE_BILLET === $scope.paymentType) {                                         
                        DialogService.openDialogSubscriptionAdditionalInformation({'planType': planType, 'paymentType': paymentType});   
                    } else {                    
                        DialogService.openDialogSubscriptionFinalMessageCC({'planType': planType, 'paymentType': paymentType});
                    }
                }
            };

            $scope.openDialogSubscriptionFinalMessageBillet = function () {
                dialog.close(true);
                DialogService.openDialogSubscriptionFinalMessageBillet();
            };

            $scope.closeLostDateDriftDialog = function() {
                console.log('sdfsdf');
                dialog.close($q.reject());
            };

            $scope.verifyIfMustRedirectLoginPage = function () {
                dialog.close(true);
                var deviceDate = DateUtils.getDeviceDate();
                if(!deviceDate) {
                   $location.path('/login');
                } else {
                    UserService.defineSubscribeLaterDate(deviceDate);

                    if(!$scope.numberOfDaysToExpiration) {                    
                        $scope.numberOfDaysToExpiration = DateUtils.getDiffOfDays($scope.consultant.subscriptionExpirationDate, deviceDate);
                    }

                    if($scope.numberOfDaysToExpiration<0) {
                        $location.path('/login');
                    }
                }                
            };
                        
            $scope.confirmPaymentWithCC = function () {

                var deviceDate = DateUtils.getDeviceDate();
                if(!deviceDate) {
                   $location.path('/login');
                } else {
                    $scope.paymentType = CatalogConfig.PAYMENT_TYPE_CC;
                    $scope.saveSubscription(false, $scope.isRenewal(), deviceDate);

                    if(CatalogConfig.GLOSS === $scope.planType) {
                        dialog.close(true);
                        $window.location.href = CatalogConfig.semesterPlanCheckoutURL;
                    } else {
                        dialog.close(true);
                        $window.location.href = CatalogConfig.annualPlanCheckoutURL;
                    }
                }
            };
                        
            $scope.confirmPaymentWithBillet = function () {
                $scope.failed = true;

                var deviceDate = DateUtils.getDeviceDate();
                if(!deviceDate) {
                   $location.path('/login'); 
                } else {
                     if(!$scope.isRenewal()) {                    
                        $scope.consultant.subscriptionExpirationDate = deviceDate+ 432000000;

                        if (ConsultantService.get()) {
                            return ConsultantService.update($scope.consultant).then(function() {
                                    log.info('Consultant Updated.');
                                    $scope.saveSubscription(true, false, deviceDate);
                                }, function(err) {
                                    log.error('Failed to updated the consultant.');
                                    log.debug(err);
                                });
                        } else {
                            return ConsultantService.create($scope.consultant).then(function() {
                                    log.info('Consultant Created.');
                                    $scope.saveSubscription(true, false, deviceDate);
                                }, function(err) {
                                    log.fatal('Failed to create the consultant.');
                                    log.debug(err);
                                });
                        } 
                    } else {
                        $scope.saveSubscription(true, true, deviceDate);
                    }  
                }                         
		    };

		    $scope.saveSubscription = function(isBillet, isRenewal, deviceDate){
                var subscription = new Subscription(null, $scope.planType, deviceDate, $scope.consultant, $scope.paymentType, isRenewal);
                
                SubscriptionService.add(subscription).then(function() {
                    log.info('Subscription Updated.');
                    if(isBillet) {
                        $scope.openDialogSubscriptionFinalMessageBillet();
                    }
                }, function(err) {
                    log.error('Failed to updated Subscription.');
                    log.debug(err);
                });
            };

            $scope.subscriptionCloseToExpirationDate = function() {                

                var deviceDate = DateUtils.getDeviceDate();
                if(!deviceDate) {
                   $location.path('/login');
                   return false;
                } else {
                    $scope.consultant = ConsultantService.get();
                    if( $scope.consultant && $scope.consultant.subscriptionExpirationDate) {
                        $scope.numberOfDaysToExpiration = DateUtils.getDiffOfDays($scope.consultant.subscriptionExpirationDate, deviceDate); 

                        if($scope.numberOfDaysToExpiration<0) {                        
                            return false;
                        } else {                         
                            return true;                        
                        }
                    }
                    return false;
                }                
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
                            message : 'N&atilde;o foi poss&iacute;vel contactar o servi&ccedil;o de CEP, verifique sua conex&atilde;o com a internet.',
                            btnYes : 'OK'
                        });
                    }
                });

                return promiseResult;
            };

            $scope.isRenewal = function() {
                var subscriptionList = SubscriptionService.list();                
                if(!subscriptionList || 1 > subscriptionList.length) {
                    return false;
                } else {
                    return true;
                }
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
                $scope.consultant.countryOrigin = userDataAccount.countryOrigin || 'Brasil';
                $scope.consultant.birthDate.day = getBirthDayByPiece(userDataAccount.birthday, 'day');
                $scope.consultant.birthDate.month = getBirthDayByPiece(userDataAccount.birthday, 'month');
                $scope.consultant.birthDate.year = getBirthDayByPiece(userDataAccount.birthday, 'year');
            }

            function getBirthDayByPiece(date, piece){
                var pieces = date.split('-');
                var result;
                if(piece === 'day'){
                    result = pieces[2];
                } else if(piece ==='month') {
                    result = pieces[1];
                } else if(piece === 'year') {
                    result = pieces[0];
                }
                return result;
            }

            function getGender(code){
                var result;
                if(code === '1'){
                    result = 'Masculino';
                } else if(code === '2' ){
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
        }
    ]);
}(angular));