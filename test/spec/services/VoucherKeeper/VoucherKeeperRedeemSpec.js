'use strict';

describe('Service: VoucherKeeperRedeemSpec', function() {

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
    var ArrayUtils = undefined;

    beforeEach(inject(function(_VoucherKeeper_, _Voucher_, _JournalEntry_, _ArrayUtils_) {
        VoucherKeeper = _VoucherKeeper_;
        Voucher = _Voucher_;
        JournalEntry = _JournalEntry_;
        ArrayUtils = _ArrayUtils_;
    }));

    it('should do something', function() {
        expect(!!VoucherKeeper).toBe(true);
    });

    /**
     * <pre>
     * @spec VoucherKeeper.redeem#1
     * Given a valid voucher event
     * And a valid voucher
     * when cancel is triggered
     * then a voucher must be redeem
     * </pre>
     */
    it('redeem - public call', function() {

        var fakeNow = 1386179100000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
        var stp = fakeNow;

        //Given
        var v1 = new Voucher(0, null, 'voucher', null);
        var v2 = new Voucher(1, null, 'voucher', null);
        VoucherKeeper.handlers.voucherCreateV1(v1);
        VoucherKeeper.handlers.voucherCreateV1(v2);

        //create voucher and cancel it
        var v3 = new Voucher(v1);
        v3.redeemed = stp;

        var entry = new JournalEntry(null, stp, 'voucherRedeem', 1, v3);

        //When
        var createCall = function() {
            VoucherKeeper.redeem('voucher', 0);
        };

        //Then
        expect(createCall).not.toThrow();
        expect(VoucherKeeper.list('voucher').length).toBe(2);
        expect(jKeeper.compose.mostRecentCall.args[0]).toEqual(entry);

    });
    /**
     * <pre>
     * @spec VoucherKeeper.redeem#1
     * Given a valid voucher event
     * And a valid voucher
     * when cancel is triggered
     * then a voucher must be redeem
     * </pre>
     */
    it('handle a redeem - private call', function() {
        //Given
        var fakeNow = 1386179100000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
        var stp = fakeNow / 1000;

        var v1 = new Voucher(0, 1, 'voucher', 1);
        var v2 = new Voucher(1, 1, 'voucher', 1);
        VoucherKeeper.handlers.voucherCreateV1(v1);
        VoucherKeeper.handlers.voucherCreateV1(v2);

        v1.redeemed = stp;

        //When
        var createCall = function() {
            VoucherKeeper.handlers.voucherRedeemV1(v1);
        };

        //Then
        expect(createCall).not.toThrow();
        expect(VoucherKeeper.list('voucher').length).toBe(2);
        var voucher = ArrayUtils.find(VoucherKeeper.list('voucher'), 'id', 0);
        expect(voucher.redeemed).toBe(stp);
    });

    /**
     * <pre>
     * @spec VoucherKeeper.redeem#1
     * Given a invalid id
     * when redeem is triggered
     * then a exception must be throw
     * </pre>
     */
    it('throw exception - public call', function() {
        //given / when 
        var id = 5;
        var createCall = function() {
            VoucherKeeper.redeem('voucher', id);
        };

        //then
        expect(createCall).toThrow('Unable to find a voucher with id=\'' + id + '\'');

    });

    /**
     * <pre>
     * @spec VoucherKeeper.redeem#1
     * Given a invalid id
     * when redeem is triggered
     * then a exception must be throw
     * </pre>
     */
    it('throw exception - private call', function() {
        //given / when 
        var voucher = new Voucher(0, 1, 'voucher', 1);

        var createCall = function() {
            VoucherKeeper.handlers.voucherRedeemV1(voucher);
        };

        //then
        expect(createCall).toThrow('Entity not found, cosistency must be broken! Replay?');

    });
});