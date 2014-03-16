describe('Service: PurchaseOrderServiceUpdateSpec\n', function() {

    var rootScope = null;
    var TypeKeeper = null;
    var PurchaseOrder = null;
    var PurchaseOrderKeeper = null;
    var typeKeeperListReturn = null;

    var purchaseOrder = null;

    var validReturn = null;
    var invalidReturn = null;
    var promiseResult = null;

    var uuid = null;

    // Mock data
    beforeEach(function() {
        purchaseOrder = {
            created : 123456678,
            amount : 100.0,
            discount : 25.0,
            points : 200,
            items : [
                {
                    property : 'im a product'
                }
            ]
        };
        promiseResult = null;
        typeKeeperListReturn = [];
        uuid = 'cc02a100-5d0a-11e3-96c3-010006000001';
        validReturn = [];
        invalidReturn = [
            {
                'property' : 'its me luigi'
            }
        ];
    });

    // Mock dependencies
    beforeEach(function() {
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

    describe('Given a valid purchase order\n', function() {
        beforeEach(function() {
            PurchaseOrderService.isValid = jasmine.createSpy('PurchaseOrderService.isValid').andReturn(validReturn);
        });
        describe('and the keeper returning a resolved promise\n', function() {
            beforeEach(function() {
                PurchaseOrderKeeper.update = jasmine.createSpy('PurchaseOrderKeeper.update').andCallFake(PromiseHelper.resolved(uuid));
            });

            describe('When update is called\n Then', function() {
                beforeEach(function() {
                    runs(function() {
                        PurchaseOrderService.update(purchaseOrder).then(function(uuid) {
                            promiseResult = uuid;
                        });
                    });
                    waitsFor(function() {
                        rootScope.$apply();
                        return !!promiseResult;
                    });
                });
                it('should call PurchaseOrderKeeper.update', function() {
                    expect(PurchaseOrderKeeper.update).toHaveBeenCalledWith(new PurchaseOrder(purchaseOrder));
                });
                it('should return an uuid', function() {
                    expect(promiseResult).toEqual(uuid);
                });
            });
        });
        describe('and the keeper returning a rejected promise\n', function() {
            beforeEach(function() {
                PurchaseOrderKeeper.update = jasmine.createSpy('PurchaseOrderKeeper.update').andCallFake(PromiseHelper.rejected('rejected'));
            });
            
            describe('When update is called\n Then', function() {
                beforeEach(function() {
                    runs(function() {
                        PurchaseOrderService.update(purchaseOrder).then(null, function(err) {
                            promiseResult = err;
                        });
                    });
                    waitsFor(function() {
                        rootScope.$apply();
                        return !!promiseResult;
                    });
                });
                it('shouldn\'t call PurchaseOrderKeeper.update', function() {
                    expect(PurchaseOrderKeeper.update).not.toHaveBeenCalledWith();
                });
                it('should return the rejection message', function() {
                    expect(promiseResult).toEqual('rejected');
                });
            });
        });
    });

    describe('Given a invalid purchase order\n', function() {
        beforeEach(function() {
            purchaseOrder = new PurchaseOrder(null, 123456678, 100.0, 25.0, 200, [
                {
                    property : 'im a product'
                }
            ]);
            PurchaseOrderService.isValid = jasmine.createSpy('PurchaseOrderService.isValid').andReturn(invalidReturn);
            PurchaseOrderKeeper.update = jasmine.createSpy('PurchaseOrderKeeper.update');
        });
        describe('When update is called\n Then', function() {

            beforeEach(function() {
                runs(function() {
                    PurchaseOrderService.update(purchaseOrder).then(null, function(err) {
                        promiseResult = err;
                    });
                });
                waitsFor(function() {
                    rootScope.$apply();
                    return !!promiseResult;
                });
            });
            it('shouldn\'t call PurchaseOrderKeeper.update', function() {
                expect(PurchaseOrderKeeper.update).not.toHaveBeenCalledWith();
            });
            it('should return the errors as parameters', function() {
                expect(promiseResult).toEqual(invalidReturn);
            });
        });
    });
    
    describe('Given a purchase order with unmapped parameters\n', function() {
        beforeEach(function() {
            purchaseOrder = new PurchaseOrder(null, 123456678, 100.0, 25.0, 200, [
                {
                    property : 'im a product'
                }
            ]);
            purchaseOrder.extraparamenter = 'its me mario';
            PurchaseOrderService.isValid = jasmine.createSpy('PurchaseOrderService.isValid').andReturn(validReturn);
            PurchaseOrderKeeper.update = jasmine.createSpy('PurchaseOrderKeeper.update');
        });
        describe('When update is called\n Then', function() {

            beforeEach(function() {
                runs(function() {
                    PurchaseOrderService.update(purchaseOrder).then(null, function(err) {
                        promiseResult = err;
                    });
                });
                waitsFor(function() {
                    rootScope.$apply();
                    return !!promiseResult;
                });
            });
            it('shouldn\'t call PurchaseOrderKeeper.update', function() {
                expect(PurchaseOrderKeeper.update).not.toHaveBeenCalledWith();
            });
            it('should return the errors as parameters', function() {
                expect(promiseResult).toEqual('Unexpected property extraparamenter');
            });
        });
    });
});