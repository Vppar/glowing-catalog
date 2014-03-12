describe('ChangePassDialogCtrl', function() {

    var logger = angular.noop;

    var $scope = null;

    var $log = {
        debug : logger,
        fatal : logger,
        error : logger,
        warn : logger
    };

    var UserServiceMock = {};
    var DialogServiceMock = {};
    var dialogMock = {};


    beforeEach(function () {
        module('tnt.catalog.dialog.changePassword.ctrl');
    });


    beforeEach(function () {
        UserServiceMock.changePassword = jasmine.createSpy('UserService.changePassword()');
        DialogServiceMock.messageDialog = jasmine.createSpy('DialogServiceMock.messageDialog()');

        dialogMock.close = jasmine.createSpy('dialog.close()');
    });


    beforeEach(inject(function ($q, $controller, $rootScope) {
        PromiseHelper.config($q, $log.debug);

        $scope = $rootScope.$new();
        ChangePassDialogCtrl = $controller('ChangePassDialogCtrl', {
            $scope : $scope,
            $log : $log,
            dialog : dialogMock,
            UserService : UserServiceMock,
            DialogService : DialogServiceMock
        });
    }));


    describe('$scope.changePassword()', function () {
        beforeEach(function () {
            // Simulate a valid form submission...
            $scope.changePasswordForm = {
                $valid : true
            };

            $scope.$apply();

            UserServiceMock.changePassword.andCallFake(PromiseHelper.resolved(true));
            DialogServiceMock.messageDialog.andCallFake(PromiseHelper.resolved(true));
        });

        it('is accessible', function () {
            expect($scope.changePassword).toBeDefined();
        });

        it('is a function', function () {
            expect(typeof $scope.changePassword).toBe('function');
        });


        it('does NOT change the password if the form is not valid', function () {
            $scope.changePasswordForm.$valid = false;
            $scope.$apply();

            $scope.changePassword();

            expect(UserServiceMock.changePassword).not.toHaveBeenCalled();
        });

        it('shows a message if the form is not valid', function() {
            $scope.changePasswordForm.$valid = false;
            $scope.$apply();

            $scope.changePassword();

            expect(DialogServiceMock.messageDialog).toHaveBeenCalled();
            var args = DialogServiceMock.messageDialog.calls[0].args;
            expect(args[0].message).toBe('Verifique se as senhas inseridas estão corretas.');
        });

        it('tries to change the password if the form is valid', function () {
            $scope.changePassword();
            expect(UserServiceMock.changePassword).toHaveBeenCalled();
        });

        it('passes the right data to the change password function', function () {
            $scope.oldPassword = 'oldPassword';
            $scope.newPassword = 'newPassword';
            $scope.$apply();

            $scope.changePassword();
            var args = UserServiceMock.changePassword.calls[0].args;
            expect(args[0]).toBe($scope.oldPassword);
            expect(args[1]).toBe($scope.newPassword);
        });

        it('shows a message if the password was successfully changed', function () {
            $scope.oldPassword = 'oldPassword';
            $scope.newPassword = 'newPassword';
            $scope.$apply();

            var resolved = false;

            runs(function () {
                $scope.changePassword();
            });

            waitsFor(function () {
                $scope.$apply();
                return DialogServiceMock.messageDialog.calls.length;
            });
        });



        describe('error message handling', function () {
            it('shows PROPER proper message if the wrong password is passed', function () {
                UserServiceMock.changePassword.andCallFake(PromiseHelper.rejected('INVALID_PASSWORD'));
                $scope.oldPassword = 'oldPassword';
                $scope.newPassword = 'newPassword';
                $scope.$apply();

                var resolved = false;

                runs(function () {
                    $scope.changePassword();
                });

                waitsFor(function () {
                    $scope.$apply();
                    return DialogServiceMock.messageDialog.calls.length;
                });

                runs(function () {
                    var args = DialogServiceMock.messageDialog.calls[0].args;
                    expect(args[0].message).toBe('Senha inválida.');
                });
            });


            it('shows PROPER proper message if not connected to Firebase', function () {
                UserServiceMock.changePassword.andCallFake(PromiseHelper.rejected('Not connected to Firebase!'));
                $scope.oldPassword = 'oldPassword';
                $scope.newPassword = 'newPassword';
                $scope.$apply();

                var resolved = false;

                runs(function () {
                    $scope.changePassword();
                });

                waitsFor(function () {
                    $scope.$apply();
                    return DialogServiceMock.messageDialog.calls.length;
                });

                runs(function () {
                    var args = DialogServiceMock.messageDialog.calls[0].args;
                    expect(args[0].message).toBe('Dispositivo não conectado à internet.');
                });
            });


            it('shows PROPER proper message if password is not safe enough', function () {
                UserServiceMock.changePassword.andCallFake(PromiseHelper.rejected('Password not safe enough'));
                $scope.oldPassword = 'oldPassword';
                $scope.newPassword = 'newPassword';
                $scope.$apply();

                var resolved = false;

                runs(function () {
                    $scope.changePassword();
                });

                waitsFor(function () {
                    $scope.$apply();
                    return DialogServiceMock.messageDialog.calls.length;
                });

                runs(function () {
                    var args = DialogServiceMock.messageDialog.calls[0].args;
                    expect(args[0].message).toBe('Senhas devem conter pelo menos 6 caracteres.');
                });
            });
        }); // error message handling
    }); // $scope.changePassword()


});
