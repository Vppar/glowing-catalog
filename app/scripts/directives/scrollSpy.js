(function(angular) {

    'use strict';

    angular.module('glowingCatalogApp').directive(
            'scrollSpy',
            ['$window', function($window) {
                return {
                    restrict : 'A',
                    controller : function($scope) {
                        this.spies = [];
                        this.spyElems = [];
                        $scope.anchors = [];

                        this.addSpy = function(spyObj) {
                            this.spies.unshift(spyObj);
                        };

                        this.delSpy = function(spyObj) {
                            var ix = this.spies.indexOf(spyObj);
                            this.spies.splice(ix, 1);
                        };

                        this.addAnchor = function(anchorObj) {
                            this.spyElems[anchorObj.id] = anchorObj.element;
                        };

                        this.delAnchor = function(anchorObj) {
                            delete this.spyElems[anchorObj.id];
                        };

                        this.registerContainer = function(id) {
                            $scope.scrollContainer = id;
                            $scope.registerCallback(id);
                        };

                        this.scroll = function(id) {
                            $scope.scrollTo = id;
                        };
                    },
                    link : function(scope, elem, attrs, ctrl) {
                        
                        scope.$watch('scrollTo', function(id) {
                            var container = elem.find('#' + scope.scrollContainer);

                            if (id) {
                                var pos = ctrl.spyElems[id].offset().top - 70 + container.scrollTop();
                                container.scrollTop(pos);
                            }
                        });

                        function scrollCallback() {

                            var highlightSpy, pos, spy, spies;
                            highlightSpy = null;
                            spies = ctrl.spies;
                            for ( var ix in spies) {
                                spy = spies[ix];
                                spy.out();

                                if (ctrl.spyElems[spy.id] && ctrl.spyElems[spy.id].position() &&
                                    (pos = ctrl.spyElems[spy.id].position().top) - $window.scrollY <= 10) {
                                    spy.pos = pos;
                                    if (highlightSpy === null || highlightSpy.pos < spy.pos) {
                                        highlightSpy = spy;
                                    }
                                }
                            }
                            if (highlightSpy !== null) {
                                highlightSpy['in']();
                            }
                        }

                        scope.registerCallback = function(id) {
                            elem.find('#' + id).scroll(scrollCallback);
                        };
                    }
                };
            }]);
})(angular);