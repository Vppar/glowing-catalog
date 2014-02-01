// FIXME - This whole suit test needs review
xdescribe('Service: CouponServiceCreateSpec', function() {

    var voucherStub = {};

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.service.coupon');
    });

    // define the mocks
    beforeEach(function() {

        voucherStub.create = jasmine.createSpy('asdf');

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
    
    // FIXME - This test should be reviewed
    xit('should create a coupon', function() {
        var entity = 123;
        var amount = 123.45;

        var remarks = "lalala";
        var document = {
            type : "pedido",
            id : 123
        };

        CouponService.create(entity, amount, remarks, document);

        expect(voucherStub.create).toHaveBeenCalled();

        expect(voucherStub.create.mostRecentCall.args[0].entity).toEqual(entity);
        expect(voucherStub.create.mostRecentCall.args[0].amount).toEqual(amount);
        expect(voucherStub.create.mostRecentCall.args[0].remarks).toEqual(remarks);
        expect(voucherStub.create.mostRecentCall.args[0].document).toEqual(document);

    });

    it('should not create a coupon with negative value', function() {
        var entity = 123;
        var amount = -123.45;
        var remarks = "lalala";
        var document = {
            type : "pedido",
            id : 123
        };

        expect(function() {
            CouponService.create(entity, amount, remarks, document);
        }).toThrow();
        expect(voucherStub.create).not.toHaveBeenCalled();

    });

    it('should create a coupon without a remark', function() {
        var entity = 123;
        var amount = 123.45;
        var document = {
            type : "pedido",
            id : 123
        };

        CouponService.create(entity, amount, undefined, document);
        expect(voucherStub.create).toHaveBeenCalled();
    });

    it('should create a coupon without a document', function() {
        var entity = 123;
        var amount = 123.45;
        var remarks = "lalala";

        CouponService.create(entity, amount, remarks);
        expect(voucherStub.create).toHaveBeenCalled();
    });

    it('should not create a coupon without entity', function() {

        var amount = 123.45;
        var remarks = "lalala";
        var document = {
            type : "pedido",
            id : 123
        };

        expect(function() {
            CouponService.create(undefined, amount, remarks, document);
        }).toThrow();
        expect(voucherStub.create).not.toHaveBeenCalled();
        expect(CouponService.create).toThrow();
    });

});