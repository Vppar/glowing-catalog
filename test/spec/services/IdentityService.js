'use strict';

describe('Service: IdentityService', function() {

  // load the service's module
  beforeEach(function() {
    module('tnt.identity');
  });

  // instantiate service
  var IdentityService = null;
  beforeEach(inject(function(_IdentityService_) {
    IdentityService = _IdentityService_;
  }));

  it('should generate a valid UUID', function() {
    var uuid = IdentityService.getUUID(255, 65535);
    expect(uuid.length).toBe(36);
    expect(uuid.substring(24, 26)).toBe('01');
    expect(uuid.substring(28, 30)).toBe('ff');
    expect(uuid.substring(32, 36)).toBe('ffff');
  });

  it('should fail to generate an UUID, op is too big', function() {

    expect(function() {
      IdentityService.getUUID(256, 1);
    }).toThrow();

  });

  it('should fail to generate an UUID, id is too big', function() {
    expect(function() {
      IdentityService.getUUID(1, 65536);
    }).toThrow();
  });

});
