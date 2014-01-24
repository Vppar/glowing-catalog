(function(angular) {
    'use strict';

    angular.module(
            'tnt.catalog.payment.discount',
            [
                'tnt.catalog.voucher.entity', 'tnt.catalog.voucher.keeper', 'tnt.catalog.payment.service', 'tnt.catalog.payment.entity',
                'tnt.utils.array'
            ]).controller('PaymentDiscountCtrl', function($scope, Voucher, VoucherKeeper, PaymentService, CouponPayment, ArrayUtils) {

         $scope.discounts = {
         voucher : VoucherKeeper.list('voucher'),
         coupon : VoucherKeeper.list('coupon'),
         giftCard : VoucherKeeper.list('giftCard')
         };

        // #############################################################################################
        // Scope variables
        // #############################################################################################

        var payments = PaymentService.list('coupon');

        $scope.paymentDiscounts = {
            voucher : ArrayUtils.list(payments, 'type', 'voucher'),
            coupon : ArrayUtils.list(payments, 'type', 'coupon'),
            giftCard : ArrayUtils.list(payments, 'type', 'giftCard')
        };
        $scope.checkBox = {
            voucher : [],
            giftCard : [],
            coupon : []
        };
        
//        $scope.discounts = {
//            voucher : [
//                {
//                    id : 1,
//                    entity : 0,
//                    created : new Date(),
//                    type : 'voucher',
//                    amount : 56,
//                }, {
//                    id : 2,
//                    entity : 0,
//                    created : new Date(),
//                    type : 'voucher',
//                    amount : 70,
//                }, {
//                    id : 3,
//                    entity : 0,
//                    created : new Date(),
//                    type : 'voucher',
//                    amount : 24,
//                }
//            ],
//            giftCard : [
//                {
//                    id : 1,
//                    entity : 0,
//                    type : 'giftCard',
//                    created : new Date(),
//                    amount : 11,
//                }, {
//                    id : 2,
//                    entity : 0,
//                    type : 'giftCard',
//                    created : new Date(),
//                    amount : 22,
//                }, {
//                    id : 3,
//                    entity : 0,
//                    type : 'giftCard',
//                    created : new Date(),
//                    amount : 33,
//                }
//            ],
//            coupon : [
//                {
//                    id : 1,
//                    entity : 0,
//                    type : 'coupon',
//                    created : new Date(),
//                    amount : 77,
//                }, {
//                    id : 2,
//                    entity : 0,
//                    type : 'coupon',
//                    created : new Date(),
//                    amount : 999,
//                }, {
//                    id : 3,
//                    entity : 0,
//                    type : 'coupon',
//                    created : new Date(),
//                    amount : 34,
//                }
//            ]
//        };
        // #############################################################################################
        // Scope functions
        // #############################################################################################
        $scope.checkBoxCtrl = function checkBoxCtrl(index, type) {
            if ($scope.checkBox[type][index] === true) {
                $scope.discounts[type][index].myInput = $scope.discounts[type][index].amount;
            } else {
                delete $scope.discounts[type][index].myInput;
            }
        };

        $scope.updateAmount = function updateAmount(index, type) {
            if ($scope.discounts[type][index].myInput > $scope.discounts[type][index].amount) {
                $scope.discounts[type][index].myInput = $scope.discounts[type][index].amount;
            }
        };

        $scope.confirmDiscounts = function confirmDiscounts() {
            finishDiscounts();
            $scope.selectPaymentMethod('none');
        };

        $scope.cancelDiscounts = function cancelDiscounts() {
            $scope.selectPaymentMethod('none');
        };

        // #############################################################################################
        // Aux functions
        // #############################################################################################
        function finishDiscounts() {
            var usedDiscounts = [];

            // get all the used vouchers
            for ( var type in $scope.discounts) {
                for ( var idx in $scope.discounts[type]) {
                    // check only used vouchers
                    if ($scope.checkBox[type][idx] === true) {
                        var usedDiscount = angular.copy($scope.discounts[type][idx]);
                        usedDiscounts.push(usedDiscount);
                    }
                }
            }
            
            // generate the payments
            PaymentService.clear('coupon');
            
            for ( var ix in usedDiscounts) {
                var data = usedDiscounts[ix];
                
                var payment = new CouponPayment(data.myInput);
                
                payment.couponId = data.id;
                payment.entity = data.entity;
                payment.type = data.type;
                payment.created = data.created;
                payment.remarks = data.remarks;
                payment.document = data.document;
                
                PaymentService.add(payment);
            }
        }

        // #############################################################################################
        // Controller warm up
        // #############################################################################################
        
        //Iterate through all discounts lists
        for (var ix in $scope.discounts){
            var discountList = $scope.discounts[ix];
            // Iterate through all discounts
            for(var ix2 in discountList){
                // Wow we have a single discount here
                var discount = discountList[ix2];
                // and here we have all used discounts
                var usedDiscounts = $scope.paymentDiscounts[ix];
                // Let's see if we can match it
                var usedDiscount = ArrayUtils.find(usedDiscounts,'couponId', discount.id);
                
                if(usedDiscount){
                    $scope.checkBox[ix][ix2] = true;
                    discount.myInput = usedDiscount.amount;
                }
            }
        }
        
    });
}(angular));
