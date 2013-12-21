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

    it('should create bucket', function() {

        var resolved = false;

        runs(function() {

            var data = {
                a : 'a',
                b : 'b'
            };

            var metadata = {
                metaVersion : 1
            };

            var txBody = function(tx) {
                WebSQLDriver.createBucket(tx, 'MyBucket', data, metadata);
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

    it('should fail with whrong metaVersion', function() {

        var data = {
            a : 'a',
            b : 'b'
        };

        var metadata = {};
        var name = 'MyBucket';

        var txBody = function(tx) {
            try {
                WebSQLDriver.createBucket(tx, name, data, metadata);
            } catch (e) {
                expect(e).toEqual('Metadata version not suported in ' + name);
            }
        };

        WebSQLDriver.transaction(txBody);

    });
});
