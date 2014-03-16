describe('Service: PurchaseOrderServiceListSpec\n', function() {

    var TypeKeeper = null;
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
            PurchaseOrderKeeper.list = jasmine.createSpy('PurchaseOrderKeeper.list').andReturn(purchaseOrders);
        });

        describe('When list is called\n Then', function() {
            beforeEach(function() {
                returnedList = PurchaseOrderService.list();
            });
            it('should call PurchaseOrderKeeper.list', function() {
                expect(PurchaseOrderKeeper.list).toHaveBeenCalled();
            });
            it('should return the list comming from keeper', function() {
                expect(returnedList).toEqual(purchaseOrders);
            });
        });
    });

    describe('Given a error in PurchaseOrderKeeper.list that throws exception\n', function() {
        beforeEach(function() {
            PurchaseOrderKeeper.list = jasmine.createSpy('PurchaseOrderKeeper.list').andCallFake(function(){
                throw 'its me mario';
            });
        });

        describe('When list is called\n Then', function() {
            beforeEach(function() {
                returnedList = PurchaseOrderService.list();
            });
            it('should call PurchaseOrderKeeper.list', function() {
                expect(PurchaseOrderKeeper.list).toHaveBeenCalled();
            });
            it('should return the list comming from keeper', function() {
                expect(returnedList).toEqual(null);
            });
        });
    });
});