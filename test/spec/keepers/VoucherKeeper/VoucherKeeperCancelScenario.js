'use strict';

describe('Service: VoucherKeeperCancelScenario', function() {

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.voucher');
        module('tnt.catalog.voucher.keeper');
        module('tnt.catalog.voucher.entity');
    });

    // instantiate service
    var VoucherKeeper = undefined;
    var Voucher = undefined;
    var ArrayUtils = undefined;

    //name of add handler
    var version = 'V1';
    var myCreateFunction = 'voucherCreate' + version;

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
     * @spec VoucherKeeper.cancel#1
     * Given a populated list with a entries
     * And a valid voucher
     * when cancel is triggered
     * then a voucher must be canceled
     * </pre>
     */
    it('cancel a voucher', function() {
        runs(function() {
            VoucherKeeper.handlers[myCreateFunction](new Voucher('cc02b600-5d0b-11e3-96c3-010001000001', 'Pedro de Lara', 'voucher', 30));
            VoucherKeeper.handlers[myCreateFunction](new Voucher('cc02b600-5d0b-11e3-96c3-010001000002', 'Toninho do Diabo', 'voucher', 40));
            VoucherKeeper.handlers[myCreateFunction](new Voucher('cc02b600-5d0b-11e3-96c3-010001000003', 'Jeremias O Sub-Zero brasileiro', 'voucher', 40));

            VoucherKeeper.cancel('voucher', 'cc02b600-5d0b-11e3-96c3-010001000001');
        });

        waitsFor(function() {
            return VoucherKeeper.list('voucher')[0].canceled;
        }, 'JournalKeeper is taking too long', 300);

        runs(function() {
            var voucher = ArrayUtils.find(VoucherKeeper.list('voucher'), 'id', 'cc02b600-5d0b-11e3-96c3-010001000001');

            expect(VoucherKeeper.list('voucher').length).toBe(3);
            expect(voucher.canceled).not.toBe(undefined);
            expect(voucher.entity).toBe('Pedro de Lara');

        });
    });

});
