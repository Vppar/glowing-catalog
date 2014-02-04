(function(angular) {
    'use strict';
    angular
        .module('tnt.catalog.financial.receivable.search.ctrl', [])
        .controller('ReceivableSearchCtrl', function($log, $scope, $filter, ReceivableService, EntityService, ArrayUtils) {

            function setTime(date, hours, minutes, seconds, milliseconds) {
                date.setHours(hours);
                date.setMinutes(minutes);
                date.setSeconds(seconds);
                date.setMilliseconds(milliseconds);
            }


            // FIXME: I'm using the whole entities list because the method
            // EntityKeeper.read() does not exist, thus, EntityService.read()
            // does not work. Once it's implemented, this should be updated
            // to use that method.
            // @see getEntity()
            // @see setEntityName()
            var entities = EntityService.list();

            $scope.receivables.list = [];

            $scope.query = '';
            $scope.dtInitial = new Date();
            $scope.dtFinal = new Date();

            var searchableFields = [
                'uuid', 'amount', 'type', 'remarks', 'entityName'
            ];

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
                $scope.receivables.list = $filter('filter')($scope.receivables.list, receivableQueryFilter);
            }

            function filterReceivablesByDate() {
                setTime($scope.dtInitial, 0, 0, 0, 0);
                setTime($scope.dtFinal, 23, 59, 59, 999);
                $scope.receivables.list = $filter('filter')($scope.receivables.list, receivableDateFilter);
            }


            function filterReceivables() {
                $scope.receivables.list = ReceivableService.list();

                for (var idx in $scope.receivables.list) {
                    if (!$scope.receivables.list[idx].entityName) {
                        setEntityName($scope.receivables.list[idx]);
                    }
                }

                if ($scope.query) {
                    filterReceivablesByQuery();
                }

                filterReceivablesByDate();
            }

            function getEntity(uuid) {
                return ArrayUtils.find(entities, 'uuid', uuid);
            }

            function setEntityName(receivable) {
                receivable.entityName = getEntity(receivable.entityId).name;
            }

            function ensureDateOrder() {
                if ($scope.dtInitial > $scope.dtFinal) {
                    var
                        initial = $scope.dtInitial,
                        final = $scope.dtFinal;

                    $scope.dtInitial = final;
                    $scope.dtFinal = initial;
                }
            }


            $scope.$watch('dtInitial', ensureDateOrder);
            $scope.$watch('dtFinal', ensureDateOrder);

            $scope.$watch('dtInitial', filterReceivables);
            $scope.$watch('dtFinal', filterReceivables);
            $scope.$watch('query', filterReceivables);


            this.receivableDateFilter = receivableDateFilter;
            this.receivableQueryFilter = receivableQueryFilter;
        });
}(angular));
