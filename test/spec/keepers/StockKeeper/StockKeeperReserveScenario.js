'use strict';

describe('StockeeperReserveScenario', function() {

    var logger = angular.noop;

    var log = {
        debug : logger,
        error : logger,
        warn : logger,
        fatal : logger
    };
    
    // load the service's module
    beforeEach(function() {
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
    var $rootScope = undefined;
    var JournalKeeper = undefined;

    beforeEach(inject(function(_$rootScope_, _StockKeeper_, _Stock_, _ArrayUtils_, _JournalKeeper_) {
        StockKeeper = _StockKeeper_;
        Stock = _Stock_;
        $rootScope = _$rootScope_;
        JournalKeeper = _JournalKeeper_;
    }));

    beforeEach(nukeData);

    /**
     * <pre>
     * @spec StockKeeper.reserve#1
     * Given a populated list of Stocks
     * And a valid stock entry
     * when reserve is triggered
     * then a Stock entry must be created
     * </pre>
     */
    it('should reserve new item', function() {
        var created = false;
        var entry = null;
        runs(function() {
            //when
            var promise = StockKeeper.reserve(2, 2);
            
            promise.then(function(result){
                log.debug('Stock created on reserve!', result);
                created = true;
                entry = result;
            }, function (err) {
                log.debug('Failed to create stock!', err);
            });

            $rootScope.$apply();
        });

        waitsFor(function(){
            return created;
        }, 'StockKeeper.reserve()');

        runs(function() {
            //then
            expect(entry).toEqual(2);
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
            $rootScope.$apply();
            return !!result;
        }, 'JournalKeeper is taking too long', 500);

        runs(function() {
            //then
            expect(result).toEqual(12);
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
