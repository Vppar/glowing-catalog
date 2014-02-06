'use strict';

describe('Service: WebSQLDriver.update', function() {

    var bucketName = 'MyBucket';
    var dataCreate = {
        a : 'a',
        b : 'b',
        c : 'c'
    };
    var data1 = {
        b : 'beta',
        c : 'comma1',
        a : 'alpha1'
    };
    var data2 = {
        b : 'beta',
        c : 'comma2',
        a : 'alpha2'
    };

    var metadata = {
        key : 'a',
        metaVersion : 1
    };

    var log = {};

    // load the service's module
    beforeEach(function() {

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

    it('should update a bucket\'s item', function() {
        var id = 'a';

        var createdBucket = false;
        var persisted = false;
        var updated = false;
        var read = false;

        var returnedObject = null;
        var updatedObject = null;

        // create a bucket
        runs(function() {
            // tx to create a bucket
            var txBody = function(tx) {
                WebSQLDriver.dropBucket(tx, bucketName);
                WebSQLDriver.createBucket(tx, bucketName, dataCreate, metadata);
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

        // try to update
        runs(function() {

            var object = {
                    b : 'updatedValue'
            };

            // tx to update
            var txBody = function(tx) {
                WebSQLDriver.update(tx, bucketName, {
                    a : id
                }, object);
            };

            // promise from the update
            var promise = WebSQLDriver.transaction(txBody);

            // success of update
            promise.then(function(result) {
                updated = true;
            });

        });

        waitsFor(function(d) {
            scope.$apply();
            return updated;
        });

        // read!
        runs(function() {

            var promises = {};

            // tx to find
            var txBody = function(tx) {
                promises.find = WebSQLDriver.find(tx, bucketName, id);
            };

            promises.transaction = WebSQLDriver.transaction(txBody);

            promises.transaction.then(function(result) {

                promises.find.then(function(result) {
                    read = true;
                    updatedObject = result;
                });
            });

        });

        waitsFor(function(d) {
            scope.$apply();
            return read;
        });

        runs(function() {
            expect(updatedObject.b).toEqual('updatedValue');
        });

    });

    it('should update more than one bucket\'s item with a partial object', function() {

        var createdBucket = false;
        var persisted = false;
        var updated = false;
        var readed = false;

        var returnedCreated = null;
        var returned1 = null;
        var returned2 = null;

        // create a bucket
        runs(function() {
            // tx to create a bucket
            var txBody = function(tx) {
                WebSQLDriver.dropBucket(tx, bucketName);
                WebSQLDriver.createBucket(tx, bucketName, dataCreate, metadata);
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

            var partial = {
                b : 'updated'
            };

            // tx to update
            var txBody = function(tx) {
                WebSQLDriver.update(tx, bucketName, {
                    b : 'beta'
                }, partial);
            };

            // promise from the update
            var promise = WebSQLDriver.transaction(txBody);

            // success of update
            promise.then(function(result) {
                updated = true;
            });
        });

        waitsFor(function() {
            scope.$apply();
            return updated;
        });

        // read again!
        runs(function() {

            var promises = {};

            // tx to find
            var txBody = function(tx) {
                promises.findCreated = WebSQLDriver.find(tx, bucketName, 'a');
                promises.find1 = WebSQLDriver.find(tx, bucketName, 'alpha1');
                promises.find2 = WebSQLDriver.find(tx, bucketName, 'alpha2');
            };

            promises.transaction = WebSQLDriver.transaction(txBody);

            promises.transaction.then(function(result) {

                promises.findCreated.then(function(result) {
                    returnedCreated = result;
                });

                promises.find1.then(function(result) {
                    returned1 = result;
                });

                promises.find2.then(function(result) {
                    returned2 = result;
                });
                readed = true;
            });

        });

        waitsFor(function(d) {
            scope.$apply();
            return readed;
        });

        runs(function() {
            expect(returnedCreated.b).toEqual('b');
            expect(returned1.b).toEqual('updated');
            expect(returned2.b).toEqual('updated');
        });

    });

    it('should not update if the parameters object is not passed', function() {

        // spy
        log.error = jasmine.createSpy('$log.error');

        var id = 'a';

        var createdBucket = false;
        var listed = false;
        var persisted = false;
        var notupdated = false;

        var returnedObject = null;

        // create a bucket
        runs(function() {
            // tx to create a bucket
            var txBody = function(tx) {
                WebSQLDriver.dropBucket(tx, bucketName);
                WebSQLDriver.createBucket(tx, bucketName, dataCreate, metadata);
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

        // try to update
        runs(function() {

            var object = {
                    b:'updatedValue'
            };

            // tx to update
            var txBody = function(tx) {
                WebSQLDriver.update(tx, bucketName, null, object);
            };

            // promise from the update
            var promise = WebSQLDriver.transaction(txBody);

            // fail of update
            promise.then(null, function(result) {
                notupdated = true;
            });

        });

        waitsFor(function(d) {
            scope.$apply();
            return notupdated;
        });

        runs(function() {
            expect(log.error).toHaveBeenCalledWith('transaction failed');
        });

    });

    it('should not update if the parameters object has an invalid propriety', function() {
        // spy
        log.error = jasmine.createSpy('$log.error');
        var id = 'a';

        var createdBucket = false;
        var persisted = false;
        var notupdated = false;
        
        // create a bucket
        runs(function() {
            // tx to create a bucket
            var txBody = function(tx) {
                WebSQLDriver.dropBucket(tx, bucketName);
                WebSQLDriver.createBucket(tx, bucketName, dataCreate, metadata);
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

        // try to update
        runs(function() {

            var newObject = {
                  a : 'new a',
                  b : 'new b',
                  c : 'new c'
            };

            // tx to update
            var txBody = function(tx) {
                WebSQLDriver.update(tx, bucketName, {
                    notvalidattribute : id
                }, newObject);
            };

            // promise from the update
            var promise = WebSQLDriver.transaction(txBody);

            // erro of update
            promise.then(null,
                    function(result) {
                notupdated = true;
            });

        });

        waitsFor(function(d) {
            scope.$apply();
            return notupdated;
        });

        
        runs(function() {
            expect(log.error).toHaveBeenCalledWith('transaction failed');
        });

       
    });

    it('should not update if the update object have some invalid parameters', function() {
        // spy
        log.error = jasmine.createSpy('$log.error');
        var id = 'a';

        var createdBucket = false;
        var persisted = false;
        var notupdated = false;
        
        // create a bucket
        runs(function() {
            // tx to create a bucket
            var txBody = function(tx) {
                WebSQLDriver.dropBucket(tx, bucketName);
                WebSQLDriver.createBucket(tx, bucketName, dataCreate, metadata);
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

        // try to update
        runs(function() {

            var newObject = {
                  a : 'a',
                  b : 'new b',
                  c : 'new c',
                  notvalidattribute: 'hehehe'
            };

            // tx to update
            var txBody = function(tx) {
                WebSQLDriver.update(tx, bucketName, {
                    a : id
                }, newObject);
            };

            // promise from the update
            var promise = WebSQLDriver.transaction(txBody);

            // error of update
            promise.then(null,
                    function(result) {
                notupdated = true;
            });

        });

        waitsFor(function(d) {
            scope.$apply();
            return notupdated;
        });

        
        runs(function() {
            expect(log.error).toHaveBeenCalledWith('transaction failed');
        });
    });

    it('should not update an inexistent bucket\'s item', function() {

        // spy
        log.error = jasmine.createSpy('$log.error');

        var notupdated = false;
        var id = 'a';

        var newObject = {};

        runs(function() {

            newObject = {
                a : 'a',
                b : 'updatedValue',
                c : 'c'
            };
            // tx to update
            var txBody = function(tx) {
                WebSQLDriver.update(tx, 'notABucketName', {
                    a : id
                }, newObject);
            };

            // promise from the update
            var promise = WebSQLDriver.transaction(txBody);

            // fail of update
            promise.then(null, function(result) {
                notupdated = true;
            });

        });

        waitsFor(function(d) {
            scope.$apply();
            return notupdated;
        });

        runs(function() {
            expect(log.error).toHaveBeenCalledWith('transaction failed');
        });

    });

});
