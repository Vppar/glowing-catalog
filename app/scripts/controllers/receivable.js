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

        // Store the actual select receivable
        $scope.selectedReceivable = null;
        // Stores the total of all listed payments
        $scope.receivables.total = 0;

        /**
         * Controls which fragment will be shown.
         */
        $scope.selectedReceivableMode = 'list';
        
        $scope.selectReceivableMode = function selectReceivableMode(selectedMode) {
            //let edit or pay only if there something selected
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
            // when a receivable is select force redirect to payment tab.
            $scope.selectReceivableMode('receive');
            $scope.selectedReceivable = angular.copy(receivable);
        };  
        
        //FIXME think some better. 
        $scope.removeArguments =  function removeArguments(receivable){
            delete receivable.classification;
            delete receivable.documentType;
            delete receivable.installment;
            delete receivable.installments;
            delete receivable.order;
            delete receivable.entityName;
            return receivable;
        };

    });
}(angular));
