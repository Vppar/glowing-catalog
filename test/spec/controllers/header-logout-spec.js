describe('Controller:HeaderCtrl', function () {
    var scope = null;
    var DialogService = {};
    var OrderService = {};
    var SubscriptionServiceMock = {};
    var location = {};
    var UserService = {};
    var controller = null;
    var element = {};
    var CatalogConfigMock = null;

    element.find = jasmine.createSpy('element.find').andCallFake(function () {
        return {
            css : function () {
            }
        };
    });

    beforeEach(function () {
        module('tnt.catalog.header');
    });

    beforeEach(inject(function ($controller, $rootScope, _$q_) {

        CatalogConfigMock = {
            RIMEL : 'RIMEL',
            BLUSH : 'BLUSH',           
            GLOSS : 'GLOSS'
        };

        location.path = jasmine.createSpy('$location.path');
        // mock
        scope = $rootScope.$new();
        $q = _$q_;
        UserService.logout = jasmine.createSpy('UserService.logout');

        controller = $controller('HeaderCtrl', {
            $scope : scope,
            $q : _$q_,
            $location : location,
            OrderService : OrderService,
            DialogService : DialogService,
            UserService : UserService,
            $element : element,
            SubscriptionService : SubscriptionServiceMock,
            CatalogConfig : CatalogConfigMock
        });
    }));

    describe('When create controller.', function () {
        it('controller is accessible.', function () {
            expect(!!controller).toBe(true);
        });
    });

    describe('When logout is trigger', function () {
        var done = false;
        it('should redirect to login page when UserService logout properly.', function () {

            // mock happy scenario for logout
            UserService.logout.andCallFake(function () {
                var deferred = $q.defer();
                setTimeout(function () {
                    deferred.resolve();
                }, 0);
                return deferred.promise;
            });

            runs(function () {
                scope.logout().then(function () {
                    done = true;
                });
            });

            waitsFor(function () {
                scope.$apply();
                return done;
            }, 'scope.logout()');

            runs(function () {
                expect(UserService.logout).toHaveBeenCalled();
                expect(location.path).toHaveBeenCalledWith('/login');
            });
        });

        // Review this test.
        it('should redirect to login page when UserServcice can\'t logout', function () {
            var done = false;
            // mock unhappy scenario for logout
            UserService.logout.andCallFake(function () {
                var deferred = $q.defer();
                setTimeout(function () {
                    deferred.reject();
                }, 0);
                return deferred.promise;
            });

            runs(function () {
                scope.logout().then(function () {
                    done = true;
                });
            });

            waitsFor(function () {
                scope.$apply();
                return done;
            }, 'scope.logout()');

            runs(function () {
                expect(UserService.logout).toHaveBeenCalled();
                expect(location.path).toHaveBeenCalledWith('/login');
            });
        });
    });
});
