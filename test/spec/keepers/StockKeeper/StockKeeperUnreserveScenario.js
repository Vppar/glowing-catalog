'use strict';

describe('StockeeperUnreserveScenario', function() {
    
    // load the service's module
    beforeEach(function() {
        localStorage.deviceId = 1;
        module('tnt.catalog.stock');
        module('tnt.catalog.stock.keeper');
        module('tnt.catalog.stock.entity');
        module('tnt.catalog.financial.math.service');
    });

    // instantiate service
    var StockKeeper = undefined;
    var Stock = undefined;
    var Scope = undefined;
    var FinancialMathService = undefined;

    beforeEach(inject(function($rootScope, _StockKeeper_, _Stock_, _ArrayUtils_, _FinancialMathService_) {
        StockKeeper = _StockKeeper_;
        Stock = _Stock_;
        Scope = $rootScope;
        FinancialMathService = _FinancialMathService_;
    }));

    /**
     * <pre>
     * @spec StockKeeper.unreserve#1
     * Given a populated list of Stocks
     * And a valid stock entry
     * when reserve is triggered
     * then a Stock entry must be updated  
     * </pre>
     */
    it('should unreserve', function() {
        var result = null;
        var ev = new Stock(110, 34, 50);
        ev.reserve = 20;
        runs(function() {
            //then
            StockKeeper.handlers.stockAddV1(ev);
            //when
            StockKeeper.unreserve(110, 12).then(function(_result_){
                result = _result_;
            });

        });

        Scope.$apply();
        return !!result;

        runs(function() {
            //then
            expect(stock.reserve).toEqual(8);
        });
    });
    
    /**
     * <pre>
     * @spec StockKeeper.unreserve#2
     * Given a invalid stock
     * when remove is triggered
     * then an error must be raised
     * </pre>
     */
    it('should reject promise', function() {
        var id = 13;
        var reserve = 5;
        var resolution = null;
        
        runs(function(){
            var promise = StockKeeper.unreserve(id, reserve);
            
            promise.then(null, function(_resolution_){
                resolution = _resolution_;
            });
        });
        
        waitsFor(function(){
            Scope.$apply();
            return !!resolution;
        }, 'JournalKeeper is taking too long');
        
        runs(function(){
            expect(resolution).toBe('No stockable found with this inventoryId: ' + id);
        });
    });
    
});
