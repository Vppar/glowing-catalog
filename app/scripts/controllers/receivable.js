(function(angular) {
    'use strict';
    angular.module('tnt.catalog.financial.receivable.ctrl', [
        'tnt.catalog.filters.uuidCode'
    ]).controller('ReceivableCtrl', function($scope, $filter, ReceivableService, UserService, EntityService) {

        UserService.redirectIfIsNotLoggedIn();

        // An object where lists of receivables can be stored without
        // loosing reference in the child scopes. Don't override this
        // object.
        $scope.receivables = {};

        // Stores the list of payments to be displayed
        $scope.receivables.list = ReceivableService.list();
        // Store the actual select receivable
        $scope.selectedReceivable = {};
        // Stores the total of all listed payments
        $scope.receivables.total = 0;

        /**
         * Entities list to augment expenses.
         */
        $scope.entities = EntityService.list();
        $scope.translate = {};

        var translate = $scope.translate;
        translate["cash"] = "Dinheiro";
        translate["onCuff"] = "Pendurado";
        translate["check"] = "Cheque";
        translate["voucher"] = "Voucher";
        translate["gift"] = "Vale Presente";
        translate["exchange"] = "Troca de Produto";
        translate["coupon"] = "Cupom";
        translate["noMerchantCc"] = "No Merchant CC";
        translate["creditCard"] = "Cartão de Crédito";

        for ( var ix in $scope.receivables.list) {
            var receivable = $scope.receivables.list[ix];
            var result = $filter('filter')($scope.entities, 'uuid', function(item) {
                return item === receivable.entityId;
            });
            console.log('begin');
            console.log(receivable.entityId);
            receivable.entityName = result[0].name;
            receivable.typeTranslate = translate[receivable.type];
            console.log(receivable.installments);
            console.log(receivable);
            console.log('end');
        }

        /**
         * Controls which fragment will be shown.
         */
        $scope.selectedReceivableMode = 'edit';

        $scope.selectReceivableMode = function selectReceivableMode(selectedMode) {
            $scope.selectedReceivableMode = selectedMode;
        };

        $scope.$watch('receivables.list', function() {
            $scope.receivables.total = getReceivablesTotal();
        });

        function getReceivablesTotal() {
            return $filter('sum')($scope.receivables.list, 'amount');
        }

        $scope.selectReceivable = function(receivable) {
            // when a receivable is select force redirect to edit page.
            $scope.selectReceivableMode('edit');

            $scope.selectedReceivable.installments = [];
            if (receivable != undefined && shouldSeachInstallments(receivable)) {
                receivable.installments = ReceivableService.listByDocument(receivable.documentId);
                // EntityService.read($scope.selectedReceivable.entityId);
                console.log($scope.selectedReceivable);
            }else{
                receivable.installments = null; 
            }
            $scope.selectedReceivable = angular.copy(receivable);
        };

        var shouldSeachInstallments = function(receivable) {
            var result = false;
            if (receivable.type == 'check' || receivable.type == 'creditCard') {
                result = true;
            }
            return result;
        };

    });
}(angular));
