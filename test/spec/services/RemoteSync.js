'use strict';

describe('Service: RemoteSync', function () {

  // load the service's module
  beforeEach(module('tnt.catalog.sync'));

  // instantiate service
  var RemoteSync;
  beforeEach(inject(function (_RemoteSync_) {
    RemoteSync = _RemoteSync_;
  }));

  it('should do something', function () {
    expect(!!RemoteSync).toBe(true);
  });

});
