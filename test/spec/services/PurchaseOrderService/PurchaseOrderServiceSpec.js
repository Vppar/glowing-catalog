'use strict';

describe('Service: PurchaseOrderService', function () {

  var PurchaseOrderService;

  // load the service's module
  beforeEach(function () {
    module('tnt.catalog.purchaseOrder.service');
    module('tnt.catalog.purchaseOrder');
  });

  beforeEach(inject(function(_PurchaseOrderService_) {
      PurchaseOrderService = _PurchaseOrderService_;
  }));

  it('initializes an purchaseOrder object', function () {
    expect(PurchaseOrderService).not.toBeUndefined();
  });
});
