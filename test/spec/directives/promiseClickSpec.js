'use strict';

describe('Directive: promiseClick\n', function() {

    var $compile = null;
    var $q = null;
    var element = null;
    var scope = null;
    var log = null;

    // load the directive's module
    beforeEach(function() {
        log = {};
        log.warn = jasmine.createSpy('log.warn');
        log.error = jasmine.createSpy('log.error');

        module('tnt.catalog.directives.promiseClick');
        module(function($provide) {
            $provide.value('$log', log);
        });
    });

    beforeEach(inject(function($rootScope, _$compile_, _$q_) {
        scope = $rootScope.$new();
        $compile = _$compile_;
        $q = _$q_;

    }));

    describe('Given a button with promiseClick directive \n', function() {
        describe('and function that returns a promise is passed\n', function() {
            describe('and has no ng-click\n', function() {
                var result = null;
                var deferred = null;

                beforeEach(function() {
                    // button with promiseClick directive no ng-click
                    element = angular.element('<button tnt-promise-click="myLie()"></button>');
                    element = $compile(element)(scope);
                    result = false;

                    // function that returns a promise
                    deferred = $q.defer();
                    scope.myLie = function() {
                        deferred.promise.then(function() {
                            result = true;
                        });
                        return deferred.promise;
                    };
                });

                describe('When the button is clicked\n', function() {
                    beforeEach(function() {
                        runs(function() {
                            element.trigger('click');
                        });

                        waitsFor(function() {
                            setTimeout(function() {
                                deferred.resolve();
                            }, 0);
                            scope.$apply();
                            return result;
                        });
                    });

                    it('Then should call the promise function', function() {
                        runs(function() {
                            expect(result).toBe(true);
                        });
                    });

                    it('shouldn\'t log any warning', function() {
                        runs(function() {
                            expect(log.warn).not.toHaveBeenCalled();
                        });
                    });

                    it('shouldn\'t log any error', function() {
                        runs(function() {
                            expect(log.error).not.toHaveBeenCalled();
                        });
                    });
                });
            });

            describe('and has ng-click\n', function() {
                var result = null;
                var deferred = null;

                beforeEach(function() {
                    // button with promiseClick directive no ng-click
                    element = angular.element('<button ng-click="{}" tnt-promise-click="myLie()"></button>');
                    element = $compile(element)(scope);
                    result = false;

                    // function that returns a promise
                    deferred = $q.defer();
                    scope.myLie = function() {
                        deferred.promise.then(function() {
                            result = true;
                        });
                        return deferred.promise;
                    };
                });

                describe('When the button is clicked\n', function() {

                    beforeEach(function() {
                        runs(function() {
                            element.trigger('click');
                        });

                        waitsFor(function() {
                            setTimeout(function() {
                                deferred.resolve();
                            }, 0);
                            scope.$apply();
                            return result;
                        });
                    });

                    it('Then should call the promise function', function() {
                        runs(function() {
                            expect(result).toBe(true);
                        });
                    });

                    it('should log warning', function() {
                        runs(function() {
                            expect(log.warn).toHaveBeenCalledWith(
                                    'A ngClick was used in conjunction with a promiseClick directive,' + ' the ngClick will be blocked.');
                        });
                    });

                    it('shouldn\'t log any error', function() {
                        runs(function() {
                            expect(log.error).not.toHaveBeenCalled();
                        });
                    });
                });
            });
        });

        describe('and function that returns a promise is not passed\n', function() {
            describe('and has ng-click\n', function() {

                var result = null;
                var deferred = null;

                beforeEach(function() {
                    // button with promiseClick directive no ng-click
                    element = angular.element('<button tnt-promise-click="myLie()"></button>');
                    element = $compile(element)(scope);
                    result = false;

                    // function that returns a promise
                    deferred = $q.defer();
                    scope.myLie = function() {
                        deferred.promise.then(function() {
                            result = true;
                        });
                        return {};
                    };
                });

                describe('When the button is clicked\n', function() {
                    beforeEach(function() {
                        runs(function() {
                            element.trigger('click');
                        });

                        waitsFor(function() {
                            setTimeout(function() {
                                deferred.resolve();
                            }, 0);
                            scope.$apply();
                            return result;
                        });
                    });

                    it('Then should call the promise function', function() {
                        runs(function() {
                            expect(result).toBe(true);
                        });
                    });

                    it('shouldn\'t log any warning', function() {
                        runs(function() {
                            expect(log.warn).not.toHaveBeenCalled();
                        });
                    });

                    it('shouldn\'t log any error', function() {
                        runs(function() {
                            expect(log.error).toHaveBeenCalledWith('The return of tntPromiseClick must return a promise.');
                        });
                    });
                });
            });

            describe('and has no ng-click\n', function() {
                var result = null;
                var deferred = null;

                beforeEach(function() {
                    // button with promiseClick directive no ng-click
                    element = angular.element('<button tnt-promise-click="myLie()"></button>');
                    element = $compile(element)(scope);
                    result = false;

                    // function that returns a promise
                    deferred = $q.defer();
                    scope.myLie = function() {
                        deferred.promise.then(function() {
                            result = true;
                        });
                        return {};
                    };
                });

                describe('When the button is clicked\n', function() {
                    beforeEach(function() {
                        runs(function() {
                            element.trigger('click');
                        });

                        waitsFor(function() {
                            setTimeout(function() {
                                deferred.resolve();
                            }, 0);
                            scope.$apply();
                            return result;
                        });
                    });

                    it('Then should call the promise function', function() {
                        runs(function() {
                            expect(result).toBe(true);
                        });
                    });

                    it('shouldn\'t log any warning', function() {
                        runs(function() {
                            expect(log.warn).not.toHaveBeenCalled();
                        });
                    });

                    it('shouldn\'t log any error', function() {
                        runs(function() {
                            expect(log.error).toHaveBeenCalledWith('The return of tntPromiseClick must return a promise.');
                        });
                    });
                });
            });
        });
    });
});
