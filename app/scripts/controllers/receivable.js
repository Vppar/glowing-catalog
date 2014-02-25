(function(angular) {
    'use strict';
    angular.module('tnt.catalog.financial.receivable.ctrl', [
        'tnt.catalog.filters.uuidCode'
    ]).controller('ReceivableCtrl', function($scope, $filter, ReceivableService, UserService, EntityService, OrderService) {

        UserService.redirectIfIsNotLoggedIn();

        // An object where lists of receivables can be stored without
        // loosing reference in the child scopes. Don't override this
        // object.
        $scope.receivables = {};

        // Stores the list of payments to be displayed
        $scope.receivables.list = ReceivableService.list();
        // Store the actual select receivable
        $scope.selectedReceivable = null;
        // Stores the total of all listed payments
        $scope.receivables.total = 0;

        /**
         * Entities list to augment expenses.
         */
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

        $scope.argumentReceivables = function argumentReceivables(){
            for ( var ix in $scope.receivables.list) {
                var receivable = $scope.receivables.list[ix];
                receivable.entityName = EntityService.read(receivable.entityId).name;
                receivable.typeTranslate = translate[receivable.type];
                
                receivable.installments = ReceivableService.listByDocument(receivable.documentId);
                for(var y in receivable.installments){
                    if(receivable.installments[y].uuid === receivable.uuid){
                        //set actual installment
                        receivable.installment = Number(y)+1;
                    }
                }
                receivable.uuidCode=$filter('uuidCode')(receivable);
                receivable.order = OrderService.read(receivable.documentId);
                receivable.order.uiidCode = $filter('uuidCode')(receivable.order);
            }
        };
        
        /**
         * Controls which fragment will be shown.
         */
        $scope.selectedReceivableMode = 'search';

        $scope.selectReceivableMode = function selectReceivableMode(selectedMode) {
            if($scope.selectedReceivable){
                $scope.selectedReceivableMode = selectedMode;
            }
        };

        $scope.$watch('receivables.list', function() {
            $scope.receivables.total = getReceivablesTotal();
        });

        function getReceivablesTotal() {
            return $filter('sum')($scope.receivables.list, 'amount');
        }

        $scope.selectReceivable = function(receivable) {
            // when a receivable is select force redirect to edit page.
            $scope.selectReceivableMode('payment');
            $scope.selectedReceivable = angular.copy(receivable);
        };

    });
}(angular));
