'use strict';
describe('Service: PurchaseOrderService', function() {

    var PurchaseOrderService = {};
    var StockService = {};

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.purchaseOrder');
        module('tnt.catalog.purchaseOrder.service');
        module('tnt.catalog.stock.entity');

        module(function($provide) {
            $provide.value('StockService', StockService);
        });
    });

    beforeEach(inject(function(_PurchaseOrderService_) {
        PurchaseOrderService = _PurchaseOrderService_;
    }));

    it('test', function() {
        // PurchaseOrderService.pendingReport();
    });
});
