'use strict';

describe('Service: Replayer', function () {

  // load the service's module
  beforeEach(module('tnt.catalog.journal.replayer'));

  // instantiate service
  var Replayer = undefined;
  beforeEach(inject(function (_Replayer_) {
    Replayer = _Replayer_;
  }));

  it('should do something', function () {
    expect(!!Replayer).toBe(true);
  });

});
