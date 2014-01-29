'use strict';

describe('Service: VoucherKeeper.create', function() {

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.voucher');
        module('tnt.catalog.voucher.keeper');
        module('tnt.catalog.voucher.entity');
    });

    // instantiate service
    var VoucherKeeper = undefined;
    var Voucher = undefined;

    beforeEach(inject(function(_VoucherKeeper_, _Voucher_) {
        VoucherKeeper = _VoucherKeeper_;
        Voucher = _Voucher_;
    }));

    /**
     * <pre>
     * @spec VoucherKeeper.create#1
     * Given a valid voucher
     * when create is triggered
     * then a voucher must be created
     * </pre>
     */
    it('create a voucher', function() {
        runs(function() {
            var id = 1;
            var entity = 'Joselito';
            var type = 'voucher';
            var amount = 30;
            var ev = new Voucher(id, entity, type, amount);

            VoucherKeeper.create(ev);
        });

        waitsFor(function() {
            return VoucherKeeper.list('voucher').length;
        }, 'JournalKeeper is taking too long', 300);

        runs(function() {
            expect(VoucherKeeper.list('voucher').length).toBe(1);
            expect(VoucherKeeper.list('voucher')[0].entity).toBe('Joselito');
        });
    });

});
