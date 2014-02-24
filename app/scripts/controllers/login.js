(function(angular) {
    'use strict';

    angular.module('tnt.catalog.login.ctrl', [
        'tnt.catalog.user'
    ]).controller('LoginCtrl', function($scope, $log, $location, UserService, DialogService) {
        
        $scope.hasPersistedUser = function () {
            return localStorage.user;
        };

        if(localStorage.user !== "undefined"){
            $scope.user = localStorage.user;
        }


        $scope.changeUser = function () {
            $log.debug('Switching user...');

            UserService.hasUnsyncedData().then(function (hasUnsyncedData) {
                console.log('Has unsynced Data?', hasUnsyncedData);

                if (hasUnsyncedData) {
                    // Oh, no! There are unsynced entries!
                    $log.debug('Trying to switch users with unsynced entries.');
                    DialogService.messageDialog({
                        title : 'Atenção! Dados podem ser perdidos!',
                        message : 'Alguns dados não foram salvos no servidor. '
                            + 'Ao trocar de usuário estes dados serão excluídos permanentemente. '
                            + 'Tem certeza de que deseja continuar?',
                        btnYes : 'Sim, tenho certeza.',
                        btnNo : 'Não'
                    }).then(function () {
                        $log.debug('Unsynced data has been deleted to switch user!');
                        return UserService.clearData().then(function () {
                            $log.debug('User data cleared.');
                            $scope.user = '';
                            // We may need to call $scope.$apply()...
                        });
                    }, function () {
                        $log.debug('Aborted user change due to unsynced data.');
                    });
                } else {
                    console.log('Switch user! No unsynced data found.');
                    return UserService.clearData().then(function () {
                      $log.debug('User data cleared.');
                      $scope.user = '';
                    });
                }
            });
        };

        
        $scope.login = function() {
            return UserService.login($scope.user, $scope.pass, $scope.rememberMe).then(function() {
                $log.debug('Logged in as ', $scope.user);
                $location.path('/');
            }, function(err) {
                $log.debug('Failed to login!', err);
                DialogService.messageDialog({
                    title : 'Login',
                    message : 'Usuário ou senha inválidos. Por favor tente novamente.',
                    btnYes : 'Voltar'
                });
            });
        };

    });
}(angular));
