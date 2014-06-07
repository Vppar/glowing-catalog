(function (angular) {
    'use strict';
    angular.module('tnt.catalog.target.ctrl', []).controller(
        'TargetCtrl',
        [
            '$scope', 'Target', 'TargetService', 'UserService',
            function ($scope, Target, TargetService, UserService) {

                UserService.redirectIfIsNotLoggedIn();

                $scope.dtFilter = {
                    dtInitial : new Date(),
                    dtFinal : new Date()
                };

                $scope.targetOptions = [{
                        id:0,
                        describe:'Pontos de venda'
                    },{
                        id:1,
                        describe:'Valor de venda '
                    },{
                        id:2,
                        describe:'Pontos de Compra '
                }];

                $scope.targetList = TargetService.list();
                console.log($scope.targetList);


                $scope.targets = [];

                $scope.targetName = 'PlaceholderName';

                $scope.selectedTarget = true;

                $scope.resetList = function(){
                    $scope.selectedTarget= true;
                };

                $scope.selectTarget = function(index){
                    $scope.selectedTarget= false;
                    $scope.selTarget = $scope.targetList[index];
                };

                $scope.confirm = function(){
                    var targetsFinal = targetCalc();

                    var target = new Target(null, targetsFinal, $scope.selectedOptionId , $scope.targetValue, $scope.targetName);

                    TargetService.add(target);
                };

                $scope.$watchCollection('selTarget', function(){

                });


                function targetCalc(){
                    var weekInitial = getWeekNumber($scope.dtFilter.dtInitial);
                    var weekFinal = getWeekNumber($scope.dtFilter.dtFinal);

                    var splitNumber = (weekFinal-weekInitial);
                    var splitAmount = $scope.targetValue/splitNumber;

                    var targets = [];

                    for(var ix=0;ix<splitNumber;ix++){

                        var initialDate = new Date($scope.dtFilter.dtInitial);
                        initialDate.setTime( initialDate.getTime() + 7*(ix)* 86400000 );

                        var finalDate = new Date($scope.dtFilter.dtInitial);
                        finalDate.setTime( finalDate.getTime() + 7*(ix+1)* 86400000 );

                        if((ix===(splitNumber-1)&& finalDate>$scope.dtFilter.dtFinal)){
                            finalDate = $scope.dtFilter.dtFinal;
                        }
                        targets.push({ initial : initialDate,
                            final : finalDate,
                            amount : splitAmount
                        });
                    }

                    return targets;
                }

                function getWeekNumber(d) {
                    // Copy date so don't modify original
                    d = new Date(d);
                    d.setHours(0,0,0);
                    // Set to nearest Thursday: current date + 4 - current day number
                    // Make Sunday's day number 7
                    d.setDate(d.getDate() + 4 - (d.getDay()||7));
                    // Get first day of year
                    var yearStart = new Date(d.getFullYear(),0,1);
                    // Calculate full weeks to nearest Thursday
                    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7)
                    // Return array of year and week number
                    return weekNo;
                }


            }
        ]);
})(angular);