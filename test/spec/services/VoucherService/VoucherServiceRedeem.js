'use strict';

describe('Service: Voucherservice', function() {

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.voucher.service');
    });
    var vKeeper = {};
    // SPY
    beforeEach(function() {
        vKeeper.redeem = jasmine.createSpy('VoucherKeeper.redeem');
        vKeeper.list = jasmine.createSpy('VoucherKeeper.list');

        module(function($provide) {
            $provide.value('VoucherKeeper', vKeeper);
        });
    });

    // instantiate service
    var VoucherService = undefined;
    var ArrayUtils = undefined;
    beforeEach(inject(function(_VoucherService_, _ArrayUtils_) {
        VoucherService = _VoucherService_;
        ArrayUtils = _ArrayUtils_;
    }));

    it('should redeem', function() {

        var voucherType = 'voucher';
        var id = 0;

        var voucher = {
            redeemed : false,
            canceled : false
        };
        spyOn(ArrayUtils, 'find').andReturn(voucher);

        VoucherService.redeem(id);

        expect(vKeeper.redeem.mostRecentCall.args[0]).toEqual(voucherType);
        expect(vKeeper.redeem.mostRecentCall.args[1]).toEqual(id);

    });

    it('should fail to redeem, voucher not found', function() {

        var id = 0;

        spyOn(ArrayUtils, 'find').andReturn(undefined);

        expect(function() {
            VoucherService.redeem(id);
        }).toThrow;
    });

    it('should fail to redeem, already canceled', function() {

        var id = 0;

        var voucher = {
            redeemed : false,
            canceled : true
        };
        spyOn(ArrayUtils, 'find').andReturn(voucher);

        expect(function() {
            VoucherService.redeem(id);
        }).not.toThrow;
    });

    it('should fail to redeem, already redeemed', function() {

        var id = 0;

        var voucher = {
            redeemed : true,
            canceled : true
        };
        spyOn(ArrayUtils, 'find').andReturn(voucher);

        expect(function() {
            VoucherService.redeem(id);
        }).toThrow;
    });

});
