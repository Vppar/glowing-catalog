(function(angular) {
    'use strict';

    /**
     * Controller that encapsulates a receivable and handle its operations.
     * 
     * @author Arnaldo S. Rodrigues Jr.
     */
    angular.module('tnt.catalog.financial.receivable', []).controller('ReceivableCtrl', function($scope, $log, ReceivableService) {

        // #############################################################################################################
        // Local variables
        // #############################################################################################################
        /**
         * Target receivable to all controller operations.
         */
        var receivable = {};
        /**
         * Easy the access to the ReceivableService inside the controller.
         */
        var service = ReceivableService;

        // #############################################################################################################
        // Receivable functions
        // #############################################################################################################

        /**
         * Cancel a receivable.
         */
        var cancel = function cancel() {
            var result = false;
            if (receivable.id) {
                if (!receivable.received) {
                    receivable.canceled = true;
                    result = service.update(receivable);
                } else {
                    $log.error('ReceivableCtrl: -Unable to cancel an already fulfilled receivable.');
                }
            } else {
                $log.error('ReceivableCtrl: -Unable to cancel a receivable that was not saved.');
            }
            return result;
        };

        /**
         * Verifies if a receivable is valid.
         */
        var isValid = function isValid() {
            return true;
        };

        // #############################################################################################################
        // Scope variables
        // #############################################################################################################
        /**
         * Exposes the methods in the scope.
         */
        $scope.receivable = receivable;
        $scope.cancel = cancel;
    });

}(angular));