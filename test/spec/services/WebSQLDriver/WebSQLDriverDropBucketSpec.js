'use strict';

describe('Service: WebSQLDriver.dropBucket', function() {

    // load the service's module
    beforeEach(function() {

        var log = {};
        log.debug = function(){}; //console.log
        log.error = function(){}; //console.log

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

    /**
     * <pre>
     * @spec WebSQLDriver.dropBucket#1
     * Given a valid transaction
     * and a valid bucket name
     * When a dropBucket is triggered
     * Then the table with the bucket name must be dropped 
     * </pre>
     */
    it('should drop bucket', function() {

        var createdBucket = false;
        var dropBucket = false;
        var name = 'MyBucket';

        runs(function() {

            var data = {
                a : 'a',
                b : 'b'
            };
            var metadata = {
                metaVersion : 1
            };

            // create a bucket
            var txBody = function(tx) {
                WebSQLDriver.createBucket(tx, name, data, metadata);
            };
            //promise from the create
            var promise = WebSQLDriver.transaction(txBody);

            //sucess of create
            promise.then(function() {
                createdBucket = true;
            });
        });

        waitsFor(function() {
            scope.$apply();
            return createdBucket;
        });

        runs(function() {
            // drop a bucket
            var txBody = function(tx) {
                WebSQLDriver.dropBucket(tx, name);
            };
            
            var promise = WebSQLDriver.transaction(txBody);
            
            promise.then(function() {
                dropBucket = true;
            });
        });
        
        waitsFor(function() {
            scope.$apply();
            return dropBucket;
        });
        
        runs(function() {
            expect(dropBucket).toEqual(true);
        });
        
    });
});
