'use strict';

describe('Service: Voucherservice', function () {

  // load the service's module
  beforeEach(function(){
      module('tnt.catalog.voucher');
      module('tnt.catalog.voucher.service');
      module('tnt.catalog.voucher.keeper');
      module('tnt.catalog.voucher.entity');
      module('tnt.catalog.journal');
      module('tnt.catalog.journal.entity');
      module('tnt.catalog.journal.replayer');
  });

  // instantiate service
  var VoucherService = undefined;
  beforeEach(inject(function (_VoucherService_) {
      VoucherService = _VoucherService_;
  }));

  it('should do something', function () {
    expect(!!VoucherService).toBe(true);
  });

});
