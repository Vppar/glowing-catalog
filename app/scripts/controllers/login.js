(function(angular) {
    'use strict';

    angular.module('tnt.catalog.login.ctrl', [
        'tnt.catalog.user'
    ]).controller('LoginCtrl', function($scope, $location, UserService, DialogService) {

        $scope.login = function() {
            return UserService.login($scope.user, $scope.pass, $scope.rememberMe).then(function() {
                $location.path('/');
            }, function() {
                DialogService.messageDialog({
                    title : 'Login',
                    message : 'Usuário ou senha inválidos. Por favor tente novamente.',
                    btnYes : 'Voltar'
                });
            });
        };

    });
}(angular));