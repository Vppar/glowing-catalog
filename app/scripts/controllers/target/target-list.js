(function (angular) {
    'use strict';
    angular.module('tnt.catalog.target.list.ctrl', []).controller(
        'TargetListCtrl',
        [
            '$scope', '$location','Target', 'TargetService', 'UserService', 'FinancialMathService', 'Misplacedservice', 'IntentService',
            function ($scope, $location, Target, TargetService, UserService, FinancialMathService, Misplacedservice, IntentService) {

                UserService.redirectIfIsNotLoggedIn();

                $scope.targetList = TargetService.list();

                function dateFormatter(date){
                    date = new Date(date);
                    var yyyy = date.getFullYear().toString();
                    var mm = (date.getMonth()+1).toString(); // getMonth() is zero-based
                    var dd  = date.getDate().toString();
                    return yyyy +'-' +(mm[1]?mm:"0"+mm[0]) + '-' +(dd[1]?dd:"0"+dd[0]); // padding
                };

                function translator(target){
                    var intervals =[];

                    for(var ix in target.targets){
                        var date = target.targets[ix].initial;

                        date = dateFormatter(date);

                        intervals[date] = {
                            order : Number(ix)+Number(1),
                            goal : target.targets[ix].goal,
                            snapshot: 0,
                            label : 'sem '+ (Number(ix)+Number(1))
                        };
                    };

                    return intervals;
                };

                for(var ix in $scope.targetList){
                    console.log(translator($scope.targetList[ix]));
                }


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