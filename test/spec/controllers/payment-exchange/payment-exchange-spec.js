'use strict';

describe('Controller: PaymentExchangeCtrl', function() {

    var scope = {};
    var DialogService = {};
    var PaymentService = {};
    var InventoryKeeper = {};
    var exchanges = [];
    
    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.payment.exchange');
        module('tnt.catalog.payment.service');
        module('tnt.catalog.inventory.keeper');
        module('tnt.catalog.inventory.entity');
        module('tnt.utils.array');

    });
    
    beforeEach(function() {
        exchanges.length = 0;

        InventoryKeeper.read = jasmine.createSpy('read').andReturn([{id: 1}]);
        PaymentService.add = jasmine.createSpy('add');
        PaymentService.clear = jasmine.createSpy('clear');
        PaymentService.list = jasmine.createSpy('PaymentService.list').andReturn(exchanges);
    });

    beforeEach(inject(function($controller, $rootScope) {
        // scope mock
        scope = $rootScope.$new();

        $controller('PaymentExchangeCtrl', {
            $scope : scope,
            PaymentService : PaymentService,
            InventoryKeeper : InventoryKeeper,
            DialogService : DialogService
        });
        spyOn(scope , 'computeTotals').andCallThrough();
    }));

    it('should add an exchange to the list', function() {
        scope.productId = 1;
        scope.qty = 5;
        scope.amount = 22.3;

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

        scope.add();

        expect(scope.exchanges[0].amount).toEqual(result);
        expect(scope.computeTotals).toHaveBeenCalled();
    });
});
