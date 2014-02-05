'use strict';

describe('Service: Log', function () {

  // load the service's module
  beforeEach(module('tnt.util.log'));

  // instantiate service
  var log;
  beforeEach(inject(function (_log_) {
    log = _log_;
  }));

  it('should do something', function () {
    expect(!!log).toBe(true);
  });

});
