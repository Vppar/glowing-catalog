'use strict';

describe('Service: UserService', function() {

    // load the service's module
    beforeEach(function() {
        module('angular-md5');
        module('tnt.catalog.user');
    });

    // instantiate service
    var UserService = null;
    beforeEach(inject(function(_UserService_) {
        UserService = _UserService_;
    }));

    it('should instantiate service', function() {
        expect(!!UserService).toBe(true);
    });

    it('should login', function() {
        UserService.login();
    });
});
