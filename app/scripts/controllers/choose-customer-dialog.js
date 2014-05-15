(function (angular) {
    'use strict';

    angular.module('tnt.catalog.customer.choose', [
        'tnt.catalog.service.data', 'tnt.catalog.entity.service'
    ]).controller(
        'ChooseCustomerDialogCtrl',
        [
            '$scope',
            '$q',
            '$location',
            'dialog',
            'OrderService',
            'EntityService',
            function ($scope, $q, $location, dialog, OrderService, EntityService) {
                
                $scope.customer = -1;
                
                $scope.customers = EntityService.list().sort(function (x, y) {
                    return ((x.name === y.name) ? 0 : ((x.name > y.name) ? 1 : -1));
                });

                // Setting up the array to works with ui-select2 matcher.
                for ( var ix in $scope.customers) {
                    var customer = $scope.customers[ix];
                    customer.id = ix;
                    customer.text = customer.name;
                }

                function format (item) {
                    return item.name;
                }

                // Match by name or document
                function matcher (term, text, opt) {
                    return text.toUpperCase().indexOf(term.toUpperCase()) >= 0 ||
                        (opt.document && opt.document.indexOf(term.toUpperCase()) >= 0);
                }

                $scope.customers.unshift({id: -1, name: 'Selecione o Cliente'});
                
                $scope.selectOptions = {
                    data : $scope.customers,
                    matcher : matcher,
                    formatSelection : format,
                    formatResult : format,                    
                };

                /**
                 * Closes the dialog without select a customer.
                 */
                $scope.cancel = function () {
                    dialog.close($q.reject());
                };

                /**
                 * Closes the dialog with a customer selected or redirect to the
                 * add new customer screen.
                 */
                $scope.confirm = function () {
                    var uuid = 0;
                    if ($scope.customer && $scope.customer.uuid) {
                        uuid = $scope.customer.uuid;
                        $location.path('/payment');
                    } else {
                        $location.path('/add-customer');
                    }
                    dialog.close(uuid);
                };

            }
        ]).controller(
        'ChooseCustomerDialogNoRedirectCtrl',
        [
            '$scope',
            '$q',
            '$location',
            'dialog',
            'OrderService',
            'EntityService',
            function ($scope, $q, $location, dialog, OrderService, EntityService) {
                
                $scope.customer = -1;

                $scope.customers = EntityService.list().sort(function (x, y) {
                    return ((x.name === y.name) ? 0 : ((x.name > y.name) ? 1 : -1));
                });

                // Setting up the array to works with ui-select2 matcher.
                for ( var ix in $scope.customers) {
                    var customer = $scope.customers[ix];
                    customer.id = ix;
                    customer.text = customer.name;
                }

                function format (item) {
                    return item.name;
                }

                // Match by name or document
                function matcher (term, text, opt) {
                    return text.toUpperCase().indexOf(term.toUpperCase()) >= 0 ||
                        (opt.document && opt.document.indexOf(term.toUpperCase()) >= 0);
                }
                
                $scope.customers.unshift({id: -1, name: 'Selecione o Cliente'});

                $scope.selectOptions = {
                    data : $scope.customers,
                    matcher : matcher,
                    formatSelection : format,
                    formatResult : format,
                };

                /**
                 * Closes the dialog without select a customer.
                 */
                $scope.cancel = function () {
                    dialog.close($q.reject());
                };

                /**
                 * Closes the dialog with a customer selected or redirect to the
                 * add new customer screen.
                 */
                $scope.confirm = function () {
                    var uuid = 0;
                    if ($scope.customer && $scope.customer.uuid) {
                        uuid = $scope.customer;
                    } else {
                        $location.path('/add-customer');
                    }
                    dialog.close(uuid);
                };

            }
        ]);
}(angular));
