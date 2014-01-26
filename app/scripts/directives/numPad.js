(function(angular) {
    'use strict';

    var templateUrl = 'views/parts/catalog/num-pad.html';

    angular.module('tnt.catalog.directive.numpad.template', []).run(function($http, $templateCache) {
        $http.get(templateUrl, {
            cache : $templateCache
        });
    });

    angular
            .module('tnt.catalog.directive.numpad', [
                'tnt.catalog.keyboard.service'
            ])
            .directive(
                    'numPad',
                    function(KeyboardService, $document) {
                        return {
                            restrict : 'E',
                            scope : {},
                            templateUrl : templateUrl,
                            link : function postLink(scope, element, attrs) {

                                var mask =
                                        angular
                                                .element('<div class="unselectable" style="position: absolute; top: 0; left: 0; bottom: 0; right: 0"></div>');

                                var status = {};

                                var keyboard = {
                                    setActive : function(active) {
                                        status.active = active;
                                        // FIXME - Used to temporally resolve VOPP-210.
                                        status.changed = new Date().getTime();
                                        scope.isActive = active;
                                        if (active) {
                                            $document.find('body').append(mask);
                                            mask.bind('click', function(event) {
                                                if (!scope.isActive) {
                                                    mask.remove();
                                                } else {
                                                    KeyboardService.quit();
                                                    scope.$apply();
                                                    mask.remove();
                                                    var el = $(document.elementFromPoint(event.clientX, event.clientY));

                                                    if (!el.is(":disabled")) {
                                                        el.trigger('click');
                                                        el.trigger('focus');
                                                    }
                                                }
                                            });
                                        } else if (!('ontouchstart' in window || 'onmsgesturechange' in window)) {
                                            mask.remove();
                                        }
                                    },
                                    status : status
                                };

                                KeyboardService.setKeyboard(keyboard);
                                scope.keypress = KeyboardService.keypress;

                                $document.bind('keydown', function(evt) {
                                    if (scope.isActive) {
                                        switch (evt.keyCode) {
                                        case 8:
                                            scope.$apply('keypress(\'backspace\')');
                                            break;
                                        case 13:
                                            scope.$apply('keypress(\'ok\')');
                                            break;
                                        case 48:
                                        case 96:
                                            scope.$apply('keypress(\'0\')');
                                            break;
                                        case 49:
                                        case 97:
                                            scope.$apply('keypress(\'1\')');
                                            break;
                                        case 50:
                                        case 98:
                                            scope.$apply('keypress(\'2\')');
                                            break;
                                        case 51:
                                        case 99:
                                            scope.$apply('keypress(\'3\')');
                                            break;
                                        case 52:
                                        case 100:
                                            scope.$apply('keypress(\'4\')');
                                            break;
                                        case 53:
                                        case 101:
                                            scope.$apply('keypress(\'5\')');
                                            break;
                                        case 54:
                                        case 102:
                                            scope.$apply('keypress(\'6\')');
                                            break;
                                        case 55:
                                        case 103:
                                            scope.$apply('keypress(\'7\')');
                                            break;
                                        case 56:
                                        case 104:
                                            scope.$apply('keypress(\'8\')');
                                            break;
                                        case 57:
                                        case 105:
                                            scope.$apply('keypress(\'9\')');
                                            break;
                                        case 111:
                                        case 191:
                                            scope.$apply('keypress(\'/\')');
                                            break;
                                        }
                                        evt.preventDefault();
                                    }
                                });

                                element.find("img[alt='0']").bind('tap', function(event) {
                                    event.stopPropagation();
                                    event.preventDefault();
                                    scope.$apply('keypress(\'0\')');
                                });
                                element.find("img[alt='00']").bind('tap', function(event) {
                                    event.stopPropagation();
                                    event.preventDefault();
                                    scope.$apply('keypress(\'00\')');
                                });
                                element.find("img[alt='1']").bind('tap', function(event) {
                                    event.stopPropagation();
                                    event.preventDefault();
                                    scope.$apply('keypress(\'1\')');
                                });
                                element.find("img[alt='2']").bind('tap', function(event) {
                                    event.stopPropagation();
                                    event.preventDefault();
                                    scope.$apply('keypress(\'2\')');
                                });
                                element.find("img[alt='3']").bind('tap', function(event) {
                                    event.stopPropagation();
                                    event.preventDefault();
                                    scope.$apply('keypress(\'3\')');
                                });
                                element.find("img[alt='4']").bind('tap', function(event) {
                                    event.stopPropagation();
                                    event.preventDefault();
                                    scope.$apply('keypress(\'4\')');
                                });
                                element.find("img[alt='5']").bind('tap', function(event) {
                                    event.stopPropagation();
                                    event.preventDefault();
                                    scope.$apply('keypress(\'5\')');
                                });
                                element.find("img[alt='6']").bind('tap', function(event) {
                                    event.stopPropagation();
                                    event.preventDefault();
                                    scope.$apply('keypress(\'6\')');
                                });
                                element.find("img[alt='7']").bind('tap', function(event) {
                                    event.stopPropagation();
                                    event.preventDefault();
                                    scope.$apply('keypress(\'7\')');
                                });
                                element.find("img[alt='8']").bind('tap', function(event) {
                                    event.stopPropagation();
                                    event.preventDefault();
                                    scope.$apply('keypress(\'8\')');
                                });
                                element.find("img[alt='9']").bind('tap', function(event) {
                                    event.stopPropagation();
                                    event.preventDefault();
                                    scope.$apply('keypress(\'9\')');
                                });
                                element.find("img[alt='backspace']").bind('tap', function(event) {
                                    event.stopPropagation();
                                    event.preventDefault();
                                    scope.$apply('keypress(\'backspace\')');
                                });
                                element.find("img[alt='clear']").bind('tap', function(event) {
                                    event.stopPropagation();
                                    event.preventDefault();
                                    scope.$apply('keypress(\'clear\')');
                                });
                                element.find("img[alt='ok']").bind('tap', function(event) {
                                    event.stopPropagation();
                                    event.preventDefault();
                                    scope.$apply('keypress(\'ok\')');
                                });
                            }
                        };
                    });
}(angular));
