'use strict';

describe('Service: ProductReturnKeeper', function() {

    var jKeeper = {};

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.productReturn');
        module('tnt.catalog.productReturn.keeper');
        module('tnt.catalog.productReturn.entity');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');
    });

    beforeEach(function() {
        jKeeper.compose = jasmine.createSpy('JournalKeeper.compose');

        module(function($provide) {
            $provide.value('JournalKeeper', jKeeper);
        });
    });

    // instantiate service
    var ProductReturnKeeper = undefined;
    var ProductReturn = undefined;
    var JournalEntry = undefined;
    beforeEach(inject(function(_ProductReturnKeeper_, _ProductReturn_, _JournalEntry_) {
        ProductReturnKeeper = _ProductReturnKeeper_;
        ProductReturn = _ProductReturn_;
        JournalEntry = _JournalEntry_;
    }));

    /**
     * <pre>
     * @spec ProductReturnKeeper.add#1
     * Given a valid devolutionId
     * and a productId
     * and a positive quantity
     * and a valid cost
     * when and add is triggered
     * then a journal entry must be created
     * an the entry must be registered
     * </pre>
     */
    it('should add', function() {

        var fakeNow = 1386179100000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

        var devId = 1;
        var pId = 23;
        var qty = 20;
        var ct = 1;
        var ev = new ProductReturn(devId, pId, qty, ct);
        var stp = fakeNow / 1000;
        var entry = new JournalEntry(null, stp, 'productReturnAdd', 1, ev);

        expect(function() {
            ProductReturnKeeper.add(ev);
        }).not.toThrow();
        expect(jKeeper.compose.mostRecentCall.args[0]).toEqual(entry);
    });

    /**
     * <pre>
     * @spec ProductReturnKeeper.add#2
     * Given a negative quantity
     * when and add is triggered
     * then an error must be raised
     * </pre> 
     */
    it('should throw error', function() {

        var devId = 1;
        var pId = 23;
        var qty = -1;
        var ct = 0;

        expect(function() {
            ProductReturnKeeper.add(devId, pId, qty, ct);
        }).toThrow();
    });

});
