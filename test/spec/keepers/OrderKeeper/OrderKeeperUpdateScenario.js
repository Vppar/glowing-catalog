'use strict';

describe('Service: OrderKeeperUpdateScenario', function() {

    // load the service's module
    beforeEach(function() {
        localStorage.deviceId = 1;
        module('tnt.catalog.order');
        module('tnt.catalog.order.keeper');
        module('tnt.catalog.order.entity');
        
    });
    
    // instantiate service
    var OrderKeeper = undefined;
    var Order = undefined;
    var ArrayUtils = undefined;
    var scope = undefined;
    
    beforeEach(inject(function(_$rootScope_, _OrderKeeper_, _Order_, _ArrayUtils_) {
        OrderKeeper = _OrderKeeper_;
        Order = _Order_;
        ArrayUtils = _ArrayUtils_;
        scope = _$rootScope_;
    }));
    
    it('should update', function() {
        result = false;
        
        runs(function(){
            //then
            var code = '123';
            var date = new Date();
            var canceled = false;
            var customerId = 2;
            var items = [];
            var actual;
            
            OrderKeeper.handlers.orderAddV1(new Order('cc02b600-5d0b-11e3-96c3-010001000001', code,canceled, date, customerId, items));
            OrderKeeper.handlers.orderAddV1(new Order('cc02b600-5d0b-11e3-96c3-010001000002', code,canceled, date, customerId, items));
            OrderKeeper.handlers.orderAddV1(new Order('cc02b600-5d0b-11e3-96c3-010001000003', code,canceled, date, customerId, items));
            OrderKeeper.handlers.orderAddV1(new Order('cc02b600-5d0b-11e3-96c3-010001000004', code,canceled, date, customerId, items));

            //when
            actual = OrderKeeper.update('cc02b600-5d0b-11e3-96c3-010001000002', [{test: 'updated'}]);
            actual.then(function(){
                result = true;
            });
            scope.$apply();
        });
        
        waitsFor(function(){
            return result; 
        }, 'JournalKeeper is taking too long', 300);
        
        runs(function(){
            //then
            var order = ArrayUtils.find(OrderKeeper.list(), 'uuid', 'cc02b600-5d0b-11e3-96c3-010001000002');
            expect(!angular.isUndefined(order.updated)).toBe(true);
            expect(order.items).toEqual([{test : 'updated'}]);
        });
    });
    
    it('should throw an exception', function() {
        //given
        var code = '123';
        var date = new Date();
        var canceled = false;
        var customerId = 2;
        var items = [];

        OrderKeeper.handlers.orderAddV1(new Order('cc02b600-5d0b-11e3-96c3-010001000001', code,canceled, date, customerId, items));
        OrderKeeper.handlers.orderAddV1(new Order('cc02b600-5d0b-11e3-96c3-010001000002', code,canceled, date, customerId, items));
        OrderKeeper.handlers.orderAddV1(new Order('cc02b600-5d0b-11e3-96c3-010001000003', code,canceled, date, customerId, items));
        OrderKeeper.handlers.orderAddV1(new Order('cc02b600-5d0b-11e3-96c3-010001000004', code,canceled, date, customerId, items));
        
        //when
        var createCall = function() {
            OrderKeeper.update('cc02b600-5d0b-11e3-96c3-010001000005', null);
        };
        
        //then
        expect(createCall).toThrow('Unable to find an order with uuid=\'cc02b600-5d0b-11e3-96c3-010001000005\'');
    });
    
    
});
