describe('Service: OrderServiceIsValid', function () {
  var fakeNow = 1386444467895;
  var monthTime = 2592000;

  var logMock = {};
  var loggerMock = {};
  var OrderMock = {};
  var OrderKeeperMock = {};
  var DataProviderMock = {};

  var OrderService;

  // load the service's module
  beforeEach(function () {

    module('tnt.catalog.order.service');

    spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
    logMock.debug = jasmine.createSpy('$log.debug');
    loggerMock.getLogger = jasmine.createSpy('logger.getLogger');

    DataProviderMock.customers = [
      {
        id : 1,
        name : 'Foo Bar'
      }
    ];

    module(function ($provide) {
      $provide.value('$log', logMock);
      $provide.value('logger', loggerMock);
      $provide.value('Order', OrderMock);
      $provide.value('OrderKeeper', OrderKeeperMock);
      $provide.value('DataProvider', DataProviderMock);
    });
  });

  beforeEach(inject(function(_OrderService_) {
    OrderService = _OrderService_;
  }));


  /**
   * Given a valid order
   * When isValid is triggered
   * Then true should be returned
   */
  it('returns true if order is valid', function () {
    var validOrder = {
      date : new Date(),
      canceled : false,
      customerId : 1,
      items : [{}]
    };

    var result = OrderService.isValid(validOrder);
    expect(result.length).toBe(0);
  });

  /**
   * Given an invalid order
   * When isValid is triggered
   * Then false should be returned
   */
  it('returns false if order is not valid', function () {
    var invalidOrder = {
      date : null,
      canceled : false,
      customerId : 1,
      items : [{}]
    };

    var result = OrderService.isValid(invalidOrder);
    expect(result.length).not.toBe(0);
  });


  // TODO: check individual property validation
});
