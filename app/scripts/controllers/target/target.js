(function (angular) {
    'use strict';
    angular.module('tnt.catalog.target.ctrl', []).controller(
        'TargetCtrl',
        [
            '$scope', '$location', 'Target', 'TargetService', 'UserService', 'FinancialMathService', 'Misplacedservice', 'IntentService',
            function ($scope, $location, Target, TargetService, UserService, FinancialMathService, Misplacedservice, IntentService) {

                UserService.redirectIfIsNotLoggedIn();

                $scope.dtFilter = {
                    dtInitial : new Date(),
                    dtFinal : new Date().getTime() + 86400000
                };

                if($scope.targetEdit){
                    loadTarget($scope.targetEdit);
                }else{
                    $scope.targetValue = {amount : 0};
                    $scope.selectedOptionId = {id : 0};
                    $scope.targets = [];
                    $scope.targetName = {name : ''};
                }

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

                $scope.confirm = function(){
                    var target = new Target(null,  $scope.targetsFinal, $scope.selectedOptionId.id , $scope.targetValue.amount, $scope.targetName.name);

                    if($scope.editable.select){
                        target = new Target($scope.selectedTarget.uuid, target.targets, target.type, target.totalAmount, target.name);

                        return TargetService.update(target).then(function(){
                            $location.path('/target-list');
                        });

                    }else{
                        return TargetService.add(target).then(function(){
                            $location.path('/target-list');
                        });
                    }
                };



                $scope.cancel = function(){
                    $location.path('/target-list');
                };

                $scope.$watchCollection('dtFilter', function(){

                    $scope.minDate = new Date($scope.dtFilter.dtInitial).getTime() + 86400000;
                    $scope.targetsFinal = targetCalc();
                });

                $scope.$watchCollection('selectedOptionId.id', function(){
                    $scope.targetsFinal = targetCalc();
                });

                $scope.updateValues = function(index){
                    if(index == ($scope.targetsFinal.length-1)){
                        recalc();
                    }else{
                        Misplacedservice.recalc($scope.targetValue.amount, index, $scope.targetsFinal, 'splitAmount');
                    }
                    splitSumCalc($scope.targetsFinal);
                };


                /**
                 * Function that calculates the amount for each split.
                 *
                 * @returns {Array}
                 */

                function targetCalc(){
                    var weekInitial = getWeekNumber($scope.dtFilter.dtInitial);
                    var weekFinal = getWeekNumber($scope.dtFilter.dtFinal);

                    var splitNumber = FinancialMathService.currencySubtract(weekFinal, weekInitial);

                    var splitAmount = 0;

                    if(splitNumber === 0){
                        splitAmount = $scope.targetValue.amount;
                    }

                    var targets = [];

                    for(var ix=0;ix<=splitNumber;ix++){

                        var initialDate = new Date($scope.dtFilter.dtInitial);
                        initialDate.setTime( initialDate.getTime() + 7*(ix)* 86400000 );

                        initialDate.setHours(23,0,0);
                        var finalDateTemp = new Date($scope.dtFilter.dtFinal).setHours(0,0,0);

                        if(initialDate>=finalDateTemp){
                            break;
                        }

                        var finalDate = new Date($scope.dtFilter.dtInitial);
                        finalDate.setTime( finalDate.getTime() + 7*(ix+1)* 86400000 );

                        if(finalDate.getTime()>finalDateTemp){
                            finalDate = $scope.dtFilter.dtFinal;
                        }

                        targets.push({ initial : initialDate,
                            final : finalDate,
                            splitAmount : 0
                        });
                    }

                    Misplacedservice.recalc($scope.targetValue.amount, -1, targets, 'splitAmount');
                    splitSumCalc(targets);

                    return targets;
                }

                function splitSumCalc(targets){
                    var splitSum = 0;
                    for(var ix in targets){
                        splitSum = FinancialMathService.currencySum(splitSum,Number(targets[ix].splitAmount));
                        targets[ix].splitSum = splitSum;
                    }
                }

                var amountWatcher = angular.noop;

                function enableAmountWatcher() {
                    amountWatcher = $scope.$watchCollection('targetValue.amount', targetValueWatcher);
                }


                var oldVal = 0;
                function targetValueWatcher(newVal){
                        if(newVal !== oldVal){
                            $scope.targetsFinal = targetCalc();
                        }
                    oldVal = newVal;
                }

                function disableAmountWatcher() {
                    amountWatcher();
                };

                enableAmountWatcher();

                function recalc(){
                    disableAmountWatcher();
                    var total = 0;
                    for(var ix in $scope.targetsFinal){
                        total = FinancialMathService.currencySum(total,$scope.targetsFinal[ix].splitAmount);
                    }
                    if(total != $scope.targetValue.amount){
                        $scope.targetValue.amount = total;
                        oldVal = total;
                    }
                    enableAmountWatcher();
                }


                function loadTarget(target){
                    $scope.selectedTarget.uuid = target.uuid;

                    $scope.targetsFinal = target.targets;
                    $scope.targetName = {name : target.name};
                    $scope.targetValue = {amount : target.totalAmount};
                    $scope.selectedOptionId = {id : target.type};

                    $scope.dtFilter.dtFinal = target.targets[target.targets.length - 1].final;
                    $scope.dtFilter.dtInitial = target.targets[0].initial;

                }

                /**
                 * Helper function to get number of weeks.
                 *
                 * @param d
                 * @returns {number}
                 */
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