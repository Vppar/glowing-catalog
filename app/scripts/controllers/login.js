'use strict';

angular.module('tnt.catalog.login.ctrl', [
    'tnt.catalog.user'
]).controller('LoginCtrl', function($scope, $location, UserService, DialogService) {

    var acceptCredentials = function() {
        $location.path('/');
    };

    var denyCredentials = function() {
        DialogService.messageDialog({
            title : 'Login',
            message : 'Não foi possível realizar o login, usuário ou senha inválidos.',
            btnYes : 'Voltar'
        });
    };

    $scope.login = function() {
        return UserService.login($scope.user, $scope.pass, $scope.rememberMe).then(acceptCredentials, denyCredentials);
    };

});
