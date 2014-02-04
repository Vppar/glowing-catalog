(function(angular) {
    'use strict';
    angular
        .module('tnt.catalog.financial.receivable.search.ctrl', [])
        .controller('ReceivableSearchCtrl', function($log, $scope, $filter, ReceivableService) {

            function setTime(date, hours, minutes, seconds, milliseconds) {
                date.setHours(hours);
                date.setMinutes(minutes);
                date.setSeconds(seconds);
                date.setMilliseconds(milliseconds);
            }

            $scope.receivables = {};

            $scope.receivables.filtered = [];

            $scope.query = '';
            $scope.dtInitial = new Date();
            $scope.dtFinal = new Date();

            var searchableFields = [
                'uuid', 'amount', 'type', 'remarks'
            ];

            function getReceivablesTotal() {
                return $filter('sum')($scope.receivables.filtered, 'amount');
            }

            function receivableQueryFilter(receivable) {
                var terms = $scope.query.split(' ');
                var isTermInField;

                var term, field;


                // For each term in the query, check if it matches any of
                // the searchable fields. If not, return false.
                for (var idx1 in terms) {
                    term = terms[idx1].toLowerCase();

                    isTermInField = false;

                    for (var idx2 in searchableFields) {
                        field = searchableFields[idx2];
                        var val = angular.isDefined(receivable[field]) ? '' + receivable[field] : '';
                        val = val.toLowerCase();

                        isTermInField = val && ~val.indexOf(term);

                        // Term matches the curren field! We don't need to
                        // keep looking in the remaining fields.
                        if (isTermInField) { break; }
                    }

                    if (!isTermInField) { return false; }
                }

                return true;
            }

            function receivableDateFilter(receivable) {
                return receivable.duedate >= $scope.dtInitial.getTime() &&
                    receivable.duedate <= $scope.dtFinal.getTime();
            }

            function filterReceivablesByQuery() {
                $scope.receivables.filtered = $filter('filter')($scope.receivables.filtered, receivableQueryFilter);
            }

            function filterReceivablesByDate() {
                setTime($scope.dtInitial, 0, 0, 0, 0);
                setTime($scope.dtFinal, 23, 59, 59, 999);
                $scope.receivables.filtered = $filter('filter')($scope.receivables.filtered, receivableDateFilter);
            }


            function filterReceivables() {
                $scope.receivables.filtered = ReceivableService.list();

                if ($scope.query) {
                    filterReceivablesByQuery();
                }

                filterReceivablesByDate();
            }


            $scope.$watch('receivables.filtered', function () {
                $scope.receivablesTotal = getReceivablesTotal();
            });

            $scope.$watch('dtInitial', filterReceivables);
            $scope.$watch('dtFinal', filterReceivables);
            $scope.$watch('query', filterReceivables);

            this.receivableDateFilter = receivableDateFilter;
            this.receivableQueryFilter = receivableQueryFilter;
        });
}(angular));
