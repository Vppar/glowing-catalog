(function(angular) {
    'use strict';
    angular.module('tnt.catalog.registration.ctrl', [
        'tnt.catalog.consultant.service', 'tnt.catalog.consultant'
    ])
            .controller(
                    'RegistrationCtrl',
                    [
                        '$scope',
                        '$location',
                        '$q',
                        'Consultant',
                        'ConsultantService',
                        'CepService',
                        'DataProvider',
                        'DialogService',
                        'UserService',
                        'logger',
                        function($scope, $location, $q, Consultant, ConsultantService, CepService, DataProvider, DialogService,
                                UserService, logger) {

                            var log = logger.getLogger('tnt.catalog.registration.ctrl.RegistrationCtrl');
                            
                            $scope.select2Options = {
                                    minimumResultsForSearch : -1
                                };
                            
                            UserService.redirectIfIsNotLoggedIn();

                            /**
                             * Regex created to only accept e-mails that follow
                             * the format something@somewhere.whatever
                             */
                            $scope.emailRegex =
                                /([a-z0-9!#$%&'*+\/=?^_`{|}~.-]+)@([a-z0-9!#$%&'*+\/=?^_`{|}~.-]+).\.([a-z0-9!#$%&'*+\/=?^_`{|}~.-]+)/;

                            // prepare the date selects
                            $scope.birthdate = DataProvider.date;
                            $scope.states = DataProvider.states;
                            var years = [];
                            var currYear = 2000;
                            var minYear = 1950;
                            while (currYear > minYear) {
                                years.push(currYear--);
                            }
                            $scope.birthdate.years = years;

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

                            // #########################################################################################################
                            // Scope methods
                            // #########################################################################################################

                            /**
                             * CEP service method
                             */
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

                            $scope.confirm = function() {
                                if ($scope.consultantForm.$valid) {
                                    if (ConsultantService.get()) {
                                        return ConsultantService.update($scope.consultant).then(function() {
                                            log.info('Consultant Updated.');
                                            $location.path('/');
                                        }, function(err) {
                                            log.error('Failed to updated the consultant.');
                                            log.debug(err);
                                        });
                                    } else {
                                        return ConsultantService.create($scope.consultant).then(function() {
                                            log.info('Consultant Created.');
                                            $location.path('/');
                                        }, function(err) {
                                            log.fatal('Failed to create the consultant.');
                                            log.debug(err);
                                        });
                                    }
                                } else {
                                    return $q.reject();
                                }
                            };

                            $scope.cancel = function() {
                                $location.path('/');
                            };

                            // #########################################################################################################
                            // Aux functions
                            // #########################################################################################################

                            var completeAddress = function completeAddress(address) {
                                $scope.consultant.address.street = address.logradouro;
                                $scope.consultant.address.neighborhood = address.bairro;
                                $scope.consultant.address.state = address.uf;
                                $scope.consultant.address.city = address.localidade;
                            };
                            
                            function warmup(){
                              //try to get information from firebase
                                var promise = ConsultantService.getDataAccount();
                                if(!$scope.consultant.uuid){
                                    promise.then(function(userDataAccount){
                                        if(angular.isObject(userDataAccount)){
                                            populateFields(userDataAccount);
                                        }
                                    });
                                }
                                
                            };
                            
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
                                $scope.consultant.countryOrigin = userDataAccount.countryOrigin;
                                
                                
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
                            };
                            
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
                        }
                    ]);
}(angular));
