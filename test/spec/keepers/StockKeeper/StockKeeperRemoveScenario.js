'use strict';

describe('Service: StockeeperRemoveScenario', function() {
    
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
     * @spec StockKeeper.cancel#1
     * Given a populated list of Stocks
     * And a valid stock entry
     * when and cancel is triggered
     * then a Stock must be updated  
     * </pre>
     */
    it('should cancel', function() {
        var ev = new Stock(110, 34, 50);
        var ev2 = new Stock(54, 12, 25);
        runs(function() {
            //then
            StockKeeper.handlers.stockAddV1(ev);
            StockKeeper.handlers.stockAddV1(ev2);
            //when
            StockKeeper.remove(110, 12);

        });

        waitsFor(function() {
            if (ArrayUtils.find(StockKeeper.list(), 'inventoryId', 110).quantity != ev.quantity) {
                return ArrayUtils.find(StockKeeper.list(), 'inventoryId', 110).quantity;
            }
        }, 'JournalKeeper is taking too long', 300);

        runs(function() {
            //then
            var stock = ArrayUtils.find(StockKeeper.list(), 'inventoryId', 110);
            expect(stock.inventoryId).toEqual(110);
            expect(stock.quantity).toEqual(22);
        });
    });
    
    /**
     * <pre>
     * @spec StockKeeper.remove#2
     * Given a invalid stock
     * when remove is triggered
     * then an error must be raised
     * </pre>
     */
    it('should reject promise', function() {
        var id = 13;
        var quantity = 5;
        var resolution = null;
        
        runs(function(){
            var promise = StockKeeper.remove(id, quantity);
            
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
    
    /**
     * <pre>
     * @spec StockKeeper.remove#3
     * Given a invalid stock
     * when remove is triggered
     * then an error must be raised
     * </pre>
     */
    it('should reject promise', function() {
        var id = -1;
        var quantity = 5;
        var resolution = null;
        
        runs(function(){
            var promise = StockKeeper.remove(id, quantity);
            
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
