describe('Controller: PaymentDiscountCtrlUpdateAmount', function() {

    var scope = {};
    var os = {};

    beforeEach(function() {
        module('tnt.catalog.payment.discount');
    });

    beforeEach(inject(function($controller, $rootScope) {
        // scope mock
        scope = $rootScope.$new();
        $controller('PaymentDiscountCtrl', {
            $scope : scope,
            OrderService : os
        });
    }));

    var discounts = {
        cred : [
            {
                created : new Date(),
                amount : 56,
            }, {
                created : new Date(),
                amount : 70,
            }, {
                created : new Date(),
                amount : 24,
            }
        ],
        gift : [
            {
                created : new Date(),
                amount : 11,
            }, {
                created : new Date(),
                amount : 22,
            }, {
                created : new Date(),
                amount : 33,
            }
        ],
        coupon : [
            {
                created : new Date(),
                amount : 77,
            }, {
                created : new Date(),
                amount : 999,
            }, {
                created : new Date(),
                amount : 34,
            }
        ]
    };
    
    var checkBox = {
            cred : [],
        };

    it('should limit the max value of the input', function() {
        // given
        scope.discounts = discounts;
        scope.discounts.cred[0].myInput = 888888;

        // when
        scope.updateAmount(0, 'cred');

        // then
        expect(scope.discounts.cred[0].myInput).toBe(scope.discounts.cred[0].amount);
    });
    
    it('should update the input value when the checkbox is checked', function() {
        // given
        scope.checkBox = checkBox;
        scope.discounts = discounts;
        scope.checkBox.cred[0] = true;

        // when
        scope.checkBoxCtrl(0, 'cred');

        // then
        expect(scope.discounts.cred[0].myInput).toBe(scope.discounts.cred[0].amount);
    });
});