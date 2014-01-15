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

    it('find a proper name', function() {
        
        expect(scope.total).toEqual(0);
        scope.list[0].qty = 5;
        
        scope.$apply();
        
        expect(scope.total).toEqual(25);
        
    });
});
