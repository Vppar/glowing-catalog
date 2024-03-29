describe('Controller: voucher-historic', function() {

    var scope = {};
    var PaymentService = {};
    var OrderService = {};

    beforeEach(function() {
        module('tnt.catalog.voucher.historic.ctrl');
        module('tnt.catalog.filter.sum');
    });

    beforeEach(inject(function($controller, $rootScope) {
        // scope mock
        scope = $rootScope.$new();

    }));

    beforeEach(inject(function($controller, $rootScope, $filter) {
        $controller('VoucherHistoricCtrl', {
            $scope : scope,
            PaymentService : PaymentService,
            OrderService : OrderService
        });
    }));

    it('should filter by entity', function() {

        scope.allVouchers = [
            {
                entity : 'Kira',
                type : 'coupon',
                created : new Date(),
                canceled : new Date()
            }, {
                entity : 'Thiago',
                type : 'coupon',
                created : new Date(),
                redeemed : new Date()
            }, {
                entity : 'Mathias',
                type : 'coupon',
                created : new Date(),
                redeemed : new Date()
            }
        ];

        scope.historicVoucher = {
            dtInitial : new Date(),
            dtFinal : new Date(),
            value : 'ki'
        };

        scope.filter();

        expect(scope.historicVouchers.length).toBe(1);

    });

    it('should filter by type', function() {
        var expected = {
            entity : 'Fabio',
            type : 'voucher',
            created : new Date()
        };

        scope.allVouchers = [
            {
                entity : 'Arnaldo',
                type : 'coupon',
                created : new Date(),
                redeemed : new Date()
            }, {
                entity : 'Wesley',
                type : 'giftCard',
                created : new Date(),
                redeemed : new Date()
            }, expected

        ];

        scope.historicVoucher = {
            dtInitial : new Date(),
            dtFinal : new Date(),
            value : 'vou'
        };

        scope.filter();

        expect(scope.historicVouchers[0].type).toBe(expected.type);

    });

    it('should filter by type', function() {
        var expected = {
            entity : 'Fabio',
            type : 'voucher',
            amount : 20,
            created : new Date(),
            redeemed : new Date()
        };

        scope.allVouchers = [
            {
                entity : 'Arnaldo',
                type : 'coupon',
                amount : 30,
                created : new Date(),
                redeemed : new Date()
            }, {
                entity : 'Wesley',
                type : 'giftCard',
                amount : 40,
                created : new Date(),
                redeemed : new Date()
            }, expected

        ];

        scope.historicVoucher = {
            dtInitial : new Date(),
            dtFinal : new Date(),
            value : '2'
        };

        scope.filter();

        expect(scope.historicVouchers[0].type).toBe(expected.type);
        expect(scope.historicVouchers[0].entity).toBe(expected.entity);

    });

    it('should filter by initial date', function() {
        var fabio = {
            entity : 'Fabio',
            type : 'voucher',
            created : 1392116940748,
            redeemed : 1392116940748
        };

        var arnaldo = {
            entity : 'Arnaldo',
            type : 'coupon',
            created : 1392016940748,
            canceled : 1392016940748
        };

        var wesley = {
            entity : 'Wesley',
            type : 'giftCard',
            created : 1392216940748,
            redeemed : 1392216940748
        };

        scope.allVouchers = [
            arnaldo, wesley, fabio
        ];

        var date = new Date();
        date.setTime(1392116940748);

        scope.historicVoucher = {
            dtInitial : date,
            dtFinal : '',
            value : ''
        };

        scope.filter();

        // Creating the copy entities without the redeemed and canceled
        // properties

        var expected = [
            wesley, fabio
        ];

        expect(scope.historicVouchers).toEqual(expected);

    });

    it('should filter by final date', function() {
        var fabio = {
            entity : 'Fabio',
            type : 'voucher',
            created : 1392116940748,
            redeemed : 1392116940748
        };

        var arnaldo = {
            entity : 'Arnaldo',
            type : 'coupon',
            created : 1392016940748,
            canceled : 1392016940748
        };

        var wesley = {
            entity : 'Wesley',
            type : 'giftCard',
            created : 1392216940748,
            redeemed : 1392216940748
        };

        scope.allVouchers = [
            arnaldo, wesley, fabio
        ];

        var date = new Date();
        date.setTime(1392116940748);

        scope.historicVoucher = {
            dtInitial : '',
            dtFinal : date,
            value : ''
        };

        scope.filter();

        // Creating the copy entities without the redeemed and canceled
        // properties
        var arnaldo2 = angular.copy(arnaldo);
        delete arnaldo2.canceled;

        var fabio2 = angular.copy(fabio);
        delete fabio2.redeemed;

        var expected = [
            arnaldo, fabio
        ];

        expect(scope.historicVouchers).toEqual(expected);

    });

});