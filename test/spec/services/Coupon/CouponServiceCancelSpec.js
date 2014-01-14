'use strict';

describe('Service: Coupon', function() {

    var voucherStub = {};

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.service.coupon');
    });

    // define the mocks
    beforeEach(function() {
        voucherStub.cancel = jasmine.createSpy('VoucherKeeper.cancel');
        module(function($provide) {
            $provide.value('VoucherKeeper', voucherStub);
        });
    });

    // instantiate service
    var CouponService = undefined;

    // inject the dependencies
    beforeEach(inject(function(_CouponService_) {
        CouponService = _CouponService_;
    }));

    it('should cancel the coupon with the passed id', function() {
        var id = 1;
        CouponService.cancel(id);
        expect(voucherStub.cancel).toHaveBeenCalledWith('coupon', id);
    });

    it('should not cancel any coupon with a negative id', function() {
        var id = -1;
        expect(function() {
            CouponService.cancel(id);
        }).toThrow();
        expect(voucherStub.cancel).not.toHaveBeenCalled();
    });

    it('should not cancel any coupon with an id equals zero', function() {
        var id = 0;
        expect(function() {
            CouponService.cancel(id);
        }).toThrow();
        expect(voucherStub.cancel).not.toHaveBeenCalled();
    });

    it('should not cancel any coupon with a undefined id', function() {
        var id = undefined;
        expect(function() {
            CouponService.cancel(id);
        }).toThrow();
        expect(voucherStub.cancel).not.toHaveBeenCalled();
    });
});