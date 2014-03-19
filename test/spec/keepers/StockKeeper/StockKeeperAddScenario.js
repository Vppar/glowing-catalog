'use strict';

describe('Service: StockKeeperAddScenario', function() {

    var logger = angular.noop;

    var log = {
        debug : logger,
        error : logger,
        warn : logger,
        fatal : logger
    };

    beforeEach(function() {
        localStorage.deviceId = 1;
        module('tnt.catalog.stock');
        module('tnt.catalog.stock.keeper');
        module('tnt.catalog.stock.entity');

        module(function($provide) {
          $provide.value('$log', log);
        });
    });

    var StockKeeper = undefined;
    var Stock = undefined;
    var JournalKeeper = undefined;
    var $rootScope = undefined;


    beforeEach(inject(function(_$rootScope_, _StockKeeper_, _Stock_, _JournalKeeper_) {
        StockKeeper = _StockKeeper_;
        Stock = _Stock_;
        $rootScope = _$rootScope_;
        JournalKeeper = _JournalKeeper_;
    }));


    beforeEach(nukeData);

    
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

        var added = false;

        runs(function() {
            //when
            var promise = StockKeeper.add(ev);
            promise.then(function (result) {
              log.debug('Stock added!', result);
              added = true;
            }, function (err) {
              log.debug('Failed to add Stock', err);
            });

            $rootScope.$apply();
        });

        waitsFor(function() {
            return added;
        }, 'StockKeeper.add()');

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
        

        // Add Stock
        var added = false;

        runs(function() {
            var promise = StockKeeper.add(ev);
            
            promise.then(function (result) {
                log.debug('Stock added!', result);
                added = true;
            }, function (err) {
                log.debug('Failed to add Stock!', err);
            });

            $rootScope.$apply();
        });

        waitsFor(function() {
            return added;
        }, 'first call to StockKeeper.add()');

        // Update stock
        var updated = false;

        runs(function () {
            var promise = StockKeeper.add(ev2);

            promise.then(function (result) {
                log.debug('Stock updated!', result);
                updated = true;
            }, function (err) {
                log.debug('Failed to update Stock!', err);
            });

            $rootScope.$apply();
        });

        waitsFor(function () {
          return updated;
        }, 'second call to StockKeeper.add()');

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
            
            promise.then(null, function(_resolution_){
                resolution = _resolution_;
            });
        });
        
        waitsFor(function(){
            $rootScope.$apply();
            return !!resolution;
        }, 'JournalKeeper is taking too long');
        
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
            
            promise.then(null, function(_resolution_){
                resolution = _resolution_;
            });
        });
        
        waitsFor(function(){
            $rootScope.$apply();
            return !!resolution;
        }, 'JournalKeeper is taking too long');
        
        runs(function(){
            expect(resolution).toBe('Wrong instance of Stock');
        });
    });


    function nukeData() {
        var nuked = null;

        runs(function () {
            JournalKeeper.nuke().then(function () {
                log.debug('Nuked data!');
                nuked = true;
            });

            $rootScope.$apply();
        });

        waitsFor(function () {
            return nuked;
        }, 'JournalKeeper.nuke()');
    }
    
});
