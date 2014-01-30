'use strict';

describe('Service: OrderKeeperAddScenario', function() {

    beforeEach(function() {
        module('tnt.catalog.order');
        module('tnt.catalog.order.keeper');
        module('tnt.catalog.order.entity');
    });

    var OrderKeeper = null;
    var Order = null;
    var $rootScope = null;

    beforeEach(inject(function(_OrderKeeper_, _Order_, _$rootScope_) {
        OrderKeeper = _OrderKeeper_;
        Order = _Order_;
        $rootScope = _$rootScope_;
    }));

    /**
     * <pre>
     * @spec OrderKeeper.add#1
     * Given a valid Order
     * when create is triggered
     * then a order must be created
     * and the entry must be registered
     * </pre>
     */
    it('should add a order', function() {
        var ev = null
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
            OrderKeeper.add(ev);
        });

        waitsFor(function() {
            return OrderKeeper.list().length;
        }, 'JournalKeeper is taking too long', 300);

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
});
