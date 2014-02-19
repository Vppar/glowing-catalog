'use strict';

describe('Service: GoPayGateway', function () {

  // load the service's module
  beforeEach(module('glowingCatalogApp'));

  // instantiate service
  var GoPayGateway;
  beforeEach(inject(function (_GoPayGateway_) {
      GoPayGateway = _GoPayGateway_;
  }));

  it('should do something', function () {
    expect(!!GoPayGateway).toBe(true);
  });

});
