'use strict';

describe('Service: Remotesync', function () {

  // load the service's module
  beforeEach(module('glowingCatalogApp'));

  // instantiate service
  var Remotesync;
  beforeEach(inject(function (_Remotesync_) {
    Remotesync = _Remotesync_;
  }));

  it('should do something', function () {
    expect(!!Remotesync).toBe(true);
  });

});
