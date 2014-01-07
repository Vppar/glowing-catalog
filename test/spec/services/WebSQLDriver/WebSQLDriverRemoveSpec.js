'use strict';

describe('Service: WebSQLDriver.remove', function() {

	var data1 = {
		a : 'a1',
		b : 'b1'
	};
	
	var data2 = {
		a : 'a2',
		b : 'b2'
	};
	
	var data3 = {
		a : 'a3',
		b : 'b2'
	};
	
	var dataResult = [];
	
	var bucketName = 'MyBucket';
	
	var dataCreate = {
            a : 'a',
            b : 'b'
        };
	
	var metadata = {
            metaVersion : 1
        };
	
	
    // load the service's module
    beforeEach(function() {

        var log = {};
        log.debug = console.log;
        log.error = console.log;

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
    
    it('should be here', function() {
        expect(!!WebSQLDriver).toBe(true);
    });

    
    it('should remove an object', function() {
    	createBucket();
    	persist([data1,data2]);
    	console.log('dae');
    });
    
    it('should remove an object', function() {
        
    });
    
    it('should remove an object', function() {
        
    });
    
    it('should not remove an object', function() {
    	
    });
    
    var createBucket = function(){
    	 var resolved = false;

         runs(function() {

             var txBody = function(tx) {
                 WebSQLDriver.createBucket(tx, bucketName, dataCreate, metadata);
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
         
         return resolved;

    };
    
    var persist = function(datas){
        var persisted = false;

        // persist
        runs(function() {
            var txBody = function(tx) {
            	for(var d in datas){
            	WebSQLDriver.persist(tx, bucketName, datas[d]);
            	}
            	
            };

            var promise = WebSQLDriver.transaction(txBody);

            promise.then(function() {
                persisted = true;
            });

        });

        waitsFor(function() {
            scope.$apply();
            return persisted;
        });

        runs(function() {
            expect(persisted).toEqual(true);
        });

    };
    
    
});
