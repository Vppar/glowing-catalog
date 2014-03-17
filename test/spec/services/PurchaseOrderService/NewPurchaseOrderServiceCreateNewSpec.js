describe('Service: PurchaseOrderServiceCreateNewSpec\n', function() {

    var TypeKeeper = null;
    var PurchaseOrderKeeper = null;
    var typeKeeperListReturn = null;

    var statusTypePending = null;
    var purchaseOrder = null;
    var expectedPurchaseOrder = null;
    var product = null;

    // Mock data
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
        product = {
            id : 1,
            cost : 50,
            points : 150,
            qty : 2
        };
        product2 = {
            id : 3,
            cost : 150,
            points : 300,
            qty : 1
        };
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

    describe('Given a ?\n When createNew is called\n', function() {
        beforeEach(function() {
            purchaseOrder = PurchaseOrderService.createNewCurrent();
        });
        it('should return a new current purchase order', function() {
            expect(purchaseOrder.uuid).toEqual(expectedPurchaseOrder.uuid);
            expect(purchaseOrder.amount).toEqual(expectedPurchaseOrder.amount);
            expect(purchaseOrder.discount).toEqual(expectedPurchaseOrder.discount);
            expect(purchaseOrder.freight).toEqual(expectedPurchaseOrder.freight);
            expect(purchaseOrder.points).toEqual(expectedPurchaseOrder.points);
            expect(purchaseOrder.items).toEqual(expectedPurchaseOrder.items);
            expect(purchaseOrder.isDirty).toEqual(expectedPurchaseOrder.isDirty);
        });
        it('should be the same instance inside PurchaseOrderService', function() {
            expect(purchaseOrder).toBe(PurchaseOrderService.purchaseOrder);
        });
    });

    describe('Given a new current PurchaseOrder\n', function() {
        beforeEach(function() {
            purchaseOrder = PurchaseOrderService.createNewCurrent();
        });
        describe('When purchaseOrder.add is called\n', function() {
            beforeEach(function() {
                purchaseOrder.add(product);
            });
            it('should add product', function() {
                expect(purchaseOrder.amount).toEqual(product.qty * product.cost);
                expect(purchaseOrder.points).toEqual(product.qty * product.points);
            });
        });

        describe('When purchaseOrder.add is called with the same product\n', function() {
            beforeEach(function() {
                purchaseOrder.add(product);
                product.qty = 2 * product.qty;
                purchaseOrder.add(product);
            });
            it('should add product', function() {
                expect(purchaseOrder.amount).toEqual(product.qty * product.cost);
                expect(purchaseOrder.points).toEqual(product.qty * product.points);
            });
        });

        describe('When purchaseOrder.add is called twice\n', function() {
            beforeEach(function() {
                purchaseOrder.add(product);
                purchaseOrder.add(product2);
            });
            it('should add product', function() {
                expect(purchaseOrder.amount).toEqual(product.qty * product.cost + product2.qty * product2.cost);
                expect(purchaseOrder.points).toEqual(product.qty * product.points + product2.qty * product2.points);
            });
        });

        describe('When purchaseOrder.remove is called\n Then', function() {
            beforeEach(function() {
                purchaseOrder.add(product);
                purchaseOrder.add(product2);
                purchaseOrder.remove(product);
            });
            it('should remove product', function() {
                expect(purchaseOrder.amount).toEqual(product2.qty * product2.cost);
                expect(purchaseOrder.points).toEqual(product2.qty * product2.points);
            });
        });
    });

});