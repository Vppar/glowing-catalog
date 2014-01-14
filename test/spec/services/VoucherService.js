'use strict';

xdescribe('Service: Voucherservice', function () {

  // load the service's module
  beforeEach(module('tnt.catalog.voucher.service'));

  // instantiate service
  var VoucherService = undefined;
  beforeEach(inject(function (_VoucherService_) {
      VoucherService = _VoucherService_;
  }));

  it('should do something', function () {
    expect(!!VoucherService).toBe(true);
  });

});
