'use strict';

describe('Service: Voucherservice', function() {
    var vKeeper = {};
    var EntityService;
    
    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.voucher.service');
    });
    
    // SPY
    beforeEach(function() {
        vKeeper.cancel = jasmine.createSpy('VoucherKeeper.cancel');
        vKeeper.list = jasmine.createSpy('VoucherKeeper.list');

        module(function($provide) {
            $provide.value('VoucherKeeper', vKeeper);
            $provide.value('EntityService', EntityService);
        });
    });

    // instantiate service
    var VoucherService = undefined;
    var ArrayUtils = undefined;
    beforeEach(inject(function(_VoucherService_, _ArrayUtils_) {
        VoucherService = _VoucherService_;
        ArrayUtils = _ArrayUtils_;
    }));

    it('should cancel', function() {

        var voucherType = 'voucher';
        var id = 'cc02b600-5d0b-11e3-96c3-010001000001';

        var voucher = {
            redeemed : false,
            canceled : false
        };
        spyOn(ArrayUtils, 'find').andReturn(voucher);

        VoucherService.cancel(voucherType, id);

        expect(vKeeper.cancel.mostRecentCall.args[0]).toEqual(voucherType);
        expect(vKeeper.cancel.mostRecentCall.args[1]).toEqual(id);

    });

    it('should fail, voucher not found', function() {

        var id = 0;

        spyOn(ArrayUtils, 'find').andReturn(undefined);

        expect(function() {
            VoucherService.cancel(id);
        }).toThrow;
    });

    it('should fail, already redeemed', function() {

        var id = 0;
        var voucher = {
            redeemed : true,
            canceled : false
        };
        spyOn(ArrayUtils, 'find').andReturn(voucher);

        expect(function() {
            VoucherService.cancel(id);
        }).toThrow;
    });

});
