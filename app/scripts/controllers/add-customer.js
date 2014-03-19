(function(angular) {
    'use strict';

    angular.module('tnt.catalog.customer', [
        'tnt.catalog.service.data', 'tnt.catalog.entity.service'
    ]).controller(
            'AddCustomerCtrl',
            [
                '$scope',
                '$location',
                'DataProvider',
                'DialogService',
                'OrderService',
                'EntityService',
                'CepService',
                'UserService',
                'CpfService',
                'IntentService',
                function($scope, $location, DataProvider, DialogService, OrderService, EntityService, CepService, UserService, CpfService,
                        IntentService) {
                    
                    UserService.redirectIfIsNotLoggedIn();

                    // ############################################################################################################
                    // Scope binding variables
                    // ############################################################################################################
                    $scope.birthdate = DataProvider.date;
                    $scope.states = DataProvider.states;
                    
                    $scope.select2Options = {
                            minimumResultsForSearch : -1
                        };

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

                    var edit = IntentService.getBundle();
                    if (edit) {
                        if (edit.editUuid) {
                            var entity = EntityService.read(edit.editUuid);
                            $scope.customer = entity;
                            prepareEntity($scope.customer);
                        }

                        if (edit.clientName) {
                            $scope.customer.name = edit.clientName;
                        }
                    }

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
                            return DialogService.messageDialog({
                                title : 'Novo usuário',
                                message : 'Os campos destacados são de preenchimento obrigatório.',
                                btnYes : 'OK'
                            });
                        }

                        var promise = null;
                        // FIXME - No idea from where this $$hashKey comes,
                        // someone please investigate this in the future.
                        if (customer.emails) {
                            for ( var ix in customer.emails) {
                                if (customer.emails[ix].$$hashKey) {
                                    delete customer.emails[ix].$$hashKey;
                                }
                            }
                        }
                        if (edit && edit.editUuid) {
                            promise = EntityService.update(customer).then(function(uuid) {
                                return uuid;
                            }, function(error) {
                                $log.error('Failed to update the entity:', uuid);
                                $log.debug(error);
                            });
                            
                            if(edit && edit.screen){
                                $location.path('/'+edit.screen);
                            }else{
                                $location.path('/'); 
                            }
                        } else {
                            promise = EntityService.create(customer).then(function(uuid) {
                                OrderService.order.customerId = uuid;
                                return uuid;
                            });
                            
                            if(edit && edit.screen){
                                $location.path('/'+edit.screen);
                            }else{
                                $location.path('/'); 
                            }
                        }

                        return promise;
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

                    /**
                     * Prepares the entity for the edit.
                     * 
                     * @param {Entity} - Entity to be edited.
                     */
                    function prepareEntity(entity) {
                        if (!entity.addresses) {
                            entity.addresses = {};
                        }

                        if (!entity.birthDate) {
                            entity.birthDate = {};
                        }

                        if (!entity.birthDate) {
                            entity.birthDate = {};
                        }
                    }
                }
            ]);
}(angular));