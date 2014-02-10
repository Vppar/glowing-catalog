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
    var Scope = undefined;

    beforeEach(inject(function($rootScope, _StockKeeper_, _Stock_, _ArrayUtils_, WebSQLDriver) {
        
        WebSQLDriver.transaction(function(tx){
            WebSQLDriver.dropBucket(tx, 'JournalEntry');
        });
        
        StockKeeper = _StockKeeper_;
        Stock = _Stock_;
        Scope = $rootScope;
    }));

    /**
     * <pre>
     * @spec StockKeeper.reserve#1
     * Given a populated list of Stocks
     * And a valid stock entry
     * when reserve is triggered
     * then a Stock entry must be create  
     * </pre>
     */
    it('should reserve new item', function() {
        var result = null;
        runs(function() {
            //when
            StockKeeper.reserve(2,2).then(function(_result_){
                result = _result_;
            });

        });

        waitsFor(function(){
            Scope.$apply();
            return !!result;
        }, 'JournalKeeper is taking too long', 500);

        runs(function() {
            //then
            expect(result).toEqual(2);
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
    it('should reserve', function() {
        var result = null;
        var ev = new Stock(110, 24, 50);
        runs(function() {
            //then
            StockKeeper.handlers.stockAddV1(ev);
            //when
            StockKeeper.reserve(110,12).then(function(_result_){
                result = _result_;
            });

        });

        waitsFor(function(){
            Scope.$apply();
            return !!result;
        }, 'JournalKeeper is taking too long', 500);

        runs(function() {
            //then
            expect(result).toEqual(12);
        });
    });
  
});
