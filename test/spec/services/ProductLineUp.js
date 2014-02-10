'use strict';

describe('Service: ProductLineUp', function () {

  // load the service's module
  beforeEach(module('tnt.catalog.lineup'));

  // instantiate service
  var ProductLineUp = undefined;
  beforeEach(inject(function (_ProductLineUp_) {
      ProductLineUp = _ProductLineUp_;
  }));

  it('should do something', function () {
    expect(!!ProductLineUp).toBe(true);
  });

});
