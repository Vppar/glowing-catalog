'use strict';

describe('Service: WebSQLDriver.list', function() {

	var name = 'MyBucket';
    var dataCreate = {
        a : 'a',
        b : 'b',
        c : 'c'
    };
    var metadata = {
        key : 'a',
        metaVersion : 1
    };
    
    var data1 = {
            a : 'alpha1',
            b : 'beta1',
            c : 'comma1'
        };
        var data2 = {
                a : 'alpha2',
                b : 'beta2',
                c : 'comma2'
            };
    
    
	
    // load the service's module
    beforeEach(function() {

        var log = {};
        log.debug = function(){};//console.log;
        log.error = function(){};//console.log;

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
    
    it('should return a list with objects without parameters', function() {
    	var createdBucket = false;
        var persisted = false;

        var testList = [];
        testList.push(data1,data2);

        // create a bucket
        runs(function() {
        	
            // tx to create a bucket
            var txBody = function(tx) {
            	WebSQLDriver.dropBucket(tx, name);
                WebSQLDriver.createBucket(tx, name, dataCreate, metadata);
            };
            // promise from the create
            var promise = WebSQLDriver.transaction(txBody);

            // sucess of create
            promise.then(function() {
                createdBucket = true;
            });
        });

        waitsFor(function() {
            scope.$apply();
            return createdBucket;
        });

        // persist two data models
        runs(function() {
            var txBody = function(tx) {
                WebSQLDriver.persist(tx, name, data1);
                WebSQLDriver.persist(tx, name, data2);
            };

            var promise = WebSQLDriver.transaction(txBody);

            promise.then(
            		function() {
            			persisted = true;
            		}
            );

        });

        waitsFor(function() {
            scope.$apply();
            return persisted;
        });
        
        var listed = false;
        var returnedList = null;
        
        // list
        runs(function() {
        	
            // tx to create a bucket
            var txBody = function(tx) {
            	WebSQLDriver.list(tx, name).then(function(result){
            		returnedList = result;	
            	});
            };
            // promise from the create
            var promise = WebSQLDriver.transaction(txBody);

            // sucess of create
            promise.then(function(data) {
            	listed = true;
            });
        });
        
        waitsFor(function() {
            scope.$apply();
            return listed;
        });

        runs(function() {
        	expect(testList).toEqual(returnedList);
        });
    });
        
    it('should return a list with objects with parameters', function() {
    	var createdBucket = false;
        var persisted = false;

        var testList = [];
        testList.push(data1);

        // create a bucket
        runs(function() {
        	
            // tx to create a bucket
            var txBody = function(tx) {
            	WebSQLDriver.dropBucket(tx, name);
                WebSQLDriver.createBucket(tx, name, dataCreate, metadata);
            };
            // promise from the create
            var promise = WebSQLDriver.transaction(txBody);

            // sucess of create
            promise.then(function() {
                createdBucket = true;
            });
        });

        waitsFor(function() {
            scope.$apply();
            return createdBucket;
        });

        // persist two data models
        runs(function() {
            var txBody = function(tx) {
                WebSQLDriver.persist(tx, name, data1);
                WebSQLDriver.persist(tx, name, data2);
            };

            var promise = WebSQLDriver.transaction(txBody);

            promise.then(
            		function() {
            			persisted = true;
            		}
            );

        });

        waitsFor(function() {
            scope.$apply();
            return persisted;
        });
        
        var listed = false;
        var returnedList = null;
        
        // list
        runs(function() {
        	
            // tx to create a bucket
            var txBody = function(tx) {
            	WebSQLDriver.list(tx, name,{a:'alpha1'}).then(function(result){
            		returnedList = result;	
            	});
            };
            // promise from the create
            var promise = WebSQLDriver.transaction(txBody);

            // sucess of create
            promise.then(function(data) {
            	listed = true;
            });
        });
        
        waitsFor(function() {
            scope.$apply();
            return listed;
        });

        runs(function() {
        	expect(testList).toEqual(returnedList);
        });
    });    
});
