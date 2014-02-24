(function(angular) {
    'use strict';

    angular.module('tnt.catalog.login.ctrl', [
        'tnt.catalog.user'
    ]).controller('LoginCtrl', function($scope, $log, $location, UserService, DialogService) {
        
        if(localStorage.user !== "undefined"){
            $scope.user = localStorage.user;
        }
        
        $scope.login = function() {
            return UserService.login($scope.user, $scope.pass, $scope.rememberMe).then(function() {
                $log.debug('Logged in as ', $scope.user);
                $location.path('/');
            }, function(err) {
                $log.debug('Failed to login!', err);

                var msg = err && err.code === 'SERVER_ERROR' ?
                  'Autenticação offline não disponível. Verifique sua conexão com a Internet e tente novamente.' :
                  'Usuário ou senha inválidos. Por favor tente novamente.';

                DialogService.messageDialog({
                    title : 'Login',
                    message : msg,
                    btnYes : 'Voltar'
                });
            });
        };

    });
}(angular));
