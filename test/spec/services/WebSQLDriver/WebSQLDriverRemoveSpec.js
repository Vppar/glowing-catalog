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
	var data4 = {
			a : 'a2',
			b : 'b4'
		};
	
	
	
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
        log.debug = function(){};// console.log;
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
    
    it('should be here', function() {
        expect(!!WebSQLDriver).toBe(true);
    });

    /**
     * <pre>
     * @spec WebSQLDriver.remove#1
     * Given a valid transaction
     * and a valid bucket name
     * and a valid object with parameters and values
     * When a remove is triggered
     * Then the objects filtered by the parameters must be deleted of database
     * </pre>
     */
    it('should remove an object', function() {
    	var resolved = false;
    	var persisted = false;
    	var listed = false;
    	var deleted = false;
    	
        var returnedList = null;
        var dataResult = [];
        
        dataResult.push(data2);
        
        runs(function() {

            var txBody = function(tx) {
            	WebSQLDriver.dropBucket(tx,bucketName);
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
        
        
        // persist
        runs(function() {
            var txBody = function(tx) {
            	
            	WebSQLDriver.persist(tx, bucketName, data1);
            	WebSQLDriver.persist(tx, bucketName, data2);
            	
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
        	// tx to create a bucket
            var txBody = function(tx) {
            	WebSQLDriver.remove(tx, bucketName,{a:'a1'});
            };
            // promise from the create
            var promise = WebSQLDriver.transaction(txBody);
            
         // sucess of create
            promise.then(function() {
            	deleted = true;
            });
        });
        
        waitsFor(function() {
            scope.$apply();
            return deleted;
        });
        
        // list
        runs(function() {
        	
            // tx to create a bucket
            var txBody = function(tx) {
            	WebSQLDriver.list(tx, bucketName).then(function(result){
            		returnedList = result;	
            		
            	});
            };
            // promise from the create
            var promise = WebSQLDriver.transaction(txBody);

            // sucess of create
            promise.then(function() {
            	listed = true;
            });
        });
        
        waitsFor(function() {
            scope.$apply();
            return listed;
        });
        
        runs(function() {
        	expect(dataResult).toEqual(returnedList);
        });
    	
    });
    
    //remove b2
    it('should remove an object', function() {
    	var resolved = false;
    	var persisted = false;
    	var listed = false;
    	var deleted = false;
    	
        var returnedList = null;
        var dataResult = [];
        
        dataResult.push(data1);
        
        runs(function() {

            var txBody = function(tx) {
            	WebSQLDriver.dropBucket(tx,bucketName);
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
        
        
        // persist
        runs(function() {
            var txBody = function(tx) {
            	
            	WebSQLDriver.persist(tx, bucketName, data1);
            	WebSQLDriver.persist(tx, bucketName, data2);
            	WebSQLDriver.persist(tx, bucketName, data3);
            	
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
        	// tx to create a bucket
            var txBody = function(tx) {
            	WebSQLDriver.remove(tx, bucketName,{b:'b2'});
            };
            // promise from the create
            var promise = WebSQLDriver.transaction(txBody);
            
         // sucess of create
            promise.then(function() {
            	deleted = true;
            });
        });
        
        waitsFor(function() {
            scope.$apply();
            return deleted;
        });
        
        // list
        runs(function() {
        	
            // tx to create a bucket
            var txBody = function(tx) {
            	WebSQLDriver.list(tx, bucketName).then(function(result){
            		returnedList = result;	
            		
            	});
            };
            // promise from the create
            var promise = WebSQLDriver.transaction(txBody);

            // sucess of create
            promise.then(function() {
            	listed = true;
            });
        });
        
        waitsFor(function() {
            scope.$apply();
            return listed;
        });
        
        runs(function() {
        	expect(dataResult).toEqual(returnedList);
        });
    });
    
    //remove 
    it('should remove an object', function() {
       	var resolved = false;
    	var persisted = false;
    	var listed = false;
    	var deleted = false;
    	
        var returnedList = null;
        var dataResult = [];
        
        dataResult.push(data1,data3,data4);
        
        runs(function() {

            var txBody = function(tx) {
            	WebSQLDriver.dropBucket(tx,bucketName);
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
        
        
        // persist
        runs(function() {
            var txBody = function(tx) {
            	
            	WebSQLDriver.persist(tx, bucketName, data1);
            	WebSQLDriver.persist(tx, bucketName, data2);
            	WebSQLDriver.persist(tx, bucketName, data3);
            	WebSQLDriver.persist(tx, bucketName, data4);
            	
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
        	// tx to create a bucket
            var txBody = function(tx) {
            	WebSQLDriver.remove(tx, bucketName,{a:'a2',b:'b2'});
            };
            // promise from the create
            var promise = WebSQLDriver.transaction(txBody);
            
         // sucess of create
            promise.then(function() {
            	deleted = true;
            });
        });
        
        waitsFor(function() {
            scope.$apply();
            return deleted;
        });
        
        // list
        runs(function() {
        	
            // tx to create a bucket
            var txBody = function(tx) {
            	WebSQLDriver.list(tx, bucketName).then(function(result){
            		returnedList = result;	
            		
            	});
            };
            // promise from the create
            var promise = WebSQLDriver.transaction(txBody);

            // sucess of create
            promise.then(function() {
            	listed = true;
            });
        });
        
        waitsFor(function() {
            scope.$apply();
            return listed;
        });
        
        runs(function() {
        	expect(dataResult).toEqual(returnedList);
        });
    });
    
    it('should not remove an object', function() {
    	var resolved = false;
    	var persisted = false;
    	var listed = false;
    	var deleted = false;
    	
        var returnedList = null;
        var dataResult = [];
        
        dataResult.push(data1,data2,data3,data4);
        
        runs(function() {

            var txBody = function(tx) {
            	WebSQLDriver.dropBucket(tx,bucketName);
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
        
        
        // persist
        runs(function() {
            var txBody = function(tx) {
            	
            	WebSQLDriver.persist(tx, bucketName, data1);
            	WebSQLDriver.persist(tx, bucketName, data2);
            	WebSQLDriver.persist(tx, bucketName, data3);
            	WebSQLDriver.persist(tx, bucketName, data4);
            	
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
        	// tx to create a bucket
            var txBody = function(tx) {
            	WebSQLDriver.remove(tx, bucketName,{a:'a7'});
            };
            // promise from the create
            var promise = WebSQLDriver.transaction(txBody);
            
         // sucess of create
            promise.then(function() {
            	deleted = true;
            });
        });
        
        waitsFor(function() {
            scope.$apply();
            return deleted;
        });
        
        // list
        runs(function() {
        	
            // tx to create a bucket
            var txBody = function(tx) {
            	WebSQLDriver.list(tx, bucketName).then(function(result){
            		returnedList = result;	
            		
            	});
            };
            // promise from the create
            var promise = WebSQLDriver.transaction(txBody);

            // sucess of create
            promise.then(function() {
            	listed = true;
            });
        });
        
        waitsFor(function() {
            scope.$apply();
            return listed;
        });
        
        runs(function() {
        	expect(dataResult).toEqual(returnedList);
        });
    });
    
    it('should not remove an object', function() {
    	var resolved = false;
    	var persisted = false;
    	var listed = false;
    	var deleted = false;
    	
        var returnedList = null;
        var dataResult = [];
        
        dataResult.push(data1,data2,data3,data4);
        
        runs(function() {

            var txBody = function(tx) {
            	WebSQLDriver.dropBucket(tx,bucketName);
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
        
        
        // persist
        runs(function() {
            var txBody = function(tx) {
            	
            	WebSQLDriver.persist(tx, bucketName, data1);
            	WebSQLDriver.persist(tx, bucketName, data2);
            	WebSQLDriver.persist(tx, bucketName, data3);
            	WebSQLDriver.persist(tx, bucketName, data4);
            	
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
        	// tx to create a bucket
            var txBody = function(tx) {
            	WebSQLDriver.remove(tx, bucketName,{a:'a1', b: 'b4'});
            };
            // promise from the create
            var promise = WebSQLDriver.transaction(txBody);
            
         // sucess of create
            promise.then(function() {
            	deleted = true;
            });
        });
        
        waitsFor(function() {
            scope.$apply();
            return deleted;
        });
        
        // list
        runs(function() {
        	
            // tx to create a bucket
            var txBody = function(tx) {
            	WebSQLDriver.list(tx, bucketName).then(function(result){
            		returnedList = result;	
            		
            	});
            };
            // promise from the create
            var promise = WebSQLDriver.transaction(txBody);

            // sucess of create
            promise.then(function() {
            	listed = true;
            });
        });
        
        waitsFor(function() {
            scope.$apply();
            return listed;
        });
        
        runs(function() {
        	expect(dataResult).toEqual(returnedList);
        });
    });
    
    
});
