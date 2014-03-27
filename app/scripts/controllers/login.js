(function(angular) {
    'use strict';

    angular.module('tnt.catalog.login.ctrl', [
        'tnt.catalog.user'
    ]).controller('LoginCtrl', ['$scope', '$log', '$location', 'UserService', 'DialogService', function($scope, $log, $location, UserService, DialogService) {

        function hasPersistedUser() {
            return !!localStorage.user;
        }

        if(hasPersistedUser()) {
            $scope.user = localStorage.user;
        }
        
        $scope.hasPersistedUser = hasPersistedUser;


        $scope.changeUser = function () {
            $log.debug('Switching user...');

            UserService.hasUnsyncedData().then(function (hasUnsyncedData) {
                console.log('Has unsynced Data?', hasUnsyncedData);

                if (hasUnsyncedData) {
                    // Oh, no! There are unsynced entries!
                    $log.debug('Trying to switch users with unsynced entries.');
                    DialogService.messageDialog({
                        title : 'Atenção! Dados podem ser perdidos!',
                        message : 'Alguns dados não foram salvos no servidor e serão ' +
                            'excluídos permanentemente ao trocar de usuário. ' +
                            'Tem certeza de que deseja continuar?',
                        btnYes : 'Sim, tenho certeza.',
                        btnNo : 'Não'
                    }).then(function () {
                        $log.debug('Unsynced data has been deleted to switch user!');
                        return UserService.clearData().then(function () {
                            $scope.pass = '';
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

                var msg = err && err.code === 'SERVER_ERROR' ?
                  'Autenticação offline não disponível. Verifique sua conexão com a Internet e tente novamente.' :
                  'Usuário e/ou senha inválidos. Por favor tente novamente.';

                DialogService.messageDialog({
                    title : 'Login',
                    message : msg,
                    btnYes : 'Voltar'
                });
            });
        };
    }]);
}(angular));
