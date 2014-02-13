'use strict';

describe('Service: UserService', function() {

  // load the service's module
  beforeEach(module('tnt.catalog.user'));

  // instantiate service
  var UserService = null;
  beforeEach(inject(function(_UserService_) {
    UserService = _UserService_;
  }));

  it('should do something', function() {
    expect(!!UserService).toBe(true);
  });
});
