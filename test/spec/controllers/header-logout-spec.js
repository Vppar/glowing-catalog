describe('Controller:HeaderCtrl', function() {
    var scope = null;
    var DialogService = {};
    var OrderService = {};
    var location = {};
    var UserService = {};
    var controller = null;

    beforeEach(function() {
        module('tnt.catalog.header');
        module('tnt.catalog.service.dialog');
    });

    beforeEach(inject(function($controller, $rootScope, _$q_) {

        location.path = jasmine.createSpy('$location.path');
        // mock
        scope = $rootScope.$new();
        $q = _$q_;
        UserService.logout = jasmine.createSpy('UserService.logout');
        DialogService.messageDialog = jasmine.createSpy('DialogService.messageDialog');
        
        controller = $controller('HeaderCtrl', {
            $scope : scope,
            $q : _$q_,
            $location : location,
            OrderService : OrderService,
            DialogService : DialogService,
            UserService : UserService
        });
    }));

    describe('When create controller.', function() {
        it('controller is accessible.', function() {
            expect(!!controller).toBe(true);
        });
    });

    describe('When logout is trigger', function() {
        var done = false;
        it('should redirect to login page when UserService logout properly.', function() {

            // mock happy scenario for logout
            UserService.logout.andCallFake(function() {
                var deferred = $q.defer();
                setTimeout(function() {
                    deferred.resolve();
                }, 0);
                return deferred.promise;
            });

            runs(function() {
                scope.logout().then(function() {
                    done = true;
                });
            });

            waitsFor(function() {
                scope.$apply();
                return done;
            }, 'scope.logout()');

            runs(function() {
                expect(UserService.logout).toHaveBeenCalled();
                expect(location.path).toHaveBeenCalledWith('/login');
            });
        });

        // Review this test.
        xit('should show message dialog when UserServcice can\'t logout', function() {
            var done = false;
            var dialog = {
                title : 'Logout',
                message : 'Have you tried to turn it off and on again?.',
                btnYes : 'Voltar'
            };
            // mock happy scenario for logout
            UserService.logout.andCallFake(function() {
                var deferred = $q.defer();
                setTimeout(function() {
                    deferred.reject();
                }, 0);
                return deferred.promise;
            });

            runs(function() {
                scope.logout().then(function() {
                    done = true;
                });
            });

            waitsFor(function() {
                scope.$apply();
                return done;
            }, 'scope.logout()');

            runs(function() {
                expect(UserService.logout).toHaveBeenCalled();
                expect(DialogService.messageDialog).toHaveBeenCalledWith(dialog);
            });
        });
    });
});
