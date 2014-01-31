'use strict';

describe('Service: VoucherKeeperCancelSpec', function() {

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
     * @spec VoucherKeeper.cancel#1
     * Given a valid voucher event
     * And a valid voucher
     * when cancel is triggered
     * then a voucher must be canceled
     * </pre>
     */
    it('cancel a voucher', function() {

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
        v3.canceled = stp;

        var entry = new JournalEntry(null, stp, 'voucherCancel', 1, v3);

        //When
        var cancelCall = function() {
            VoucherKeeper.cancel('voucher', 0);
        };

        //Then
        expect(cancelCall).not.toThrow();
        expect(VoucherKeeper.list('voucher').length).toBe(2);
        expect(jKeeper.compose.mostRecentCall.args[0]).toEqual(entry);

    });
    /**
     * <pre>
     * @spec VoucherKeeper.cancel#1
     * Given a valid voucher event
     * And a valid voucher
     * when cancel is triggered
     * then a voucher must be canceled
     * </pre>
     */
    it('handle a cancel of a voucher', function() {
        //Given
        var fakeNow = 1386179100000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
        var stp = fakeNow;

        var v1 = new Voucher(0, 1, 'voucher', 1);
        var v2 = new Voucher(1, 1, 'voucher', 1);
        VoucherKeeper.handlers.voucherCreateV1(v1);
        VoucherKeeper.handlers.voucherCreateV1(v2);

        v1.canceled = stp;

        //When
        var cancelCall = function() {
            VoucherKeeper.handlers.voucherCancelV1(v1);
        };

        //Then
        expect(cancelCall).not.toThrow();
        expect(VoucherKeeper.list('voucher').length).toBe(2);
        var voucher = ArrayUtils.find(VoucherKeeper.list('voucher'), 'id', v1.id);
        expect(voucher.canceled).toBe(stp);
    });

    /**
     * <pre>
     * @spec VoucherKeeper.cancel#1
     * Given a invalid id
     * when cancel is triggered
     * then a exception must be throw
     * </pre>
     */
    it('throw exception on cancel', function() {
        //given / when 
        var id = 5;
        var cancelCall = function() {
            VoucherKeeper.cancel('voucher', id);
        };

        //then
        expect(cancelCall).toThrow('Unable to find a voucher with id=\'' + id + '\'');

    });

    /**
     * <pre>
     * @spec VoucherKeeper.cancel#1
     * Given a invalid id
     * when cancel is triggered
     * then a exception must be throw
     * </pre>
     */
    it('throw exception on cancel handler', function() {
        //given / when 
        var voucher = new Voucher(0, 1, 'voucher', 1);

        var cancelCall = function() {
            VoucherKeeper.handlers.voucherCancelV1(voucher);
        };

        //then
        expect(cancelCall).toThrow('Entity not found, cosistency must be broken! Replay?');

    });
});