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

                        }
                    ]);
}(angular));
