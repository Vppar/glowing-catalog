'use strict';

describe('Service: PurchaseOrderKeeperAddSpec', function() {

    var fakeNow = null;
    var JournalEntry = null;
    var PurchaseOrderKeeper = null;
    var PurchaseOrder = null;
    var IdentityService = null;
    var jKeeper = {};

    var uuid = 'cc02b600-5d0b-11e3-96c3-010001000001';
    var items = [];

    var purchase = {
        uuid : uuid,
        created : new Date(1386179100000).getTime(),
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
    beforeEach(inject(function(_PurchaseOrder_, _PurchaseOrderKeeper_, _JournalEntry_, _IdentityService_) {
        PurchaseOrder = _PurchaseOrder_;
        PurchaseOrderKeeper = _PurchaseOrderKeeper_;
        JournalEntry = _JournalEntry_;
        IdentityService = _IdentityService_;
    }));

    it('should add a purchase-order', function() {
        // given
        var purchasex = new PurchaseOrder(purchase);

        var entry = new JournalEntry(null, purchasex.created, 'purchaseOrderAdd', 1, purchasex);

        spyOn(IdentityService, 'getUUID').andReturn(purchasex.uuid);

        // when
        var addCall = function() {
            PurchaseOrderKeeper.add(purchasex);
        };

        // then
        expect(addCall).not.toThrow();
        expect(jKeeper.compose).toHaveBeenCalledWith(entry);
    });

    it('shouldn\'t add a purchase-order', function() {
        // given
        var purchaseTest = new PurchaseOrder(purchase);
        purchaseTest.onemore = 'onemore';

        // when
        var addCall = function() {
            PurchaseOrderKeeper.add(purchaseTest);
        };

        // then
        expect(addCall).toThrow('Unexpected property onemore');
        expect(jKeeper.compose).not.toHaveBeenCalled();
    });

    it('should handle an add purchase-order event', function() {
        // given
        var purchasex = new PurchaseOrder(purchase);

        // when
        PurchaseOrderKeeper.handlers['purchaseOrderAddV1'](purchasex);
        var purchases = PurchaseOrderKeeper.list();

        // then
        expect(purchases[0]).not.toBe(purchasex);
        expect(purchases[0]).toEqual(purchasex);

    });
});