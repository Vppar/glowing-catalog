(function(angular) {

    'use strict';

    angular.module('glowingCatalogApp').directive(
            'scrollSpy',
            function($window) {
                return {
                    restrict : 'A',
                    controller : function($scope) {
                        $scope.spies = [];
                        $scope.anchors = [];
                        
                        this.addSpy = function(spyObj) {
                            $scope.spies.unshift(spyObj);
                        };

                        this.delSpy = function(spyObj) {
                            var ix = $scope.spies.indexOf(spyObj);

                            $scope.spies.splice(ix, 1);
                        };
                        
                        this.addAnchor = function(anchorObj) {
                            $scope.anchors.unshift(anchorObj);
                        };

                        this.delAnchor = function(anchorObj) {
                            var ix = $scope.anchors.indexOf(anchorObj);

                            $scope.anchors.splice(ix, 1);
                        };

                        this.scroll = function(id) {
                            $scope.scrollTo = id;
                            $scope.$apply();
                        };
                    },
                    link : function(scope, elem) {
                        var spyElems = [];
                        var container = elem.find('#scrollContainer');
                        scope.$watch('anchors', function(anchors) {
                            
                            spyElems.splice(0, spyElems.length);
                            
                            for ( var ix in anchors) {
                                var anchor = anchors[ix];
                                spyElems[anchor.id] = elem.find('#' + anchor.id);
                            }
                        }, true);

                        scope.$watch('scrollTo', function(id) {
                            if (id) {
                                var pos = elem.find('#' + id).offset().top - 70 + container.scrollTop();
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

                                if (spyElems[spy.id] && spyElems[spy.id].position() &&
                                    (pos = spyElems[spy.id].position().top) - $window.scrollY <= 10) {
                                    spy.pos = pos;
                                    if (highlightSpy === null || highlightSpy.pos < spy.pos) {
                                        highlightSpy = spy;
                                    }
                                }
                            }
                            if (highlightSpy !== null) {
                                highlightSpy['in']();
                            }
                        });
                    }
                };
            });
})(angular);