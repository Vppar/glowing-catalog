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
    
    it('should return a valid UUID data with 2 digit data.id', function() {
        var uuid = '06394cb0-9652-11e3-aad4-01000600000b';
        var data = IdentityService.getUUIDData(uuid);
        
        expect(data.deviceId).toBe(1);
        expect(data.typeId).toBe(6);
        expect(data.id).toBe(11);
    });
    
    it('should return a valid UUID data with 3 digit data.id', function() {
        var uuid = '06394cb0-9652-11e3-aad4-010006000f0a';
        var data = IdentityService.getUUIDData(uuid);
        
        expect(data.deviceId).toBe(1);
        expect(data.typeId).toBe(6);
        expect(data.id).toBe(3850);
    });
    
    it('should return a valid UUID data with 4 digit data.id', function() {
        var uuid = '06394cb0-9652-11e3-aad4-010006001f0a';
        var data = IdentityService.getUUIDData(uuid);
        
        expect(data.deviceId).toBe(1);
        expect(data.typeId).toBe(6);
        expect(data.id).toBe(7946);
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


    // TODO Test the get methods

});
