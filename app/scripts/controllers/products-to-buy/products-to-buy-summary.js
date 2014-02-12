(function(angular) {
    'use strict';
    angular.module('tnt.catalog.productsToBuy.summary.ctrl', []).controller(
            'ProductsToBuySummaryCtrl',
            function($scope, $filter, $log) {

                // if the order total is less then the amount use the fee.
                var discounts = [
                    {
                        amount : 555,
                        fee : 0
                    }, {
                        amount : 890,
                        fee : 0.25
                    }, {
                        amount : 1410,
                        fee : 0.3
                    }, {
                        amount : 2460,
                        fee : 0.35
                    }, {
                        fee : 0.4
                    }
                ];

                $scope.summary = {};
                $scope.summary.orderTotal = 0;
                $scope.summary.orderTotal2 = 0;
                $scope.summary.discount = 0;
                $scope.summary.freight = 0;
                $scope.summary.orderTotalDiscount = 0;
                $scope.summary.pointsTotal = 0;
                $scope.nextDiscount = {};

                function calculateTotals(args) {
                    $scope.summary.orderTotal = args.amount;
                    $scope.summary.pointsTotal = args.points;

                    calculateDiscount();
                }

                function calculateDiscount() {
                    for ( var ix in discounts) {
                        var nix = Number(ix);
                        // if the order total is less then the amount use the
                        // fee.
                        if ($scope.summary.orderTotal < discounts[nix].amount) {

                            var appliedFee = (1 - discounts[nix].fee);

                            $scope.summary.discount = discounts[nix].fee * 100;
                            $scope.summary.orderTotalDiscount = financialRound($scope.summary.orderTotal * appliedFee);

                            $scope.nextDiscount.amount = (discounts[nix].amount - $scope.summary.orderTotal);
                            $scope.nextDiscount.percent = 100 * (discounts[nix + 1].fee);

                            $log.info('Faltam ' + $filter('currency')($scope.nextDiscount.amount) + ' para a classe de desconto de ' +
                                $scope.nextDiscount.percent + '%.');

                            break;
                        } else if (!discounts[nix + 1]) {
                            $scope.nextDiscount.amount = 0;
                            $scope.nextDiscount.percent = discounts[discounts.length - 1].fee;
                            console.log('Você está na classe de desconto máximo.');
                        }
                    }

                }

                function financialRound(value) {
                    return (Math.round(100 * value) / 100);
                }

                $scope.$on('updateSummary', function(event, args) {
                    calculateTotals(args);
                    $scope.$emit('summaryUpdated', $scope.summary);
                });
            });
}(angular));