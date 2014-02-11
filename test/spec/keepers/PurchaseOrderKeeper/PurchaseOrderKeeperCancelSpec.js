'use strict';

describe('Service: PurchaseOrderKeeperCancelSpec', function() {

    var JournalEntry = null;
    var fakeNow = null;
    var jKeeper = {};
    var PurchaseOrderKeeper = null;
    var PurchaseOrder = null;

    var uuid = 'cc02b600-5d0b-11e3-96c3-010001000001';
    var code = 12;
    var date = new Date().getTime();
    var customerId = 1;
    var items = [];

    var purchase = {
        uuid : uuid,
        code : code,
        date : date,
        customerId : customerId,
        items : items
    };

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.purchaseOrder.keeper');
        module('tnt.catalog.purchaseOrder.entity');
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
    beforeEach(inject(function(_PurchaseOrder_, _PurchaseOrderKeeper_, _JournalEntry_) {
        PurchaseOrder = _PurchaseOrder_;
        PurchaseOrderKeeper = _PurchaseOrderKeeper_;
        JournalEntry = _JournalEntry_;
    }));

    
    it('should cancel a PurchaseOrder', function() {

        var addEv = new PurchaseOrder(purchase);
        var recEv = {
            uuid : 'cc02b600-5d0b-11e3-96c3-010001000001',
            canceled : fakeNow
        };

        var receiveEntry = new JournalEntry(null, recEv.canceled, 'purchaseOrderCancel', 1, recEv);

        PurchaseOrderKeeper.handlers['purchaseOrderAddV1'](addEv);

        // when
        var receiveCall = function() {
            PurchaseOrderKeeper.cancel(addEv.uuid);
        };

        expect(receiveCall).not.toThrow();
        expect(jKeeper.compose).toHaveBeenCalledWith(receiveEntry);
    });
    
    it('shouldn\'t cancel a PurchaseOrder', function() {

        var addEv = new PurchaseOrder(purchase);

        PurchaseOrderKeeper.handlers['purchaseOrderAddV1'](addEv);

        // when
        var receiveCall = function() {
            PurchaseOrderKeeper.cancel('cc02b600-5d0b-11e3-96c3-010001000002');
        };
        expect(receiveCall).toThrow('Unable to find an PurchaseOrder with uuid=\'cc02b600-5d0b-11e3-96c3-010001000002\'');
        expect(jKeeper.compose).not.toHaveBeenCalled();
    });

});
