'use strict';

xdescribe('Service: Inventorykeeper', function () {

  // load the service's module
  beforeEach(module('glowingCatalogApp'));

  // instantiate service
  var Inventorykeeper;
  beforeEach(inject(function (_Inventorykeeper_) {
    Inventorykeeper = _Inventorykeeper_;
  }));

  it('should do something', function () {
    expect(!!Inventorykeeper).toBe(true);
  });

});
