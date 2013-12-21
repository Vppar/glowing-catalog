'use strict';

describe('Service: WebSQLDriver.list', function() {

    // load the service's module
    beforeEach(function() {

        var log = {};
        log.debug = console.log
        log.error = console.log

        module('tnt.storage.websql');
        module(function($provide) {
            $provide.value('$log', log);
        });
    });

    // instantiate service
    var WebSQLDriver = undefined;
    var scope = undefined;

    beforeEach(inject(function(_WebSQLDriver_, $rootScope) {
        WebSQLDriver = _WebSQLDriver_;
        scope = $rootScope;
    }));

    it('should be there', function() {
        expect(!!WebSQLDriver).toBe(true);
    });
    
    
    
});
