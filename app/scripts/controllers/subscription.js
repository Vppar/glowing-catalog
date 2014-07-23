(function(angular) {
    'use strict';

    angular.module(
        'tnt.catalog.subscription.ctrl',
        [
        'tnt.catalog.user', 'tnt.catalog.service.dialog', 'tnt.catalog.consultant.service', 'tnt.catalog.consultant',
        'tnt.catalog.subscription.service', 'tnt.catalog.subscription', 'tnt.catalog.config'
    ]).controller(
        'SubscriptionCtrl',
        [
        '$scope', $q, '$log', '$location', '$window', '$http', 'DataProvider', 'ConsultantService', 'DialogService', 'dialog', 'CepService', 'logger',
        'SubscriptionService', 'Subscription', 'CatalogConfig',
        function($scope, $q, $log, $location, $window, $http, DataProvider, ConsultantService, DialogService, dialog, CepService,
                 logger, SubscriptionService, Subscription, CatalogConfig) {

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
            $scope.paymentTypeSubscription;

            $scope.continuePaymentFlow = function ( planType ) {
           
	        if(!$scope.paymentTypeSubscription){
            		return $q.reject();
            	} else {		
	                dialog.close(true);             
	                if('BILLET' === paymentTypeSubscription) {
	                    DialogService.openDialogSubscriptionAdditionalInformation({'planType': planType});    
	                } else if('CC' === paymentTypeSubscription){
	                    confirmPaymentWithCreditCard();
	                } else {
	                    DialogService.messageDialog({
	                                title : 'VPink - Forma de Pagamento',
	                                message : '&Eacute necess&aacute;rio selecionar a forma de pagamento.',
	                                btnYes : 'OK'
	                    });
	                }       
		}     
            };

            $scope.openDialogSubscriptionFinalMessageBillet = function () {
                dialog.close(true);
                DialogService.openDialogSubscriptionFinalMessageBillet();
            };

            $scope.verifyIfMustRedirectLoginPage = function () {
                dialog.close(true);
                if( new Date().getTime() >= $scope.consultant.subscriptionExpirationDate ){
                    $location.path('/login');
                }
            };

            $scope.cancel = function () {
                dialog.close(true);
                $location.path('/login');
            };

            $scope.confirmPaymentWithCreditCard = function () {
                verifyVPCommerceURL().then(function() {
                            dialog.close(true);
                            DialogService.openDialogSubscriptionFinalMessageCC();
                        }, function(err) {
                            log.error(err);
                            DialogService.messageDialog({
                                title : 'VPink - Cart&atilde;o de Cr&eacute;dito',
                                message : '&Eacute necess&aacute;rio estar conectado na Internet para efetuar o pagamento com cart&atilde;o de cr&eacute;dito.',
                                btnYes : 'OK'
                            });
                        });
            };

            $scope.redirectToVPCommerce = function () {   
                if(CatalogConfig.BLUSH === $scope.planType) {
                    dialog.close(true);
                    $window.location.href = CatalogConfig.semesterPlanCheckoutURL;
                } else {
                    dialog.close(true);
                    $window.location.href = CatalogConfig.annualPlanCheckoutURL;
                }
            };

            $scope.verifyVPCommerceURL = function () {
                var url;
                if(CatalogConfig.BLUSH === $scope.planType) {
                    url = CatalogConfig.semesterPlanCheckoutURL;
                } else {
                    url = CatalogConfig.annualPlanCheckoutURL;
                }

                $http({
                    method: 'GET',
                    url: url,
                    data: undefined
                }).success(function (data) {
                    deferred.resolve(data);
                }).error(function (err) {
                    deferred.reject(err);
                }
            };
                        
            $scope.confirmPaymentWithBillet = function () {
                $scope.failed = true;

                var subscriptionList = SubscriptionService.list();
                if( subscriptionList && subscriptionList.length && subscriptionList.length === 0){
                    var newExpirationDate = new Date();
                    newExpirationDate.setDate(new Date().getDate()+4);
                    $scope.consultant.subscriptionExpirationDate = newExpirationDate.getTime();
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
                            message : 'Os campos destacados s&atilde;o de preenchimento obrigat&oacute;rio.',
                            btnYes : 'OK'
	                    });
                }
		    };

		    $scope.saveSubscription = function(){
                        var subscription = new Subscription(null, $scope.planType, new Date().getTime(), $scope.consultant);

                        SubscriptionService.add(subscription).then(function() {
                            log.info('Subscription Updated.');
                            $scope.openDialogSubscriptionFinalMessageBillet();
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
                            message : 'N&atilde;o foi poss&iacute;vel contactar o servi&ccedil;o de CEP, verifique sua conex&atilde;o com a internet.',
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