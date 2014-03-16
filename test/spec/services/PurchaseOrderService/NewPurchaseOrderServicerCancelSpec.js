ddescribe('Service: PurchaseOrderServiceCancelSpec\n', function() {

    var TypeKeeper = null;
    var PurchaseOrderKeeper = null;
    var typeKeeperListReturn = null;
    
    var uuid = null;
    
    var promiseResult = null;
    var rejectedMessage = null ;


    // Mock data
    beforeEach(function() {
        typeKeeperListReturn = [];
        promiseResult = null;
        rejectedMessage = 'its me mario';
    });

    // Mock dependencies
    beforeEach(function() {
        TypeKeeper = {};
        TypeKeeper.list = jasmine.createSpy('TypeKeeper.list').andReturn(typeKeeperListReturn);
        PurchaseOrderKeeper = {};
        
        uuid = 'cc02a100-5d0a-11e3-96c3-010006000001';
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

    describe('Given an existing purchase order uuid\n', function() {
        beforeEach(function() {
            PurchaseOrderKeeper.cancel = jasmine.createSpy('PurchaseOrderKeeper.cancel').andCallFake(PromiseHelper.resolved(uuid));
        });

        describe('When cancel is called\n Then', function() {
            beforeEach(function() {
                runs(function() {
                    PurchaseOrderService.cancel(uuid).then(function(_uuid_) {
                        promiseResult = _uuid_;
                    });
                });
                waitsFor(function() {
                    rootScope.$apply();
                    return !!promiseResult;
                });
            });
            it('should call PurchaseOrderKeeper.cancel', function() {
                expect(PurchaseOrderKeeper.cancel).toHaveBeenCalled();
            });
            it('should return the list comming from keeper', function() {
                expect(promiseResult).toEqual(uuid);
            });
        });
    });

    describe('Given an inexisting purchase order uuid\n', function() {
        beforeEach(function() {
            PurchaseOrderKeeper.cancel = jasmine.createSpy('PurchaseOrderKeeper.cancel').andCallFake(PromiseHelper.rejected(rejectedMessage));
        });

        describe('When cancel is called\n Then', function() {
            beforeEach(function() {
                runs(function() {
                    PurchaseOrderService.cancel(uuid).then(null, function(err) {
                        promiseResult = err;
                    });
                });
                waitsFor(function() {
                    rootScope.$apply();
                    return !!promiseResult;
                });
            });
            it('should call PurchaseOrderKeeper.cancel', function() {
                expect(PurchaseOrderKeeper.cancel).toHaveBeenCalled();
            });
            it('should return the list comming from keeper', function() {
                expect(promiseResult).toEqual(rejectedMessage);
            });
        });
    });
});