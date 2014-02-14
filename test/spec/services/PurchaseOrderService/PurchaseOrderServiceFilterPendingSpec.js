'use strict';
describe('Service: PurchaseOrderService', function() {

    var PurchaseOrderService = {};
    var purchases = [{
        uuid : 'cc02b600-5d0b-11e3-96c3-010001000001',
        created : new Date(),
        canceled : false,
        received : 2,
        items : [
            {
                id : 1,
                qty : 2
                
            }
        ]
    }, {
        uuid : 'cc02b600-5d0b-11e3-96c3-010001000002',
        created : new Date(),
        canceled : false,
        items : [
            {
                id : 1,
                qty : 2
                
            },{
                id : 2,
                qty : 4
                
            }
        ],
        itemsReceived : [{productId : 1, qty : 1},{productId : 2, qty : 1}]
    },{
        uuid : 'cc02b600-5d0b-11e3-96c3-010001000003',
        created : new Date(),
        canceled : false,
        items : [
            {
                id : 1,
                qty : 2
                
            },{
                id : 2,
                qty : 4
                
            }
        ],
        itemsReceived : [{productId : 1, qty : 2},{productId : 2, qty : 4}]
    }];

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.purchaseOrder');
        module('tnt.catalog.purchaseOrder.service');
    });
    
    beforeEach(inject(function(_PurchaseOrderService_) {
        PurchaseOrderService = _PurchaseOrderService_;
        PurchaseOrderService.list = jasmine.createSpy('list').andReturn(purchases);
    }));

    it('filter the orders with pending items', function() {
        //given
        //when
        var result = PurchaseOrderService.filterPending();
        //then
        expect(result.length).toBe(1);
    });
});
