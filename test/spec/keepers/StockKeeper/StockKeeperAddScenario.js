'use strict';

describe('Service: StockKeeperAddScenario', function() {

    beforeEach(function() {
        module('tnt.catalog.stock');
        module('tnt.catalog.stock.keeper');
        module('tnt.catalog.stock.entity');
    });

    var StockKeeper = undefined;
    var Stock = undefined;
    var Scope = undefined;
    beforeEach(inject(function($rootScope, _StockKeeper_, _Stock_, WebSQLDriver) {
      
        WebSQLDriver.transaction(function(tx){
            WebSQLDriver.dropBucket(tx, 'JournalEntry');
        });
      
        StockKeeper = _StockKeeper_;
        Stock = _Stock_;
        Scope = $rootScope;
    }));
    
    /**
     * <pre>
     * @spec StockKeeper.add#1
     * Given a valid stock
     * when add is triggered
     * then a stock must be created
     * </pre>
     */
    it('add a new stock', function() {
        //givens
        var ev = new Stock(110, 4, 50);
        runs(function() {
            //when
            StockKeeper.add(ev);
        });

        waitsFor(function() {
            return StockKeeper.list().length;
        }, 'JournalKeeper is taking too long', 300);

        runs(function() {
            //then
            expect(StockKeeper.list().length).toBe(1);
            expect(StockKeeper.list()[0].inventoryId).toBe(ev.inventoryId);
            expect(StockKeeper.list()[0].quanitity).toBe(ev.quanitity);

        });
    });

    /**
     * <pre>
     * @spec StockKeeper.add#1
     * Given a populated list with one stock
     * And stock entry with same inventoryId
     * when add is triggered
     * then a stock must be update with average cost and quantity sum
     * </pre>
     */
    it('update stock', function() {
        //givens
        var ev = new Stock(110, 3, 10);
        var ev2 = new Stock(110, 5, 35);
        var finalQuantity = (ev.quantity + ev2.quantity);
        var finalPrice = ((ev.quantity * ev.cost) + (ev2.quantity * ev2.cost)) / (ev.quantity + ev2.quantity);
        
        var go = false;
        runs(function() {
            //when
            StockKeeper.add(ev).then(function(){
                StockKeeper.add(ev2).then(function(){
                    go = true;
                });
            });
        });

        waitsFor(function() {
            return go;
        }, 'JournalKeeper is taking too long', 300);

        runs(function() {
            //then
            expect(StockKeeper.list().length).toBe(1);
            expect(StockKeeper.list()[0].inventoryId).toBe(110);
            expect(StockKeeper.list()[0].quantity).toBe(finalQuantity);
            expect(StockKeeper.list()[0].cost).toBe(finalPrice);
        });

    });
    
    /**
     * <pre>
     * @spec StockKeeper.add#2
     * Given a invalid stock
     * when and add is triggered
     * then an error must be raised
     * </pre> 
     */
    it('should reject promise', function() {

        var fakeStock = {
            pId : 23,
            qty : -1,
            ct : 0
        };

        var resolution = null;
        
        runs(function(){
            var promise = StockKeeper.add(fakeStock);
            
            promise['catch'](function(_resolution_){
                resolution = _resolution_;
            });
        });
        
        waitsFor(function(){
            Scope.$apply();
            return !!resolution;
        }, 'JournalKeeper is taking too long', 300);
        
        runs(function(){
            expect(resolution).toBe('Wrong instance of Stock');
        });
    });
    
    /**
     * <pre>
     * @spec StockKeeper.add#4
     * Given a invalid stock
     * when and add is triggered
     * then an error must be raised
     * </pre> 
     */
    it('should reject promise', function() {

        var fakeStock = {
            pId : 23,
            qty : 1,
            ct : -1
        };

        var resolution = null;
        
        runs(function(){
            var promise = StockKeeper.add(fakeStock);
            
            promise['catch'](function(_resolution_){
                resolution = _resolution_;
            });
        });
        
        waitsFor(function(){
            Scope.$apply();
            return !!resolution;
        }, 'JournalKeeper is taking too long', 300);
        
        runs(function(){
            expect(resolution).toBe('Wrong instance of Stock');
        });
    });

});
