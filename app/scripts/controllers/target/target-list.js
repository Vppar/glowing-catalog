(function (angular) {
    'use strict';
    angular.module('tnt.catalog.target.list.ctrl', []).controller(
        'TargetListCtrl',
        [
            '$scope', '$location','Target', 'TargetService', 'UserService', 'FinancialMathService', 'Misplacedservice', 'IntentService',
            function ($scope, $location, Target, TargetService, UserService, FinancialMathService, Misplacedservice, IntentService) {

                UserService.redirectIfIsNotLoggedIn();

                $scope.targetList = TargetService.list();


                var targetOptions = [{
                    id:0,
                    describe:'Pontos de venda'
                },{
                    id:1,
                    describe:'Valor de venda '
                },{
                    id:2,
                    describe:'Pontos de Compra '
                }];

                function typeTranslator(){
                    for(var i in $scope.targetList){
                        var target = $scope.targetList[i];
                        target.typeDescribe = targetOptions[target.type].describe;
                    }
                }

                typeTranslator();

                $scope.edit = function(uuid){
                    IntentService.putBundle({editTarget : uuid});
                    $location.path('/target');

                };

                $scope.newTarget = function(){
                    $location.path('/target');
                };

                $scope.cancel = function(){
                    $location.path('/');
                };
            }
        ]);
})(angular);