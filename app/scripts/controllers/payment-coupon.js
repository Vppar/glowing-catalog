(function(angular) {
    'use strict';

    angular.module('tnt.catalog.payment.coupon', [
        'tnt.catalog.filter.findBy', 'tnt.catalog.service.coupon', 'tnt.catalog.service.dialog', 'tnt.utils.array'
    ]).controller(
            'PaymentCouponCtrl',
            function($scope, $log, CouponService, DialogService, ArrayUtils) {

                // #####################################################################################################
                // Warm up the controller
                // #####################################################################################################
                var errorMessage =
                        'Ocorreram erros na geração dos cupons. Na próxima sincronização do sistema um administrador será acionado.';

                $scope.total = 0;

                $scope.list = [
                    {
                        qty : 0,
                        amount : 5
                    }, {
                        qty : 0,
                        amount : 10
                    }, {
                        qty : 0,
                        amount : 20
                    }, {
                        qty : 0,
                        amount : 30
                    },
                ];

                for ( var ix in $scope.list) {
                    $scope.$watch('list[' + ix + '].qty', updateTotal);
                }

                function updateTotal() {
                    $scope.total = 0;
                    for ( var ix in $scope.list) {
                        $scope.list[ix].total = $scope.list[ix].qty * $scope.list[ix].amount;
                        $scope.total += $scope.list[ix].total;
                    }
                }

                $scope.confirmCoupons =
                        function confirmCoupons() {
                            $scope.coupon.total = $scope.total;
                            var entityId = $scope.customer.id;
                            var generatedCupons = [];
                            for ( var idx in $scope.list) {
                                var item = $scope.list[idx];
                                if (item.qty > 0) {
                                    // creates all requested coupons
                                    // with same amount.
                                    for ( var i = 0; i < item.qty; i++) {
                                        try {
                                            CouponService.create(entityId, item.amount);
                                            generatedCupons.push(item);
                                        } catch (err) {
                                            DialogService.messageDialog({
                                                title : 'Oops, erro interno.',
                                                message : errorMessage,
                                                btnYes : 'OK'
                                            });
                                            $log.fatal(new Date() + ' - There were problems in creating coupons. \n client ID:' + entityId +
                                                '\n' + 'Cupons to insert:' + JSON.stringify($scope.list) + '\n' + 'Cupons inserted:' +
                                                JSON.stringify(generatedCupons));
                                            // TODO keep track in journal?
                                        } finally {
                                            generatedCupons.clear;
                                            $scope.selectPaymentMethod('none');
                                        }
                                    }
                                }
                            }
                            $scope.selectPaymentMethod('none');
                        };
            });
}(angular));
