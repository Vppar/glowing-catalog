'use strict';

describe('Service: Receivableservice', function () {

  // load the service's module
  beforeEach(module('glowingCatalogApp'));

  // instantiate service
  var Receivableservice;
  beforeEach(inject(function (_Receivableservice_) {
    Receivableservice = _Receivableservice_;
  }));

  it('should do something', function () {
    expect(!!Receivableservice).toBe(true);
  });

});
