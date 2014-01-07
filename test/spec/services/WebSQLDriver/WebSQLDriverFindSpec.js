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

	it('should be there', function() {
		expect(!!WebSQLDriver).toBe(true);
	});

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
						WebSQLDriver.createBucket(tx, bucketName, dataCreate,
								metadata);
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
					// tx to list
					var txBody = function(tx) {
						WebSQLDriver.find(tx, bucketName, id).then(
								function(result) {
									returnedObject = result;
								});
					};

					// promise from the create
					var promise = WebSQLDriver.transaction(txBody);

					// sucess of create
					promise.then(function(result) {
						listed = true;
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

//IT CAN\'T HAPPEN?!
/*
	it('shouldn\'t return a object', function() {

				var id = 'a';
				var listed = false;
				var cb = null;
				
				var returnedObject = null;

				createBucket();
				persistData(data1);
				persistData(data2);
				
				// pass a valid name
				runs(function() {
					
					var promise = WebSQLDriver.find(tx, bucketName, id);
					
					promise.then(
							function(result) {
								returnedObject = result;
								console.log(returnedObject);
							},function(error){
								returnedObject = error;
								console.log(returnedObject);
							});
					
					
					
					// tx to list
					var txBody = function(tx) {
						WebSQLDriver.find(tx, bucketName, id).then(
								function(result) {
									returnedObject = result;
									console.log(returnedObject);
								},function(error){
									returnedObject = error;
									console.log(returnedObject);
								});
					};

					// promise from the create
					var promise = WebSQLDriver.transaction(txBody);

					// sucess of create
					promise.then(null,function(result) {
						listed = true;
					});
					
				});

				waitsFor(function(d) {
					scope.$apply();
					return listed;
				});

				runs(function() {
					expect(returnedObject).toEqual(null);
				});

			});
*/
	
	it('should throw an error', function() {
		var name = 'noname';
		var id = 1;
		var cb = null;
		var tx = null;

		expect(function(){ WebSQLDriver.find(tx, name, id); }).toThrow();
	});

	it('shouldn`t return a promisse', function() {
		expect(!!WebSQLDriver).toBe(true);
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
				WebSQLDriver.createBucket(tx, bucketName, dataCreate,metadata);
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
