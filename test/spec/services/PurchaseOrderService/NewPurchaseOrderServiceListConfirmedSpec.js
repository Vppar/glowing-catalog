describe('Service: PurchaseOrderServiceListConfirmedSpec\n', function() {

    var PurchaseOrderKeeper = null;
    var typeKeeperListReturn = null;

    var purchaseOrders = null;
    var returnedList = null;

    // Mock data
    beforeEach(function() {
        typeKeeperListReturn = [];
    });

    // Mock dependencies
    beforeEach(function() {
        PurchaseOrderKeeper = {};
    });

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.purchase.service');
        module('tnt.catalog.purchaseOrder');

        module(function($provide) {
            $provide.value('PurchaseOrderKeeper', PurchaseOrderKeeper);
        });
    });

    beforeEach(inject(function(_NewPurchaseOrderService_, _PurchaseOrder_) {
        PurchaseOrderService = _NewPurchaseOrderService_;
        PurchaseOrder = _PurchaseOrder_;
    }));

    describe('Given a list of confirmed purchase orders\n', function() {
        beforeEach(function() {
            PurchaseOrderKeeper.listByStatus = jasmine.createSpy('PurchaseOrderKeeper.listByStatus').andReturn(purchaseOrders);
        });

        describe('When confirmed list is called\n Then', function() {
            beforeEach(function() {
                returnedList = PurchaseOrderService.listConfirmed();
            });
            it('should call PurchaseOrderKeeper.listByStatus passing confirmed parameter', function() {
                expect(PurchaseOrderKeeper.listByStatus).toHaveBeenCalled();
            });
            it('should return the confirmed list comming from keeper', function() {
                expect(returnedList).toEqual(purchaseOrders);
            });
        });
    });

    describe('Given a error in PurchaseOrderKeeper.listByStatus confirmed that throws exception\n', function() {
        beforeEach(function() {
            PurchaseOrderKeeper.listByStatus = jasmine.createSpy('PurchaseOrderKeeper.listByStatus').andCallFake(function(){
                throw 'its me mario';
            });
        });

        describe('When confirmed list is called\n Then', function() {
            beforeEach(function() {
                returnedList = PurchaseOrderService.listConfirmed();
            });
            it('should call PurchaseOrderKeeper.listByStatus passing confirmed parameter', function() {
                expect(PurchaseOrderKeeper.listByStatus).toHaveBeenCalled();
            });
            it('should return the confirmed list comming from keeper', function() {
                expect(returnedList).toEqual(null);
            });
        });
    });
});