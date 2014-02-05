'use strict';

describe('Service: VoucherKeeperListSpec', function() {

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

    beforeEach(inject(function(_VoucherKeeper_, _Voucher_) {
        VoucherKeeper = _VoucherKeeper_;
        Voucher = _Voucher_;
    }));

    /**
     * <pre>
     * @spec VoucherKeeper.list#1
     * Given -
     * when and list is triggered
     * then a list must be empty
     * </pre>
     */
    it('return list with 0 items', function() {
        //given

        //when 

        //then
        expect(VoucherKeeper.list('voucher').length).toBe(0);

    });

    /**
     * <pre>
     * @spec VoucherKeeper.list#1
     * Given a populated list
     * when list is triggered
     * then a list must be returned
     * </pre>
     */
    it('return list with 2 items', function() {
        //given
        VoucherKeeper.handlers[myAddFunction](new Voucher('cc02b600-5d0b-11e3-96c3-010001000001', 'Pedro de Lara', 'voucher', 30));
        VoucherKeeper.handlers[myAddFunction](new Voucher('cc02b600-5d0b-11e3-96c3-010001000002', 'Toninho do Diabo', 'voucher', 40));
        //when
        var myNewList = VoucherKeeper.list('voucher');

        //then
        expect(myNewList.length).toBe(2);
    });

});
