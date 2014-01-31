(function(angular) {
    'use strict';

    angular.module('tnt.catalog.customer', [
        'tnt.catalog.service.data', 'tnt.catalog.entity.service'
    ]).controller('AddCustomerCtrl', function($scope, $location, DataProvider, DialogService, OrderService, EntityService) {

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
            EntityService.create(customer).then(function(uuid) {
                OrderService.order.customerId = uuid;
            }, function(err) {
                // TODO something about it
                //console.log(err);
            });

            $location.path('/');
        };

        $scope.cancel = function cancel() {
            $location.path('/');
        };
    });
}(angular));