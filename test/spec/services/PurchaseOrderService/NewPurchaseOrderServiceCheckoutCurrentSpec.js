describe('Service: PurchaseOrderServiceCheckoutCurrentSpec\n', function() {

    var TypeKeeper = null;
    var PurchaseOrderKeeper = null;
    var typeKeeperListReturn = null;

    var uuid = null;

    var promiseResult = null;
    var rejectedMessage = null;

    // Mock data
    beforeEach(function() {
        typeKeeperListReturn = [];
        promiseResult = null;
        rejectedMessage = 'its me mario';
    });

    // Mock dependencies
    beforeEach(function() {
        statusTypePending = {
            name : 'pending',
            id : 1
        };
        expectedPurchaseOrder = {
            uuid : null,
            amount : 0,
            discount : 0,
            status : statusTypePending.id,
            freight : 0,
            points : 0,
            items : [],
            isDirty : false
        };
        typeKeeperListReturn = [
            statusTypePending
        ];
        rejectedMessage = 'its me mario';
        uuid = 'cc02a100-5d0a-11e3-96c3-010006000001';
        TypeKeeper = {};
        TypeKeeper.list = jasmine.createSpy('TypeKeeper.list').andReturn(typeKeeperListReturn);
        PurchaseOrderKeeper = {};
    });

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.purchase.service');
        module('tnt.catalog.purchaseOrder');

        module(function($provide) {
            $provide.value('TypeKeeper', TypeKeeper);
            $provide.value('PurchaseOrderKeeper', PurchaseOrderKeeper);
        });
    });

    beforeEach(inject(function(_NewPurchaseOrderService_, _PurchaseOrder_, $q, $rootScope) {
        PromiseHelper.config($q);
        rootScope = $rootScope;
        PurchaseOrderService = _NewPurchaseOrderService_;
        PurchaseOrder = _PurchaseOrder_;
    }));

    describe('Given purchase order with uuid\n', function() {
        beforeEach(function() {
            PurchaseOrderService.createNewCurrent();
            PurchaseOrderService.purchaseOrder.uuid = uuid;
            PurchaseOrderService.purchaseOrder.isDirty = true;
        });
        describe('and a successful PurchaseOrderService.saveCurrent\n', function() {
            beforeEach(function() {
                PurchaseOrderService.saveCurrent =
                        jasmine.createSpy('PurchaseOrderService.saveCurrent').andCallFake(PromiseHelper.resolved(uuid));
                PurchaseOrderService.changeStatus =
                    jasmine.createSpy('PurchaseOrderService.changeStatus').andCallFake(PromiseHelper.resolved(uuid));
                PurchaseOrderService.clearCurrent = jasmine.createSpy('PurchaseOrderService.clearCurrent');
            });
            describe('When checkoutCurrent is called\n Then', function() {
                beforeEach(function() {
                    runs(function() {
                        PurchaseOrderService.checkoutCurrent().then(function(_uuid_) {
                            promiseResult = _uuid_;
                        });
                    });
                    waitsFor(function() {
                        rootScope.$apply();
                        return !!promiseResult;
                    });
                });

                it('should call PurchaseOrderService.saveCurrent', function() {
                    expect(PurchaseOrderService.saveCurrent).toHaveBeenCalled();
                });
            });
        });

        describe('and a rejected PurchaseOrderService.saveCurrent\n', function() {
            beforeEach(function() {
                PurchaseOrderService.saveCurrent =
                        jasmine.createSpy('PurchaseOrderService.saveCurrent').andCallFake(PromiseHelper.rejected(rejectedMessage));
                PurchaseOrderService.clearCurrent = jasmine.createSpy('PurchaseOrderService.clearCurrent');
            });
            describe('When checkoutCurrent is called\n Then', function() {
                beforeEach(function() {
                    runs(function() {
                        PurchaseOrderService.checkoutCurrent().then(null, function(err) {
                            promiseResult = err;
                        });
                    });
                    waitsFor(function() {
                        rootScope.$apply();
                        return !!promiseResult;
                    });
                });

                it('should call PurchaseOrderService.saveCurrent', function() {
                    expect(PurchaseOrderService.saveCurrent).toHaveBeenCalled();
                });
                it('shouldn\'t clear current order', function() {
                    expect(PurchaseOrderService.clearCurrent).not.toHaveBeenCalled();
                });
                it('should return the rejection message comming from PurchaseOrderService.cancel', function() {
                    expect(promiseResult).toEqual(rejectedMessage);
                });
            });
        });
    });
});