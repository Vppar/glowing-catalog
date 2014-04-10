describe('Service: PurchaseOrderServiceSaveCurrentSpec\n', function() {

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
        describe('and a successful PurchaseOrderService.update\n and the purchaseOrder is dirty\n', function() {
            beforeEach(function() {
                PurchaseOrderService.update = jasmine.createSpy('PurchaseOrderService.update').andCallFake(PromiseHelper.resolved(uuid));
                PurchaseOrderService.create = jasmine.createSpy('PurchaseOrderService.create').andCallFake(PromiseHelper.resolved(uuid));
                PurchaseOrderService.clearCurrent = jasmine.createSpy('PurchaseOrderService.create');
            });
            describe('When saveCurrent is called\n Then', function() {
                beforeEach(function() {
                    runs(function() {
                        PurchaseOrderService.saveCurrent().then(function(_uuid_) {
                            promiseResult = _uuid_;
                        });
                    });
                    waitsFor(function() {
                        rootScope.$apply();
                        return !!promiseResult;
                    });
                });

                it('should call PurchaseOrderService.update', function() {
                    expect(PurchaseOrderService.update).toHaveBeenCalledWith(PurchaseOrderService.purchaseOrder);
                });

                it('should return uuid comming from PurchaseOrderService.update', function() {
                    expect(promiseResult).toEqual(uuid);
                });
            });
        });

        describe('and a rejected PurchaseOrderService.update\n and the purchaseOrder is dirty\n', function() {
            beforeEach(function() {
                PurchaseOrderService.update =
                        jasmine.createSpy('PurchaseOrderService.update').andCallFake(PromiseHelper.rejected(rejectedMessage));
                PurchaseOrderService.create = jasmine.createSpy('PurchaseOrderService.create').andCallFake(PromiseHelper.rejected(uuid));
            });
            describe('When saveCurrent is called\n Then', function() {
                beforeEach(function() {
                    runs(function() {
                        PurchaseOrderService.saveCurrent().then(null, function(err) {
                            promiseResult = err;
                        });
                    });
                    waitsFor(function() {
                        rootScope.$apply();
                        return !!promiseResult;
                    });
                });

                it('should call PurchaseOrderService.update', function() {
                    expect(PurchaseOrderService.update).toHaveBeenCalledWith(PurchaseOrderService.purchaseOrder);
                });
                it('shouldn\'t dirty the order', function() {
                    expect(PurchaseOrderService.purchaseOrder.isDirty).toBe(true);
                });
                it('should return the rejection message comming from PurchaseOrderService.update', function() {
                    expect(promiseResult).toEqual(rejectedMessage);
                });
            });
        });
    });

    describe('Given purchase order without uuid\n', function() {
        beforeEach(function() {
            PurchaseOrderService.createNewCurrent();
            PurchaseOrderService.purchaseOrder.isDirty = true;
        });
        describe('and a successful PurchaseOrderService.create\n and the purchaseOrder is dirty\n', function() {
            beforeEach(function() {
                PurchaseOrderService.create = jasmine.createSpy('PurchaseOrderService.create').andCallFake(PromiseHelper.resolved(uuid));
                PurchaseOrderService.update = jasmine.createSpy('PurchaseOrderService.update').andCallFake(PromiseHelper.resolved(uuid));
                PurchaseOrderService.clearCurrent = jasmine.createSpy('PurchaseOrderService.clearCurrent');

                PurchaseOrderService.purchaseOrder.isDirty = true;
            });
            describe('When saveCurrent is called\n Then', function() {
                var purchaseOrder = null;
                beforeEach(function() {
                    purchaseOrder = PurchaseOrderService.purchaseOrder;
                    runs(function() {
                        PurchaseOrderService.saveCurrent().then(function(_uuid_) {
                            promiseResult = _uuid_;
                        });
                    });
                    waitsFor(function() {
                        rootScope.$apply();
                        return !!promiseResult;
                    });
                });

                it('should call PurchaseOrderService.create', function() {
                    expect(PurchaseOrderService.create).toHaveBeenCalledWith(purchaseOrder);
                });
            });
        });

        describe('and a rejected PurchaseOrderService.create\n and the purchaseOrder is dirty\n', function() {
            beforeEach(function() {
                PurchaseOrderService.create =
                        jasmine.createSpy('PurchaseOrderService.create').andCallFake(PromiseHelper.rejected(rejectedMessage));
                PurchaseOrderService.purchaseOrder.isDirty = true;
            });
            describe('When saveCurrent is called\n Then', function() {
                beforeEach(function() {
                    runs(function() {
                        PurchaseOrderService.saveCurrent().then(null, function(err) {
                            promiseResult = err;
                        });
                    });
                    waitsFor(function() {
                        rootScope.$apply();
                        return !!promiseResult;
                    });
                });

                it('should call PurchaseOrderService.update', function() {
                    expect(PurchaseOrderService.create).toHaveBeenCalledWith(PurchaseOrderService.purchaseOrder);
                });
                it('shouldn\'t dirty the order', function() {
                    expect(PurchaseOrderService.purchaseOrder.isDirty).toBe(true);
                });
                it('should return the rejection message comming from PurchaseOrderService.create', function() {
                    expect(promiseResult).toEqual(rejectedMessage);
                });
            });
        });
    });

});