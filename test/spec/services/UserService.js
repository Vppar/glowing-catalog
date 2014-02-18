'use strict';

describe('Service: UserService', function() {

    var $log = {
        debug : angular.noop
    };

    var SyncServiceMock = {};
    var SyncDriverMock = {};

    // load the service's module
    beforeEach(function() {
        module('angular-md5');
        module('tnt.catalog.user');

        module(function ($provide) {
          $provide.value('SyncService', SyncServiceMock);
          $provide.value('SyncDriver', SyncDriverMock);
        });
    });


    beforeEach(inject(function ($q) {
        PromiseHelper.config($q, $log.debug);
    }));


    beforeEach(function () {
        SyncDriverMock.login = jasmine.createSpy('SyncDriver.login');
        SyncDriverMock.logout = jasmine.createSpy('SyncDriver.logout');
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
        SyncDriverMock.login.andCallFake(PromiseHelper.resolved(true));
        UserService.login();
    });
});
