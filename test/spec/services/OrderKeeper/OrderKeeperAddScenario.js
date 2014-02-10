'use strict';

describe('Service: OrderKeeperAddScenario', function() {

    var logger = angular.noop;

    var log = {
        debug : logger,
        error : logger,
        warn : logger,
        fatal : logger
    };

    beforeEach(function() {
        module('tnt.catalog.order');
        module('tnt.catalog.order.keeper');
        module('tnt.catalog.order.entity');

        module(function($provide) {
          $provide.value('$log', log);
        });
    });

    var OrderKeeper = null;
    var Order = null;
    var $rootScope = null;
    var JournalKeeper = null;

    beforeEach(inject(function(_OrderKeeper_, _Order_, _$rootScope_, _JournalKeeper_) {
        OrderKeeper = _OrderKeeper_;
        Order = _Order_;
        $rootScope = _$rootScope_;
        JournalKeeper = _JournalKeeper_;
    }));

    beforeEach(nukeData);

    /**
     * <pre>
     * @spec OrderKeeper.add#1
     * Given a valid Order
     * when create is triggered
     * then a order must be created
     * and the entry must be registered
     * </pre>
     */
    it('should add an order', function() {
        var ev = null
        var added = false;

        runs(function() {
            //givens
            var uuid = 'cc02b600-5d0b-11e3-96c3-010001000001';
            var code = '01-0001-14';
            var date = new Date();
            var canceled = false;
            var customerId = 2;
            var items = [];

            ev = new Order(uuid, code, canceled, date, customerId, items);

            //when
            var promise = OrderKeeper.add(ev);
            promise.then(function (result) {
                log.debug('Order added!', result);
                added = true;
            }, function (err) {
                log.debug('Failed to add Order!', err);
            });

            $rootScope.$apply();
        });


        waitsFor(function() {
            return added;
        }, 'OrderKeeper.add()', 300);


        runs(function() {
            //then
            expect(OrderKeeper.list().length).toBe(1);
            expect(OrderKeeper.list()[0].code).toBe(ev.code);

        });
    });
    
    /**
     * <pre>
     * @spec OrderKeeper.add#1
     * Given a invalid Order
     * when create is triggered
     * then a exception must be throw
     * </pre>
     */
    it('should not add a order', function() {
        //given
        var order = {
            uuid : 'cc02b600-5d0b-11e3-96c3-010001000001',
            code : '123',
            customerId : 2
        };
        
        var resolution = null;
        
        //when
        runs(function(){
            var promise = OrderKeeper.add(order);
            
            promise['catch'](function(_resolution_){
                resolution = _resolution_;
            });
        });
        
        waitsFor(function(){
            $rootScope.$apply();
            return !!resolution;
        }, 'Create is taking too long', 300);
        
        //then
        runs(function(){
            expect(resolution).toBe('Wrong instance to OrderKeeper');
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
