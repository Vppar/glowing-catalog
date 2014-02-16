'use strict';

describe('Service: UserService', function() {

  var SyncDriverMock = {};
  var SyncServiceMock = {};

  // load the service's module
  beforeEach(function () {
    module('tnt.catalog.user');

    module(function ($provide) {
      $provide.value('SyncDriver', SyncDriverMock);
      $provide.value('SyncService', SyncServiceMock);
    });
  });

  // instantiate service
  var UserService = null;
  beforeEach(inject(function(_UserService_) {
    UserService = _UserService_;
  }));

  it('is accessible', function() {
    expect(!!UserService).toBe(true);
  });
});
