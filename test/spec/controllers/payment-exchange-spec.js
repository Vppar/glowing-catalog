'use strict';

describe('Controller: PaymentExchangeCtrl', function() {

    var scope = {};
    var ps = {};
    var arMock = {};

    // load the controller's module
    beforeEach(function() {
        module('tnt.catalog.payment.exchange');
        module('tnt.catalog.inventory.keeper');
        module('tnt.catalog.inventory.entity');
        module('tnt.utils.array');

    });

    beforeEach(inject(function($controller, $rootScope, _InventoryKeeper_) {
        // scope mock
        scope = $rootScope.$new();

        arMock.find = jasmine.createSpy('find').andReturn(
                { price:30.0, title:'A product', option:'yellow'}
        );

        $controller('PaymentExchangeCtrl', {
            $scope : scope,
            PaymentService : ps,
            InventoryKeeper : _InventoryKeeper_,
            ArrayUtils : arMock
        });
    }));

    it('should add an exchange to the list', function() {

        scope.productId = 1;
        scope.qty = 5;
        scope.amount = 22.3;
        scope.exchanges = [];

        scope.add();

        scope.$apply();
        expect(scope.exchanges.length).toEqual(1);

    });
    
    it('should increment the index when add a value to the exchanges list', function() {
        // given

        scope.productId = 1;
        scope.index = 10;
        scope.qty = 5;
        scope.amount = 22.3;
        
        scope.exchanges = [];
        
        scope.add();
        
        scope.$apply();
        
        expect(scope.index).toEqual(11);

    });
    
    it('should add a correct value to the exchanges list', function() {
        // given

        scope.productId = 1;
        scope.qty = 5;
        scope.amount = 22.3;
        
        var result = 5*22.3;
        
        scope.exchanges = [];
        
        scope.add();
        scope.$apply();
        
        expect(scope.exchanges[0].title).toEqual('A product');
        expect(scope.exchanges[0].option).toEqual('yellow');
        expect(scope.exchanges[0].amount).toEqual(result);

    });
    
    
});
