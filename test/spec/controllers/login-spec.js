describe('Controller : LoginCtrl', function() {

    var scope = null;
    var controller = null;
    var DialogService = {};
    var UserService = {};
    var location = {};
    var DateUtils = {};

    beforeEach(function() {
        module('tnt.catalog.login.ctrl');
    });

    beforeEach(inject(function($controller, $rootScope, _$q_) {

        localStorage.dateDrift = 0;

        // mock
        scope = $rootScope.$new();
        $q = _$q_;
        UserService.login = jasmine.createSpy('UserService.login');
        location.path = jasmine.createSpy('location.path');
        DialogService.messageDialog = jasmine.createSpy('DialogService.messageDialog');

        DateUtils = {
            getDeviceDate: function() {
                return 0;
            }
        };

        spyOn(DateUtils, 'getDeviceDate').andReturn(1212312312);

        controller = $controller('LoginCtrl', {
            $q : _$q_,
            $scope : scope,
            DialogService : DialogService,
            UserService : UserService,
            $location : location,
            DateUtils : DateUtils
        });
    }));

    describe('When create controller', function() {
        it('controller is accessible', function() {
            expect(!!controller).toBe(true);
        });
    });

    describe('When login is triggered', function() {
        var done = null;
        var user = null;
        var pass = null;
        var rememberMe = null;
        beforeEach(function() {
            done = false;
            UserService.login.andCallFake(function(user, pass, rememberMe) {
                var deferred = $q.defer();
                setTimeout(function() {
                    if (pass === 'marykay') {
                        deferred.resolve();
                    } else {
                        deferred.reject();
                    }
                }, 0);
                return deferred.promise;
            });

        });

        it('should redirect to mainPage when UserServcice accept credentials', function() {
            user = 'Albert Eisntein';
            pass = 'marykay';
            rememberMe = true;
            runs(function() {
                scope.user = user;
                scope.pass = pass;
                scope.rememberMe = rememberMe;

                scope.login().then(function() {
                    done = true;
                });
            });

            waitsFor(function() {
                scope.$apply();
                return done;
            }, 'scope.login()');

            runs(function() {
                expect(UserService.login).toHaveBeenCalledWith(user, pass, rememberMe);
                expect(location.path).toHaveBeenCalledWith('/');
            });
        });

        it('should show messageDialog when UserServcice denied credentials', function() {
            var dialog = {
                title : 'Login',
                message : 'Usuário e/ou senha inválidos. Por favor tente novamente.',
                btnYes : 'Voltar'
            };
            
            runs(function() {
                user = 'Albert Eisntein';
                pass = 'mariquai';
                rememberMe = true;

                scope.user = user;
                scope.pass = pass;
                scope.rememberMe = rememberMe;

                scope.login().then(function() {
                    done = true;
                });
            });

            waitsFor(function() {
                scope.$apply();
                return done;
            }, 'scope.login()');

            runs(function() {
                expect(UserService.login).toHaveBeenCalledWith(user, pass, rememberMe);
                expect(DialogService.messageDialog).toHaveBeenCalledWith(dialog);
            });
        });

    });

});
