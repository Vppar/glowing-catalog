'use strict';

describe('Service: VoucherKeeperRedeemScenario', function() {

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.voucher');
        module('tnt.catalog.voucher.keeper');
        module('tnt.catalog.voucher.entity');
    });

    // instantiate service
    var VoucherKeeper = undefined;
    var Voucher = undefined;

    var version = 'V1';
    var myAddFunction = 'voucherCreate' + version;
    var ArrayUtils = undefined;

    beforeEach(inject(function(_VoucherKeeper_, _Voucher_, _ArrayUtils_, WebSQLDriver) {
      
        WebSQLDriver.transaction(function(tx){
            WebSQLDriver.dropBucket(tx, 'JournalEntry');
        });
      
        VoucherKeeper = _VoucherKeeper_;
        Voucher = _Voucher_;
        ArrayUtils = _ArrayUtils_;
    }));

    /**
     * <pre>
     * @spec VoucherKeeper.Redeem#1
     * Given a populated list of voucher
     * And a  type and id valid
     * when redeem is triggered
     * then a voucher must be redeemed
     * </pre>
     */
    it('redeem a voucher', function() {
        runs(function() {
            VoucherKeeper.handlers[myAddFunction](new Voucher('cc02b600-5d0b-11e3-96c3-010001000001', 'Pedro de Lara', 'voucher', 30));
            VoucherKeeper.handlers[myAddFunction](new Voucher('cc02b600-5d0b-11e3-96c3-010001000002', 'Toninho do Diabo', 'voucher', 40));
            VoucherKeeper.handlers[myAddFunction](new Voucher('cc02b600-5d0b-11e3-96c3-010001000003', 'Jeremias O Sub-Zero brasileiro', 'voucher', 40));

            VoucherKeeper.redeem('voucher', 'cc02b600-5d0b-11e3-96c3-010001000002');
        });

        waitsFor(function() {
            return VoucherKeeper.list('voucher')[1].redeemed;
        }, 'JournalKeeper is taking too long', 500);

        runs(function() {
            var voucher = ArrayUtils.find(VoucherKeeper.list('voucher'), 'id', 'cc02b600-5d0b-11e3-96c3-010001000002');

            expect(VoucherKeeper.list('voucher').length).toBe(3);
            expect(voucher.redeemed).not.toBe(undefined);
            expect(voucher.entity).toBe('Toninho do Diabo');
        });
    });

});
