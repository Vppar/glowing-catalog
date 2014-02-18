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
    var IdentityService = undefined;

    beforeEach(inject(function(_VoucherKeeper_, _Voucher_, _JournalEntry_, _IdentityService_) {
        VoucherKeeper = _VoucherKeeper_;
        Voucher = _Voucher_;
        JournalEntry = _JournalEntry_;
        IdentityService = _IdentityService_;
    }));

    it('should do something', function() {
        expect(!!VoucherKeeper).toBe(true);
    });

    it('should create', function() {

        spyOn(IdentityService, 'getUUID').andReturn('cc02b600-5d0b-11e3-96c3-010001000001');

        var fakeNow = 1386179100000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);

        var entity = 1;
        var type = 'voucher';
        var amount = 1;
        var stp = fakeNow;
        var voucherObject = new Voucher(0, entity, type, amount);

        expect(function() {
            VoucherKeeper.create(voucherObject);
        }).not.toThrow();

        var id = jKeeper.compose.mostRecentCall.args[0].event.id;
        var ev = new Voucher(id, entity, type, amount);
        ev.redeemed = undefined;
        ev.canceled = undefined;
        ev.created = stp;
        var entry = new JournalEntry(null, stp, 'voucherCreate', 1, ev);
        expect(jKeeper.compose.mostRecentCall.args[0]).toEqual(entry);
    });

    it('should not create a voucher with a impostor voucher', function() {

        var voucherFake = {
            id : 1,
            entity : 1,
            type : 'voucher',
            amount : 10
        };

        expect(function() {
            VoucherKeeper.create(voucherFake);
        }).toThrow();
    });

});
