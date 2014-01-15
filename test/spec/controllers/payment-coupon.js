describe('Controller: PaymentCouponCtrl', function() {
    var scope = {};

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.payment.coupon');
    });

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope) {

        // Scope mock
        scope = $rootScope.$new();

        // Injecting into the controller
        $controller('PaymentCouponCtrl', {
            $scope : scope
        });
    }));

    it('Should calculate totals - qty=5 ', function() {

        expect(scope.total).toEqual(0);

        for ( var ix in scope.list) {
            item = scope.list[ix];
            item.qty = 5;
        }

        scope.$apply();

        expect(scope.list[0].total).toEqual(25);
        expect(scope.list[1].total).toEqual(50);
        expect(scope.list[2].total).toEqual(100);
        expect(scope.list[3].total).toEqual(150);
        expect(scope.total).toEqual(325);

    });
    
    it('Should calculate totals - qty=23. ', function() {

        expect(scope.total).toEqual(0);

        for ( var ix in scope.list) {
            item = scope.list[ix];
            item.qty = 23;
        }

        scope.$apply();

        expect(scope.list[0].total).toEqual(115);
        expect(scope.list[1].total).toEqual(230);
        expect(scope.list[2].total).toEqual(460);
        expect(scope.list[3].total).toEqual(690);
        expect(scope.total).toEqual(1495);

    });
});
