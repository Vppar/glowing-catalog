describe('Service: CouponServiceCreateSpec', function() {

	beforeEach(function() {
		module('tnt.catalog.service.coupon');
	});

	var CouponService = undefined;
	var VoucherKeeper = {};
	var $q = {};

    beforeEach(function() {
        module(function($provide) {
            $provide.value('VoucherKeeper', VoucherKeeper);
        });
        
    	var uuid = 'cc02b600-5d0b-11e3-96c3-010001000002';
    	VoucherKeeper.create = jasmine.createSpy('VoucherKeeper.create').andCallFake(function() {
            var deffered = $q.defer();
            setTimeout(function() {
                deffered.resolve(uuid);
            }, 0);
            return deffered.promise;
        });
    });
    
    beforeEach(inject(function(_$q_, _$rootScope_, _CouponService_) {
    	$q = _$q_;
    	$rootScope = _$rootScope_;
    	CouponService = _CouponService_;
    }));
    
    it('should create a coupon', function() {
    	var entity = 123;
        var amount = 123.45;
        var remarks = "remarks test";
        
        var result = null;
        runs(function() {
        	CouponService.create(entity, amount, remarks).then(function(_result_) {
                result = _result_;
            });
        });

        waitsFor(function(){
            $rootScope.$apply();
            return result;
        });

        runs(function() {
        	expect(VoucherKeeper.create).toHaveBeenCalled();
	        expect(VoucherKeeper.create.mostRecentCall.args[0].entity).toEqual(entity);
	        expect(VoucherKeeper.create.mostRecentCall.args[0].amount).toEqual(amount);
	        expect(VoucherKeeper.create.mostRecentCall.args[0].remarks).toEqual(remarks);
        });        
    });

    it('should not create a coupon with negative value', function() {
        var entity = 123;
        var amount = -123.45;
        var remarks = "remarks test";

        expect(function() {
            CouponService.create(entity, amount, remarks);
        }).toThrow();
        expect(VoucherKeeper.create).not.toHaveBeenCalled();
    });

    it('should create a coupon without a remark', function() {
        var entity = 123;
        var amount = 123.45;

        var result = null;
        runs(function() {
        	CouponService.create(entity, amount, undefined).then(function(_result_) {
                result = _result_;
            });
        });

        waitsFor(function(){
            $rootScope.$apply();
            return result;
        });

        runs(function() {
        	expect(VoucherKeeper.create).toHaveBeenCalled();
        });        
    });

    it('should not create a coupon without entity', function() {
        var amount = 123.45;
        var remarks = "remarks test";
    	
        expect(function() {
            CouponService.create(undefined, amount, remarks);
        }).toThrow();
        expect(VoucherKeeper.create).not.toHaveBeenCalled();
    });

});