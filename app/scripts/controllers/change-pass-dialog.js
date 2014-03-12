(function(angular) {
    'use strict';

    angular.module('tnt.catalog.dialog.changePassword.ctrl', []).controller(
        'ChangePassDialogCtrl',
        ['$scope', '$log', 'dialog', 'UserService', 'DialogService',
        function($scope, $log, dialog, UserService, DialogService) {


            /** Closes the change password dialog. */
            function closeDialog() {
                dialog.close();
            }


            // FIXME review these messages
            /**
             * Contains messages ready to be displayed to the end user.
             * This messages should have an id, which usually is an error
             * code received from Firebase.
             * @enum {String}
             */
            var Message = {
                /** The given password was not accepted. */
                INVALID_PASSWORD : 'Senha inválida.',

                /** Not connected to Firebase. */
                NOT_CONNECTED : 'Dispositivo não conectado à internet.',

                /** The given password is not safe enough. */
                UNSAFE_PASSWORD : 'Senhas devem conter pelo menos 6 caracteres.',

                /** Default error. */
                UNEXPECTED_ERROR : 'Houve um erro não esperado. Por favor, tente novamente.'
            };


            /**
             * Gets a proper error message for the given error.
             * @param {Object|string} err The error for which we need a message
             * @return {string} A proper error message.
             */
            function getMessageForError(err) {
                if (err) {
                    var errId = err.code || err.message || err;

                    switch (errId) {
                        case 'INVALID_PASSWORD':
                            return Message.INVALID_PASSWORD;
                        case 'Not connected to Firebase!':
                            return Message.NOT_CONNECTED;
                        case 'Password not safe enough':
                            return Message.UNSAFE_PASSWORD;
                    }
                }

                $log.debug('Unexpected error:', err);
                return Message.UNEXPECTED_ERROR;
            }


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
                        // err might come from the UserService or all the way
                        // from the SyncDriver.
                        DialogService.messageDialog({
                            title : 'Troca de senha',
                            message : getMessageForError(err),
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
