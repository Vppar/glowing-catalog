(function(angular) {
    'use strict';

    angular.module('glowingCatalogApp').controller(
        'ChangePassDialogCtrl',
        ['$scope', 'dialog', 'UserService', 'DialogService',
        function($scope, dialog, UserService, DialogService) {

            function closeDialog() {
                dialog.close();
            }



            /**
             * @enum {String}
             */
            var ChangePasswordError = {
                INVALID_PASSWORD : 'INVALID_PASSWORD'
            };


            function changePassword() {
                if ($scope.changePasswordForm.$valid) {
                    var oldPassword = $scope.oldPassword;
                    var newPassword = $scope.newPassword;

                    var promise = UserService.changePassword(oldPassword, newPassword);

                    promise.then(function () {
                        DialogService.messageDialog({
                            title : 'Troca de senha',
                            message : 'Senha alterada com sucesso!',
                            btnYes : 'OK'
                        }).then(function () {
                            closeDialog();
                        });
                    }, function (err) {
                        err = err.code || err.message || err;

                        // FIXME need to check possible error messages and
                        // create a user-friendly one.

                        var message = '';

                        switch (err) {
                            case ChangePasswordError.INVALID_PASSWORD:
                                message = 'Senha antiga inválida!';
                                break;
                        }

                        DialogService.messageDialog({
                            title : 'Troca de senha',
                            message : 'Não foi possível alterar sua senha. ' + message,
                            btnYes : 'OK'
                        });
                    });
                } else {
                    DialogService.messageDialog({
                        title : 'Troca de senha',
                        message : 'Verifique se as senhas inseridas estão corretas.',
                        btnYes : 'OK'
                    });
                }
            }


            $scope.oldPassword = '';
            $scope.newPassword = '';
            $scope.newPasswordVerification = '';

            $scope.closeDialog = closeDialog;
            $scope.changePassword = changePassword;
        }]);
}(angular));
