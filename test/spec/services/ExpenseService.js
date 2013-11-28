'use strict';

describe('Service: Expenseservice', function () {

  // load the service's module
  beforeEach(module('glowingCatalogApp'));

  // instantiate service
  var Expenseservice;
  beforeEach(inject(function (_Expenseservice_) {
    Expenseservice = _Expenseservice_;
  }));

  it('should do something', function () {
    expect(!!Expenseservice).toBe(true);
  });

});
