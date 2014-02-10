xdescribe('Controller: voucher-active', function() {

    var scope = {};
    var ArrayUtils = {};
    var PaymentService = {};
    var VoucherKeeper = {};
    var OrderService = {};
    var EntityService = {};

    beforeEach(function() {
        module('tnt.catalog.voucher.active.ctrl');
    });

    beforeEach(inject(function($controller, $rootScope) {
        // scope mock
        scope = $rootScope.$new();
    }));

    beforeEach(inject(function($controller, $rootScope) {
        $controller('VoucherActiveCtrl', {
            $scope : scope,
            ArrayUtils : ArrayUtils,
            VoucherKeeper : VoucherKeeper,
            PaymentService : PaymentService,
            OrderService : OrderService,
            EntityService : EntityService
        });
    }));

    it('should filter', function() {
        scope.filteredVouchers = [
            {
                entity : 'Kira',
                type : 'coupon'
            }
        ];

        scope.voucherFilter = {
            value : 'al',
            date : new Date()
        };
        
        console.log(scope.voucherFilter.value.length);
        
        scope.filter();
        
        expect(scope.filteredVouchers.length).toBe(0);

    });

});