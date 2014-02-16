(function(angular) {
    'use strict';
    angular.module('tnt.catalog.productsToBuy.summary.ctrl', []).controller(
            'ProductsToBuySummaryCtrl',
            function($scope, $filter, $log) {

                // #####################################################################################################
                // Local variables
                // #####################################################################################################

                var financialRound = $scope.financialRound;

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
                var nextDiscount = {};

                // #####################################################################################################
                // Local Functions
                // #####################################################################################################

                function calculateDiscount() {
                    for ( var ix in discounts) {
                        var nix = Number(ix);
                        // if the order total is less then the amount use the
                        // fee.
                        if ($scope.summary.total.amount < discounts[nix].amount) {

                            var appliedFee = (1 - discounts[nix].fee);
                            $scope.summary.discount.fee = discounts[nix].fee * 100;
                            $scope.summary.total.amountWithDiscount = financialRound($scope.summary.total.amount * appliedFee);

                            nextDiscount.amount = financialRound(discounts[nix].amount - $scope.summary.total.amount);
                            nextDiscount.percent = 100 * (discounts[nix + 1].fee);

                            $log.info('Faltam ' + $filter('currency')(nextDiscount.amount) + ' para a classe de desconto de ' +
                                nextDiscount.percent + '%.');

                            break;
                        } else if (!discounts[nix + 1]) {
                            nextDiscount.amount = 0;
                            $scope.summary.discount.fee = discounts[nix].fee * 100;
                            nextDiscount.percent = discounts[discounts.length - 1].fee;
                            $log.info('Você está na classe de desconto máximo.');
                        }
                    }

                }

                // #####################################################################################################
                // Watchers
                // #####################################################################################################

                $scope.$watchCollection('summary.total.amount', function(newObj, oldObj) {
                    calculateDiscount();
                });

            });
}(angular));