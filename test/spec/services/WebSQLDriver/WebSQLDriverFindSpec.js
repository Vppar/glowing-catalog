'use strict';

describe('Service: WebSQLDriver.find', function() {

	var bucketName = 'MyBucket';
	var dataCreate = {
		a : 'a',
		b : 'b',
		c : 'c'
	};
	var data1 = {
            b : 'beta1',
            c : 'comma1',
            a : 'alpha1'
        };
	var data2 = {
            b : 'beta2',
            c : 'comma2',
            a : 'alpha1'
        };
	
	var metadata = {
  		key : 'a',
  		metaVersion : 1,
  		columns: ['a', 'b', 'c']
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

	/**
     * <pre>
     * @spec WebSQLDriver.find#1
     * Given a valid transaction
     * and a valid bucket name
     * and a valid primary key value
     * When a find is triggered
     * Then the data object must be returned
     * </pre>
     */
	it('should return a object', function() {

				var id = 'a';
				var listed = false;
				var cb = null;

				var createdBucket = false;
				var persisted = false;

				var returnedObject = null;

				// create a bucket
				runs(function() {
					// tx to create a bucket
					var txBody = function(tx) {
						WebSQLDriver.createBucket(tx, bucketName, metadata);
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

				// persist
				runs(function() {
					var txBody = function(tx) {
						WebSQLDriver.persist(tx, bucketName, dataCreate);
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

				// pass a valid name
				runs(function() {
				    
				    var promises = {};
				    
					// tx to list
					var txBody = function(tx) {
					    promises.find = WebSQLDriver.find(tx, bucketName, id);
					};
					

					// promise from the create
					promises.transaction = WebSQLDriver.transaction(txBody);

					// sucess of create
					promises.transaction.then(function(result) {
						listed = true;
						
						promises.find.then(function(result) {
				            returnedObject = result;
				        });
					});

				});

				waitsFor(function(d) {
					scope.$apply();
					return listed;
				});

				runs(function() {
					expect(returnedObject).toEqual(dataCreate);
				});

			});

	/**
     * <pre>
     * @spec WebSQLDriver.find#2
     * Given a primary key value that was not set in database
     * When a persist is triggered
     * Then null must be returned
     * </pre>
     */
	it('shouldn\'t return a object', function() {

				var id = 'alo';
				var notlisted = false;
				var cb = null;
				
				var returnedObject = null;

				createBucket();
				persistData(data1);
				
				
				// pass a valid name
				runs(function() {
					
					// tx to list
					var txBody = function(tx) {
						WebSQLDriver.find(tx, bucketName, id).then(
								null,function(error){
									returnedObject = error;
									notlisted = true;
								});
					};

					// promise from the create
					var promise = WebSQLDriver.transaction(txBody);
				});

				waitsFor(function(d) {
					scope.$apply();
					return notlisted;
				});

				runs(function() {
					expect(returnedObject).toEqual(null);
				});

			});

	/**
     * <pre>
     * @spec WebSQLDriver.find#3
     * Given an invalid name
     * When a persist is triggered
     * Then a error must be thrown
     * </pre>
     */
	it('should throw an error', function() {
		var name = 'noname';
		var id = 1;
		var cb = null;
		var tx = null;

		expect(function(){ WebSQLDriver.find(tx, name, id); }).toThrow();
	});
	
	var persistData = function(d){
		
		var p = false;
		
		// persist
		runs(function() {
			var txBody = function(tx) {
				WebSQLDriver.persist(tx, bucketName, d);
			};

			var promise = WebSQLDriver.transaction(txBody);

			promise.then(function() {
				p = true;
			});
			
			
			
		});

		waitsFor(function() {
			scope.$apply();
			return p;
		});
		
		return p;
	};
	
	//auxiliar function to create a bucket
	var createBucket = function(){
		
		var crBucket = false;
		
		// create a bucket
		runs(function() {
			// tx to create a bucket
			var txBody = function(tx) {
				WebSQLDriver.createBucket(tx, bucketName, metadata);
			};
			// promise from the create
			var promise = WebSQLDriver.transaction(txBody);

			// sucess of create
			promise.then(function() {
				crBucket = true;
			});
		});

		waitsFor(function() {
			scope.$apply();
			return crBucket;
		});
		
		return crBucket;
	};

});
