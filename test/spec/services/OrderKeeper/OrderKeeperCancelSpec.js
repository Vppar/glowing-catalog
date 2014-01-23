'use strict';

describe('Service: OrderKeeperAdd', function() {

    var JournalEntry = null;
    var fakeNow = null;
    var jKeeper = {};
    var OrderKeeper = null;
    var Order = null;

    var id = 1;
    var code = 12;
    var date = new Date().getTime();
    var customerId = 1;
    var paymentIds = [];
    var items = [];

    var order = {
        id : id,
        code : code,
        date : date,
        customerId : customerId,
        paymentIds : paymentIds,
        items : items
    };

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.order.keeper');
        module('tnt.catalog.order.entity');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');

        fakeNow = 1386179100000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

        jKeeper.compose = jasmine.createSpy('JournalKeeper.compose');

        module(function($provide) {
            $provide.value('JournalKeeper', jKeeper);
        });
    });

    // instantiate service
    beforeEach(inject(function(_Order_, _OrderKeeper_, _JournalEntry_) {
        Order = _Order_;
        OrderKeeper = _OrderKeeper_;
        JournalEntry = _JournalEntry_;
    }));

    it('should cancel an order', function() {

        var addEv = new Order(order);
        var recEv = {
            id : 1,
            canceled : fakeNow
        };

        var tstamp = fakeNow / 1000;
        var receiveEntry = new JournalEntry(null, tstamp, 'orderCancelV1', 1, recEv);

        OrderKeeper.handlers['orderAddV1'](addEv);

        // when
        var receiveCall = function() {
            OrderKeeper.cancel(addEv.id);
        };

        expect(receiveCall).not.toThrow();
        expect(jKeeper.compose).toHaveBeenCalledWith(receiveEntry);
    });
    
    it('shouldn\'t cancel an order', function() {

        var addEv = new Order(order);

        OrderKeeper.handlers['orderAddV1'](addEv);

        // when
        var receiveCall = function() {
            OrderKeeper.cancel(2);
        };
        expect(receiveCall).toThrow('Unable to find an order with id=\'2\'');
        expect(jKeeper.compose).not.toHaveBeenCalled();
    });

});
