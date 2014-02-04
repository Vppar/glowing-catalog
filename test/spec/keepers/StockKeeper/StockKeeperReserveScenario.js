'use strict';

describe('StockeeperReserveScenario', function() {
    
    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.stock');
        module('tnt.catalog.stock.keeper');
        module('tnt.catalog.stock.entity');

    });

    // instantiate service
    var StockKeeper = undefined;
    var Stock = undefined;
    var ArrayUtils = undefined;
    var Scope = undefined;

    beforeEach(inject(function($rootScope, _StockKeeper_, _Stock_, _ArrayUtils_) {
        StockKeeper = _StockKeeper_;
        Stock = _Stock_;
        ArrayUtils = _ArrayUtils_;
        Scope = $rootScope;
    }));

    /**
     * <pre>
     * @spec StockKeeper.reserve#1
     * Given a populated list of Stocks
     * And a valid stock entry
     * when reserve is triggered
     * then a Stock entry must be updated  
     * </pre>
     */
    it('should reserve', function() {
        var ev = new Stock(110, 34, 50);
        runs(function() {
            //then
            StockKeeper.handlers.stockAddV1(ev);
            //when
            StockKeeper.reserve(110, 12);

        });

        waitsFor(function() {
            if (ArrayUtils.find(StockKeeper.list(), 'inventoryId', 110).reserve != ev.reserve) {
                return ArrayUtils.find(StockKeeper.list(), 'inventoryId', 110).reserve;
            }
        }, 'JournalKeeper is taking too long', 300);

        runs(function() {
            //then
            var stock = ArrayUtils.find(StockKeeper.list(), 'inventoryId', 110);
            expect(stock.inventoryId).toEqual(110);
            expect(stock.reserve).toEqual(12);
        });
    });
    
    /**
     * <pre>
     * @spec StockKeeper.reserve#2
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
            var promise = StockKeeper.reserve(id, reserve);
            
            promise['catch'](function(_resolution_){
                resolution = _resolution_;
            });
        });
        
        waitsFor(function(){
            Scope.$apply();
            return !!resolution;
        }, 'JournalKeeper is taking too long', 300);
        
        runs(function(){
            expect(resolution).toBe('No stockable found with this inventoryId: ' + id);
        });
    });
    
});
