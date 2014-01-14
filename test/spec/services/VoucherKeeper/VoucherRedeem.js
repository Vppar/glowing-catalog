'use strict';

describe('Service: VoucherKeeper', function() {

    var jKeeper = {};

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.voucher');
        module('tnt.catalog.voucher.keeper');
        module('tnt.catalog.voucher.entity');
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
    var VoucherKeeper = undefined;
    var Voucher = undefined;
    var JournalEntry = undefined;
    beforeEach(inject(function(_VoucherKeeper_, _Voucher_, _JournalEntry_) {
        VoucherKeeper = _VoucherKeeper_;
        Voucher = _Voucher_;
        JournalEntry = _JournalEntry_;
    }));

    it('should do something', function() {
        expect(!!VoucherKeeper).toBe(true);
    });

    it('should redeem', function() {

        var fakeNow = 1386179100000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

        var entity = 1;
        var type = 'voucher';
        var amount = 1;
        var stp = fakeNow / 1000;
        var voucherObject = new Voucher(0, entity, type, amount);
        var ev = new Voucher(0, entity, type, amount);
        ev.redeemed = false;
        ev.canceled = false;
        var entry = new JournalEntry(null, stp, 'voucherCreate', 1, ev);
        VoucherKeeper.create(voucherObject);

        expect(function() {
            VoucherKeeper.redeem((VoucherKeeper.list.length - 1), type);
        }).not.toThrow();
        expect(jKeeper.compose).toHaveBeenCalledWith(entry);
    });
});