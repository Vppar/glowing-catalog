(function(angular) {
    'use strict';

    angular.module('tnt.catalog.login.ctrl', [
        'tnt.catalog.user'
    ]).controller('LoginCtrl', function($scope, $log, $location, UserService, DialogService) {

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
