describe('Service: PurchaseOrderServiceReadSpec\n', function() {

    var TypeKeeper = null;
    var PurchaseOrderKeeper = null;
    var typeKeeperListReturn = null;

    var purchaseOrders = null;
    var returnedPurchaseOrder = null;


    // Mock data
    beforeEach(function() {
        typeKeeperListReturn = [];
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

    beforeEach(inject(function(_NewPurchaseOrderService_, _PurchaseOrder_) {
        PurchaseOrderService = _NewPurchaseOrderService_;
        PurchaseOrder = _PurchaseOrder_;
    }));

    describe('Given a list of purchase orders\n', function() {
        beforeEach(function() {
            PurchaseOrderKeeper.read = jasmine.createSpy('PurchaseOrderKeeper.read').andReturn(purchaseOrders);
        });

        describe('When list is called\n Then', function() {
            beforeEach(function() {
                returnedPurchaseOrder = PurchaseOrderService.read();
            });
            it('should call PurchaseOrderKeeper.read', function() {
                expect(PurchaseOrderKeeper.read).toHaveBeenCalled();
            });
            it('should return the list comming from keeper', function() {
                expect(returnedPurchaseOrder).toEqual(purchaseOrders);
            });
        });
    });

    describe('Given a error in PurchaseOrderKeeper.read that throws exception\n', function() {
        beforeEach(function() {
            PurchaseOrderKeeper.read = jasmine.createSpy('PurchaseOrderKeeper.read').andCallFake(function(){
                throw 'its me mario';
            });
        });

        describe('When list is called\n Then', function() {
            beforeEach(function() {
                returnedPurchaseOrder = PurchaseOrderService.read();
            });
            it('should call PurchaseOrderKeeper.read', function() {
                expect(PurchaseOrderKeeper.read).toHaveBeenCalled();
            });
            it('should return the list comming from keeper', function() {
                expect(returnedPurchaseOrder).toEqual(null);
            });
        });
    });
});