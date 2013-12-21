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
        metaVersion : 1
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
                WebSQLDriver.createBucket(tx, name, dataCreate, metadata);

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
