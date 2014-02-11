describe('Controller: voucher-active', function() {

    var scope = {};
    var PaymentService = {};
    var OrderService = {};

    beforeEach(function() {
        module('tnt.catalog.voucher.active.ctrl');
        module('tnt.catalog.filter.sum');
    });

    beforeEach(inject(function($controller, $rootScope) {
        // scope mock
        scope = $rootScope.$new();

    }));

    beforeEach(inject(function($controller, $rootScope, $filter) {
        $controller('VoucherActiveCtrl', {
            $scope : scope,
            PaymentService : PaymentService,
            OrderService : OrderService
        });
    }));

    it('should filter by entity', function() {
        var expected = {
            entity : 'Kira',
            type : 'coupon',
            created : new Date()
        };

        scope.filteredActiveVouchers = [
            expected, {
                entity : 'Thiago',
                type : 'coupon',
                created : new Date()
            }, {
                entity : 'Mathias',
                type : 'coupon',
                created : new Date()
            }
        ];

        scope.voucherFilter = {
            value : 'ki',
            date : new Date()
        };

        scope.filter();

        expect(scope.filteredVouchers[0]).toBe(expected);

    });

    it('should filter by type', function() {
        var expected = {
            entity : 'Fabio',
            type : 'voucher',
            created : new Date()
        };

        scope.filteredActiveVouchers = [
            {
                entity : 'Arnaldo',
                type : 'coupon',
                created : new Date()
            }, {
                entity : 'Wesley',
                type : 'giftCard',
                created : new Date()
            }, expected

        ];

        scope.voucherFilter = {
            value : 'vou',
            date : new Date()
        };

        scope.filter();

        expect(scope.filteredVouchers[0]).toBe(expected);

    });
    
    it('should filter by amount', function() {
        var expected = {
            entity : 'Fabio',
            type : 'voucher',
            amount : 20,
            created : new Date()
        };

        scope.filteredActiveVouchers = [
            {
                entity : 'Arnaldo',
                type : 'coupon',
                amount : 30,
                created : new Date()
            }, {
                entity : 'Wesley',
                type : 'giftCard',
                amount : 40,
                created : new Date()
            }, expected

        ];

        scope.voucherFilter = {
            value : '2',
            date : new Date()
        };

        scope.filter();

        expect(scope.filteredVouchers[0]).toBe(expected);

    });

    it('should filter by date', function() {
        var fabio = {
            entity : 'Fabio',
            type : 'voucher',
            created : 1392116940748
        };

        var arnaldo = {
            entity : 'Arnaldo',
            type : 'coupon',
            created : 1392016940748
        };

        var wesley = {
            entity : 'Wesley',
            type : 'giftCard',
            created : 1392216940748
        };

        scope.filteredActiveVouchers = [
            arnaldo, wesley, fabio
        ];

        var date = new Date();
        date.setTime(1392116940748);

        scope.voucherFilter = {
            value : '',
            date : date
        };

        scope.filter();

        var expected = [
            wesley, fabio
        ];

        expect(scope.filteredVouchers).toEqual(expected);

    });

});