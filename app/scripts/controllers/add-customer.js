(function(angular) {
    'use strict';

    angular.module('tnt.catalog.customer', [
        'tnt.catalog.service.data', 'tnt.catalog.entity.service'
    ]).controller(
            'AddCustomerCtrl',
            [
                '$scope', '$location', 'DataProvider', 'DialogService', 'OrderService', 'EntityService', 'CepService', 'UserService',
                'CpfService',
                function($scope, $location, DataProvider, DialogService, OrderService, EntityService, CepService, UserService, CpfService) {

                    UserService.redirectIfIsNotLoggedIn();

                    // ############################################################################################################
                    // Scope binding variables
                    // ############################################################################################################
                    $scope.birthdate = DataProvider.date;
                    $scope.states = DataProvider.states;

                    $scope.customer = {
                        addresses : {},
                        birthDate : {},
                        emails : [
                            {
                                address : ''
                            }
                        ],
                        phones : [
                            {
                                number : ''
                            }
                        ]
                    };
                    var customer = $scope.customer;

                    // ############################################################################################################
                    // Scope functions
                    // ############################################################################################################

                    $scope.openDialogAddCustomerTels = function openDialogAddCustomerTels(phones) {
                        DialogService.openDialogAddCustomerTels({
                            phones : phones
                        }).then(function resultPhones(phones) {
                            if (phones) {
                                customer.phones = phones;
                            }
                        });
                    };

                    $scope.getCep = function() {
                        var cepPromise = CepService.search($scope.customer.cep);

                        var promiseResult = cepPromise.then(function(address) {
                            completeAddress(address);
                        }, function(error) {
                            if (error.status === 404) {
                                console.log('yar');
                                DialogService.messageDialog({
                                    title : 'Erro ao buscar o CEP.',
                                    message : 'Verifique se o CEP foi digitado corretamente.',
                                    btnYes : 'OK'
                                }).then();
                            } else if (error.status === 500) {
                                DialogService.messageDialog({
                                    title : 'Erro ao buscar o CEP.',
                                    message : 'Não foi possível contactar o serviço de CEP, verifique sua conexão com a internet.',
                                    btnYes : 'OK'
                                }).then();
                            }
                        });
                        
                        return promiseResult;
                    };

                    $scope.openDialogAddCustomerEmails = function openDialogAddCustomerEmails(emails) {
                        DialogService.openDialogAddCustomerEmails({
                            emails : emails
                        }).then(function resultEmails(emails) {
                            if (emails) {
                                customer.emails = emails;
                            }
                        });
                    };

                    $scope.confirm = function confirm() {
                        $scope.failed = true;
                        if (!$scope.newCustomerForm.$valid) {
                            DialogService.messageDialog({
                                title : 'Novo usuário',
                                message : 'Os campos destacados são de preenchimento obrigatório.',
                                btnYes : 'OK'
                            });
                            return;
                        }
                        var entityCreatedPromise = EntityService.create(customer).then(function(uuid) {
                            OrderService.order.customerId = uuid;
                            return uuid;
                        }, function() {
                            // TODO something about it
                        });
                        $location.path('/');

                        return entityCreatedPromise;
                    };

                    $scope.cancel = function cancel() {
                        $location.path('/');
                    };

                    $scope.validateCpf = function(cpf) {
                        if (cpf) {
                            if (!CpfService.validate(cpf)) {
                                DialogService.messageDialog({
                                    title : 'CPF invalido.',
                                    message : 'Verifique se o CPF foi digitado corretamente.',
                                    btnYes : 'OK'
                                });
                            }
                        }
                    };

                    var completeAddress = function completeAddress(address) {
                        $scope.customer.addresses.street = address.logradouro;
                        $scope.customer.addresses.neighborhood = address.bairro;
                        $scope.customer.addresses.state = address.uf;
                        $scope.customer.addresses.city = address.localidade;
                    };
                }
            ]);
}(angular));