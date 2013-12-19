'use strict';

describe('Service: GoPayService', function() {

    var log = {};
    var dp = {};

    // load the service's module
    beforeEach(function() {

        log.error = jasmine.createSpy('$log.error');
        log.warn = jasmine.createSpy('$log.warn');
        log.debug = jasmine.createSpy('$log.warn');

        module('tnt.catalog.gopay');
        module(function($provide) {
            $provide.value('DataProvider', dp);
            $provide.value('$log', log);
        });
    });

    // instantiate service
    var GoPayService = undefined;
    beforeEach(inject(function(_GoPayService_) {
        GoPayService = _GoPayService_;
    }));

    it('should do something', function() {
        expect(!!GoPayService).toBe(true);
    });

});
