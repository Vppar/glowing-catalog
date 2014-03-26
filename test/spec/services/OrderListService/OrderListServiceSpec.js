describe('Service: OrderListService', function () {

  var OrderListService = null;

  // load the service's module
  beforeEach(function () {

    module('tnt.catalog.orderList.service');

  });

  beforeEach(inject(function(_OrderListService_) {
      OrderListService = _OrderListService_;
  }));

  it('should initilize service', function () {
    expect(OrderListService).not.toBeUndefined();
    expect(typeof OrderListService).toBe('object');
  });

});
