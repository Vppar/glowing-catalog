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
            message : 'Usuário ou senha inválidos. Por favor tente novamente.',
            btnYes : 'Voltar'
        });
    };

    $scope.login = function() {
        return UserService.login($scope.user, $scope.pass, $scope.rememberMe).then(acceptCredentials, denyCredentials);
    };

});
