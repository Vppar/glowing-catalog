'use strict';

describe('Service: WebSQLDriver.transaction', function() {

    // load the service's module
    beforeEach(function() {

        var log = {};
        log.debug = function(){};
        log.error = function(){};

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

    it('should resolve transaction', function() {

        var resolved = false;

        runs(function() {
            var txBody = function(tx) {

            };

            var promise = WebSQLDriver.transaction(txBody);

            promise.then(function() {
                resolved = true;
            });
        });

        waitsFor(function() {
            scope.$apply();
            return resolved;
        });

        runs(function() {
            expect(resolved).toBe(true);
        });
    });

    it('should resolve transaction with failure', function() {

        var resolved = false;

        runs(function() {
            var txBody = function(tx) {
                tx.executeSql('LALALA');
            };

            var promise = WebSQLDriver.transaction(txBody);

            promise.then(undefined, function() {
                resolved = true;
            });
        });

        waitsFor(function() {
            scope.$apply();
            return resolved;
        });

        runs(function() {
            expect(resolved).toBe(true);
        });
    });

});
