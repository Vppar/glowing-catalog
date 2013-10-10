'use strict';

describe('Service: DataProvider', function () {

  // load the service's module
  beforeEach(module('glowingCatalogApp'));

  // instantiate service
  var BasketService;
  beforeEach(inject(function (_BasketService_) {
    BasketService = _BasketService_;
  }));

  it('should do something', function () {
    expect(!!BasketService).toBe(true);
  });

});
