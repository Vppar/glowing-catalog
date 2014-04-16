(function (angular) {
    'use strict';
    angular.module('tnt.catalog.financial.receivable.ctrl', [
        'tnt.catalog.filters.uuidCode', 'tnt.catalog.service.book'
    ]).controller(
        'ReceivableCtrl',
        [
            '$scope',
            '$filter',
            'ReceivableService',
            'UserService',
            'BookService',
            function ($scope, $filter, ReceivableService, UserService, BookService) {

                UserService.redirectIfIsNotLoggedIn();

                // An object where lists of receivables can be stored without
                // loosing reference in the child scopes. Don't override this
                // object.
                $scope.receivables = {};
                $scope.header = {
                    description : ""
                };
                /** @type {Date} TODAY - Reference date. */
                $scope.TODAY = new Date();
                $scope.TODAY.setHours(0);
                $scope.TODAY.setMinutes(0);
                $scope.TODAY.setSeconds(0);


                $scope.TODAYFINAL = new Date();
                $scope.TODAYFINAL.setHours(23);
                $scope.TODAYFINAL.setMinutes(59);
                $scope.TODAYFINAL.setSeconds(59);
                
                // Store the actual select receivable
                $scope.selectedReceivable = null;
                $scope.dateLimit = '';

                $scope.dtFilter = {
                    dtInitial : new Date(),
                    dtFinal : new Date()
                };

                /**
                 * Switch between listAll and listOpen.
                 */
                $scope.selectReceivableMode = function selectReceivableMode (selectedMode) {
                    if(selectedMode==='listClosed'){
                        $scope.dateLimit = $scope.TODAYFINAL;
                    }else if(selectedMode==='listOpen'){
                        $scope.dateLimit = null;
                    }
                    $scope.selectedReceivableMode = selectedMode;
                    $scope.selectedReceivable = null;
                };

                $scope.selectReceivable = function (receivable) {
                    $scope.selectedReceivable = angular.copy(receivable);
                    $scope.header.description = "> Edição";
                };

                $scope.back = function () {
                    $scope.selectedReceivable = null;
                    $scope.header = {
                        description : ""
                    };
                };

            }
        ]);
}(angular));