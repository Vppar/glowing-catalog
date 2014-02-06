'use strict';

describe('Service: WebSQLDriver.persist', function() {

    var name = 'MyBucket';
    var dataCreate = {
        a : 'a',
        b : 'b',
        c : 'c'
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
     * @spec WebSQLDriver.persist#1
     * Given a valid transaction
     * and a valid bucket name
     * and a valid data with anyorder of attributes
     * When a persist is triggered
     * Then the data must be inserted into proper table
     * </pre>
     */
    it('should persist right at bucket with anyorder of attributes', function() {

        var createdBucket = false;
        var persisted = false;

        var data = {
            b : 'beta',
            c : 'comma',
            a : 'alpha'
        };

        // create a bucket
        runs(function() {
            // tx to create a bucket
            var txBody = function(tx) {
                WebSQLDriver.createBucket(tx, name, metadata);
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
                WebSQLDriver.persist(tx, name, data);
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
    });

    /**
     * <pre>
     * @spec WebSQLDriver.persist#2
     * Given valid data with a primary key that already set
     * When a persist is triggered
     * Then the data must not be inserted into the table
     * </pre>
     */
    it('shouldn\'t persist if the key already exists at the bucket', function() {
        var createdBucket = false;
        var persistedFirst = false;
        var notPersistedSecond = false;

        var data1 = {
            a : 'alpha',
            b : 'beta',
            c : 'comma'
        };

        var data2 = {
            a : 'alpha',
            b : 'buzz',
            c : 'cola'
        };

        // create a bucket
        runs(function() {
            // tx to create a bucket
            var txBody = function(tx) {
                WebSQLDriver.dropBucket(tx, name);
                WebSQLDriver.createBucket(tx, name, metadata);

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
                WebSQLDriver.persist(tx, name, data1);
            };

            var promise = WebSQLDriver.transaction(txBody);

            promise.then(function() {
                persistedFirst = true;
            });

        });

        waitsFor(function() {
            scope.$apply();
            return persistedFirst;
        });

        // persist
        runs(function() {
            var txBody = function(tx) {
                WebSQLDriver.persist(tx, name, data2);
            };

            var promise = WebSQLDriver.transaction(txBody);

            promise.then(undefined, function() {
                notPersistedSecond = true;
            });

        });

        waitsFor(function() {
            scope.$apply();
            return notPersistedSecond;
        });

        runs(function() {
            expect(notPersistedSecond).toEqual(true);
        });

    });

    /**
     * <pre>
     * @spec WebSQLDriver.persist#3
     * Given valid data without a primary key
     * When a persist is triggered
     * Then the data must not be inserted into the table
     * </pre>
     */
    it('shouldn\'t persist at bucket without a key', function() {

        var createdBucket = false;
        var notpersisted = false;

        var data = {
            b : 'beta',
            c : 'comma'
        };

        // create a bucket
        runs(function() {
            // tx to create a bucket
            var txBody = function(tx) {
                WebSQLDriver.dropBucket(tx, name);

                WebSQLDriver.createBucket(tx, name, metadata);

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
                WebSQLDriver.persist(tx, name, data);
            };

            var promise = WebSQLDriver.transaction(txBody);

            promise.then(undefined, function() {
                notpersisted = true;
            });

        });

        waitsFor(function() {
            scope.$apply();
            return notpersisted;
        });

        runs(function() {
            expect(notpersisted).toEqual(true);

        });
    });

    /**
     * <pre>
     * @spec WebSQLDriver.persist#1
     * Given a valid transaction
     * and a valid bucket name
     * and a valid data with anyorder of attributes
     * When a persist is triggered
     * Then the data must be inserted into proper table
     * </pre>
     */
    it('should persist at bucket with a key', function() {

        var createdBucket = false;
        var persisted = false;

        var data = {
            a : 'alpha',
            b : 'beta',
            c : 'comma'
        };

        // create a bucket
        runs(function() {
            // tx to create a bucket
            var txBody = function(tx) {
                WebSQLDriver.createBucket(tx, name, metadata);
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
                WebSQLDriver.persist(tx, name, data);
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

    });
    
    /**
     * <pre>
     * @spec WebSQLDriver.persist#2
     * Given a valid transaction
     * and a valid bucket name
     * and a valid data with without some property except primary key
     * When a persist is triggered
     * Then the data must be inserted into proper table
     * </pre>
     */
    it('should persist if the number of columns does not fits the bucket attributes', function() {
        var createdBucket = false;
        var persisted = false;

        var data = {
            a : 'alpha',
            c : 'comma'
        };

        // create a bucket
        runs(function() {
            // tx to create a bucket
            var txBody = function(tx) {
                WebSQLDriver.dropBucket(tx, name);
                WebSQLDriver.createBucket(tx, name, metadata);

            };
            // promise from the create
            var promise = WebSQLDriver.transaction(txBody);

            // success of create
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
                WebSQLDriver.persist(tx, name, data);
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
    });

    /**
     * <pre>
     * Given an invalid data with different properties
     * When a persist is triggered
     * Then the data must not be inserted into the table
     * </pre>
     */
    it('shouldn\'t persist if the columns\'s labels are different from the bucket\'s', function() {
        var createdBucket = false;
        var notpersisted = false;

        var data = {
            a : 'alpha',
            cs : 'comma'
        };

        // create a bucket
        runs(function() {
            // tx to create a bucket
            var txBody = function(tx) {
                WebSQLDriver.dropBucket(tx, name);
                WebSQLDriver.createBucket(tx, name, metadata);

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
                WebSQLDriver.persist(tx, name, data);
            };

            var promise = WebSQLDriver.transaction(txBody);

            promise.then(undefined, function() {
                notpersisted = true;
            });

        });

        waitsFor(function() {
            scope.$apply();
            return notpersisted;
        });

        runs(function() {
            expect(notpersisted).toEqual(true);

        });
    });

});
