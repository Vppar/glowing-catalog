(function(angular) {
    'use strict';

    var TEMPLATE_URL = 'components/date-range/date-range.html';

    // Matches YYYY-MM-DD dates
    var ISO_DATE = /\d{4}\-\d{2}\-\d{2}/;

    var count = 0;
    var foo = 0;


    function getDateString(date) {
        var day = date.getDate();
        var month = date.getMonth();
        var year = date.getFullYear();

        if (day < 10) {
            day = '0' + day;
        }

        if (month < 10) {
            month = '0' + month;
        }

        return date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear();
    }


    function getNow() {
        return new Date();
    }


    function parseDate(val) {
        var date = new Date();

        if (ISO_DATE.test(val)) {
            date.setTime(Date.parse(val));
            return date;
        }

        if (val === 'now') {
            return getNow;
        }

        val = parseInt(val);

        if (val !== NaN) {
            date.setTime(val);
            return date;
        }

        return null;
    }


    function createId() {
        count += 1;
        return 'dateRangeInput' + count;
    }


    angular.module('glowingCatalogApp').run([
        '$http',
        '$templateCache',
        function ($http, $templateCache) {
            $http.get(TEMPLATE_URL, {
                cache : $templateCache
            });
        }
    ]);


    angular
        .module('tnt.catalog.components.dateRange', [])
        .directive('dateRange', [function () {
            return {
                restrict : 'E',
                templateUrl : TEMPLATE_URL,
                scope : {
                    min : '=',
                    max : '=',
                    id : '@',
                    model : '=ngModel',
                    disabled : '@'
                },
                link : function (scope, element, attrs) {
                    var min = parseDate(scope.min);
                    var max = parseDate(scope.max);
                    var id = scope.id;
                    var model = scope.model;

                    var resolvedMin = null;
                    var resolvedMax = null;


                    /**
                     * Checks if min/max are functions and, if so, execute
                     * and expose the returned value in the scope.
                     */
                    function resolveMinMax() {
                        scope.resolvedMin = resolvedMin =
                            typeof min === 'function' ? min() : min;

                        scope.resolvedMax = resolvedMax =
                            typeof max === 'function' ? max() : max;
                    }

                    // Update the min/max resolved values whenever the dates
                    // in the range change
                    scope.$watchCollection('model', resolveMinMax);

                    console.log('>>> model', model);

                    if (min && max) {
                        // Swap min and max values if min is a later date than
                        // max, ensuring that max is always the latest.
                        if (resolvedMin > resolvedMax) {
                            var tmp = min;
                            min = max;
                            max = tmp;
                        }
                    }

                    if (!id) {
                        id = scope.id = createId();
                    }

                    scope.$watch('model.start', function () {
                        var start = model.start;
                        var end = model.end;

                        if (start && end && start > end) {
                            end = new Date(start.getTime());
                        }

                        model.end = end;
                    });

                    scope.$watch('model.end', function () {
                        var start = model.start;
                        var end = model.end;

                        if (start && end && end < start) {
                            start = new Date(end.getTime());
                        }

                        model.start = start;
                    });


                    scope.$watchCollection('model', function () {
                        var start = model.start;
                        var end = model.end;

                        if (resolvedMin) {
                            if (start && start < resolvedMin) {
                                start = new Date(resolvedMin.getTime());
                            }

                            if (end && end < resolvedMin) {
                                end = new Date(resolvedMin.getTime());
                            }
                        }

                        if (resolvedMax) {
                            if (start && start > resolvedMax) {
                                start = new Date(resolvedMax.getTime());
                            }

                            if (end && end > resolvedMax) {
                                end = new Date(resolvedMax.getTime());
                            }
                        }

                        model.start = start;
                        model.end = end;
                    });

                }
            };
        }]);
}(angular));
