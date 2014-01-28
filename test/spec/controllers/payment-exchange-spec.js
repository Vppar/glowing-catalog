'use strict';

describe('Controller: PaymentExchangeCtrl', function() {

    var scope = {};
    var arMock = {};
    var DialogService = {};
    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.payment.exchange');
        module('tnt.catalog.payment.service');
        module('tnt.catalog.inventory.keeper');
        module('tnt.catalog.inventory.entity');
        module('tnt.utils.array');

        arMock.find = jasmine.createSpy('find').andReturn({
            price : 30.0,
            title : 'A product',
            option : 'yellow',
            id : 1
        });
    });

    beforeEach(inject(function($controller, $rootScope, _InventoryKeeper_, _PaymentService_, _$q_) {
        // scope mock
        scope = $rootScope.$new();

        $controller('PaymentExchangeCtrl', {
            $scope : scope,
            PaymentService : _PaymentService_,
            InventoryKeeper : _InventoryKeeper_,
            ArrayUtils : arMock,
            DialogService : DialogService
        });
        scope.computeTotals = jasmine.createSpy('scope.computeTotals');
    }));

    it('should add an exchange to the list', function() {
        scope.productId = 1;
        scope.qty = 5;
        scope.amount = 22.3;
        scope.exchanges = [];

        scope.add();
        
        expect(scope.exchanges.length).toBe(1);
        expect(scope.exchanges[0].id).toBe(1);
        expect(scope.computeTotals).toHaveBeenCalled();

    });

    it('should increment the index when add a value to the exchanges list', function() {
        // given

        scope.productId = 1;
        scope.qty = 5;
        scope.amount = 22.3;

        scope.exchanges = [];

        scope.add();

        expect(scope.computeTotals).toHaveBeenCalled();

    });

    it('should add a correct value to the exchanges list', function() {
        // given

        scope.productId = 1;
        scope.qty = 5;
        scope.amount = 22.3;

        var result = 5 * 22.3;

        scope.exchanges = [];

        scope.add();

        expect(scope.exchanges[0].title).toEqual('A product');
        expect(scope.exchanges[0].option).toEqual('yellow');
        expect(scope.exchanges[0].amount).toEqual(result);
        expect(scope.computeTotals).toHaveBeenCalled();
    });
});
