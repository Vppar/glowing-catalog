'use strict';

describe('Service: Creditcardpaymentservice', function () {

  // load the service's module
  beforeEach(module('glowingCatalogApp'));

  // instantiate service
  var Creditcardpaymentservice;
  beforeEach(inject(function (_Creditcardpaymentservice_) {
    Creditcardpaymentservice = _Creditcardpaymentservice_;
  }));

  it('should do something', function () {
    expect(!!Creditcardpaymentservice).toBe(true);
  });

});
