ddescribe('Service: PurchaseOrderServiceCancelCurrentSpec\n', function() {

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
        describe('and a successful PurchaseOrderService.cancel\n', function() {
            beforeEach(function() {
                PurchaseOrderService.cancel = jasmine.createSpy('PurchaseOrderService.cancel').andCallFake(PromiseHelper.resolved(uuid));
                PurchaseOrderService.clearCurrent = jasmine.createSpy('PurchaseOrderService.clearCurrent');
            });
            describe('When cancelCurrent is called\n Then', function() {
                beforeEach(function() {
                    runs(function() {
                        PurchaseOrderService.cancelCurrent().then(function(_uuid_) {
                            promiseResult = _uuid_;
                        });
                    });
                    waitsFor(function() {
                        rootScope.$apply();
                        return !!promiseResult;
                    });
                });

                it('should call PurchaseOrderService.cancel', function() {
                    expect(PurchaseOrderService.cancel).toHaveBeenCalledWith(PurchaseOrderService.purchaseOrder.uuid);
                });
                it('should clear current order', function() {
                    expect(PurchaseOrderService.clearCurrent).toHaveBeenCalled();
                });
            });
        });

        describe('and a rejected PurchaseOrderService.cancel\n', function() {
            beforeEach(function() {
                PurchaseOrderService.cancel =
                        jasmine.createSpy('PurchaseOrderService.cancel').andCallFake(PromiseHelper.rejected(rejectedMessage));
            });
            describe('When cancelCurrent is called\n Then', function() {
                beforeEach(function() {
                    runs(function() {
                        PurchaseOrderService.cancelCurrent().then(null, function(err) {
                            promiseResult = err;
                        });
                    });
                    waitsFor(function() {
                        rootScope.$apply();
                        return !!promiseResult;
                    });
                });

                it('should call PurchaseOrderService.cancel', function() {
                    expect(PurchaseOrderService.cancel).toHaveBeenCalledWith(PurchaseOrderService.purchaseOrder.uuid);
                });
                it('should return the rejection message comming from PurchaseOrderService.cancel', function() {
                    expect(promiseResult).toEqual(rejectedMessage);
                });
            });
        });
    });

    describe('Given purchase order without uuid\n', function() {
        beforeEach(function() {
            PurchaseOrderService.createNewCurrent();
            PurchaseOrderService.purchaseOrder.isDirty = true;
            PurchaseOrderService.cancel = jasmine.createSpy('PurchaseOrderService.cancel');
            PurchaseOrderService.clearCurrent = jasmine.createSpy('PurchaseOrderService.clearCurrent');
        });
        describe('When cancelCurrent is called\n Then', function() {
            beforeEach(function() {
                runs(function() {
                    PurchaseOrderService.cancelCurrent().then(function(_uuid_) {
                        promiseResult = _uuid_;
                    });
                });
                waitsFor(function() {
                    rootScope.$apply();
                    return !!promiseResult;
                });
            });

            it('shouldn\'t call PurchaseOrderService.cancel', function() {
                expect(PurchaseOrderService.cancel).not.toHaveBeenCalled();
            });
            it('should clear current order', function() {
                expect(PurchaseOrderService.clearCurrent).toHaveBeenCalled();
            });
        });
    });
});