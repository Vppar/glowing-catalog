'use strict';

describe('Service: StockeeperRemoveScenario', function() {

    var logger = angular.noop;

    var log = {
        debug : logger,
        error : logger,
        warn : logger,
        fatal : logger
    };
    
    // load the service's module
    beforeEach(function() {
        localStorage.deviceId = 1;
        module('tnt.catalog.stock');
        module('tnt.catalog.stock.keeper');
        module('tnt.catalog.stock.entity');

        module(function($provide) {
          $provide.value('$log', log);
        });
    });

    // instantiate service
    var StockKeeper = undefined;
    var Stock = undefined;
    var ArrayUtils = undefined;
    var $rootScope = undefined;
    var JournalKeeper = undefined;
    var $q = undefined;

    beforeEach(inject(function(_$rootScope_, _$q_, _StockKeeper_, _Stock_, _ArrayUtils_, _JournalKeeper_) {
        StockKeeper = _StockKeeper_;
        Stock = _Stock_;
        ArrayUtils = _ArrayUtils_;
        $rootScope = _$rootScope_;
        JournalKeeper = _JournalKeeper_;
        $q = _$q_;
    }));

    beforeEach(nukeData);

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
        var ev1 = new Stock(110, 34, 50);
        var ev2 = new Stock(54, 12, 25);

        // Add Stock data
        var added = false;
        runs(function() {
            var promises = [];
            promises.push(StockKeeper.add(ev1));
            promises.push(StockKeeper.add(ev2));

            var promise = $q.all(promises);
            promise.then(function (result) {
                log.debug('Stock added!', result);
                added = true;
            }, function (err) {
                log.debug('Failed to add Stock!', err);
            });

            $rootScope.$apply();
        });

        waitsFor(function () {
            return added;
        }, 'Stock to be added', 500);

        // Remove stock
        var removed = false;
        runs(function () {
            var promise = StockKeeper.remove(110, 12);
            promise.then(function (result) {
                log.debug('Stock removed!', result);
                removed = true;
            }, function (err) {
                log.debug('Failed to remove Stock!', err);
            });

            $rootScope.$apply();
        });


        waitsFor(function () {
            return removed;
        }, 'StockKeeper.remove()', 300);

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
            
            promise.then(null, function(_resolution_){
                resolution = _resolution_;
            });
        });
        
        waitsFor(function(){
            $rootScope.$apply();
            return !!resolution;
        }, 'JournalKeeper is taking too long', 300);
        
        runs(function(){
            expect(resolution).toBe('No stockable found with this inventoryId: ' + id);
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
