(function(angular, $) {

    'use strict';

    angular.module('glowingCatalogApp').directive('scrollSpy', function($window) {
        return {
            restrict : 'A',
            controller : function($scope) {
                $scope.spies = [];
                this.addSpy = function(spyObj) {
                    $scope.spies.unshift(spyObj);
                };

                this.batata = function(id) {
                    $scope.scrollTo = id;
                    $scope.$apply();
                };
            },
            link : function(scope, elem, attrs) {
                var spyElems = [];
                var container = elem.find('#scrollContainer');
                scope.$watch('spies', function(spies) {
                    for ( var ix in spies) {
                        var spy = spies[ix];
                        if (!spyElems[spy.id]) {
                            spyElems[spy.id] = elem.find('#' + spy.id);
                        }
                    }
                });

                scope.$watch('scrollTo', function(id) {
                    if (id) {
                        console.log(id);
                        var pos = elem.find('#' + id).offset().top - 80 + container.scrollTop();

                        container.scrollTop(pos);
                    }
                });

                container.scroll(function() {
                    var highlightSpy, pos, spy, spies;
                    highlightSpy = null;
                    spies = scope.spies;
                    for ( var ix in spies) {
                        spy = spies[ix];
                        spy.out();
                        
                        if (spyElems[spy.id] && spyElems[spy.id].position() && (pos = spyElems[spy.id].position().top) - $window.scrollY <= 10) {
                            spy.pos = pos;
                            if (highlightSpy === null || highlightSpy.pos < spy.pos) {
                                highlightSpy = spy;
                            }
                        }
                    }
                    if (highlightSpy !== null) {
                        highlightSpy["in"]();
                    }
                });
            }
        };
    });
})(angular, jQuery);