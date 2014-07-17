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

                    $scope.cpfFocus = false;

                    $scope.cepValid = false;

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
                    if(!edit){
                        edit = {};
                    }
                    if (edit.editUuid) {

                       var entity = EntityService.read(edit.editUuid);
                       $scope.customer = entity;
                       prepareEntity($scope.customer);
                    }

                    if (edit.clientName) {
                       $scope.customer.name = edit.clientName;
                    }

                    if(edit.method && edit.method==='creditcard'){
                        $scope.cpfFocus = true;
                    }

                    var customer = $scope.customer;

                    // ############################################################################################################
                    // Scope functions
                    // ############################################################################################################

                    $scope.$watch('cepValid',function(){
                        if($scope.cepValid === true){
                            $scope.getCep();
                        }
                    });


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
                        if (edit.editUuid) {
                            promise = EntityService.update(customer).then(function(uuid) {
                                if(edit.screen){
                                    if(edit.method){
                                        IntentService.putBundle({method : edit.method});
                                    }
                                    $location.path('/'+edit.screen);
                                }else{
                                    $location.path('/');
                                }
                                return uuid;
                            }, function(error) {
                                $log.error('Failed to update the entity:', uuid);
                                $log.debug(error);
                            });
                        } else {
                            promise = EntityService.create(customer).then(function(uuid) {
                                if(!edit.giftCard){
                                    OrderService.order.customerId = uuid;
                                    if(edit.screen){
                                        $location.path('/'+edit.screen);
                                    }else{
                                        $location.path('/');
                                    }
                                } else {
                                    IntentService.putBundle({method:'voucher'});
                                    $location.path('/'+edit.giftCard);
                                }
                                return uuid;
                            });
                        }

                        return promise;
                    };

                    $scope.cancel = function cancel() {

                            if(edit.screen){
                                $location.path('/'+edit.screen);
                            }else if(edit.giftCard){
                                IntentService.putBundle({method:'voucher', user: 'cancel'});
                                $location.path('/'+edit.giftCard);
                            }else{
                                $location.path('/');
                            }
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
})(angular);