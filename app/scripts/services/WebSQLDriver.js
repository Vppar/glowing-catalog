(function(angular, openDatabase) {
    'use strict';

    /**
     * This is the main driver for WebSQL
     * 
     * Premises:
     * - All methods must require an existing transaction
     * 
     */
    angular.module('tnt.storage.websql', []).service('WebSQLDriver', ['$q', '$log', '$rootScope', function WebSQLDriver($q, $log, $rootScope) {

        var db = openDatabase('PersistentStorage', '1.0', 'Persistent Storage', 5 * 1024 * 1024);
        var entities = {};
        
        /**
         * <pre>
         * @spec WebSQLDriver.transaction#1
         * Given a valid transaction body
         * When a transaction is triggered
         * Then the transaction must be resolved with success
         * 
         * @spec WebSQLDriver.transaction#2
         * Given an invalid transaction body
         * When a transaction is triggered
         * Then the transaction must be resolved with failure
         * 
         * </pre>
         * 
         * This function resolves a database transaction an return a promise for results
         * 
         * @param transaction body
         * @returns deferred
         */
        this.transaction = function(txBody) {
          
            $log.debug('starting transaction');

            var deferred = $q.defer();
            db.transaction(txBody, function(data){
                deferred.reject(data);
                $rootScope.$apply();
            }, function(data){
                deferred.resolve(data);
                $rootScope.$apply();
            });

            $log.debug('transaction started');

            deferred.promise.then(function() {
                $log.debug('transaction succeded');
            }, function(failure) {
                $log.error('transaction failed');
                $log.debug(failure);
            });
            
            return deferred.promise;
        };

        /**
         * <pre>
         * @spec WebSQLDriver.createBucket#1
         * Given a valid transaction
         * and a valid bucket name
         * and a valid data
         * and a valid metadata
         * When a createBucket is triggered
         * Then the table must be created with proper column data 
         * 
         * @spec WebSQLDriver.createBucket#2
         * Given an invalid metadata
         * When a createBucket is triggered
         * Then a error must be thrown
         * 
         * @spec WebSQLDriver.createBucket#3
         * Given an invalid name
         * When a createBucket is triggered
         * Then a error must be thrown
         * 
         * @spec WebSQLDriver.createBucket#4
         * Given an invalid data
         * When a createBucket is triggered
         * Then a error must be thrown
         * 
         * </pre>
         * 
         * This function creates a new table in database
         * 
         * @param transaction
         * @param bucket name
         * @param data
         * @param metadata
         */
        this.createBucket = function(tx, name, metadata) {
            if (metadata.metaVersion === 1) {

                // FIXME trade Primary Key for Primary Index or ID
                var pk = metadata.key;

                entities[name] = {
                    pk : pk
                };

                var columns = [];

                for ( var ix in metadata.columns) {
                  
                    var columnName = metadata.columns[ix];

                    if (pk && pk === columnName) {
                        columns.push(columnName + ' PRIMARY KEY NOT NULL');
                    } else {
                        columns.push(columnName);
                    }
                }

                columns = '(' + columns.join(', ') + ')';

                var SQL = [];
                SQL.push('CREATE TABLE IF NOT EXISTS');
                SQL.push(name);
                SQL.push(columns);

                SQL = SQL.join(' ');

                tx.executeSql(SQL);

            } else {
                throw 'Metadata version not suported in ' + name;
            }
        };

        /**
         * <pre>
         * @spec WebSQLDriver.dropBucket#1
         * Given a valid transaction
         * and a valid bucket name
         * When a dropBucket is triggered
         * Then the table with the bucket name must be dropped 
         * 
         * </pre>
         * 
         * This function drops a table in database
         * 
         * @param transaction
         * @param bucket name
         */
        this.dropBucket = function(tx, name) {
            var SQL = [];
            SQL.push('DROP TABLE IF EXISTS');
            SQL.push(name);

            SQL = SQL.join(' ');

            tx.executeSql(SQL);
        };

        /**
         * <pre>
         * @spec WebSQLDriver.persist#1
         * Given a valid transaction
         * and a valid bucket name
         * and a valid data with any order of attributes
         * When a persist is triggered
         * Then the data must be inserted into proper table
         * 
         * @spec WebSQLDriver.persist#2
         * Given a valid transaction
         * and a valid bucket name
         * and a valid data with without some property except primary key
         * When a persist is triggered
         * Then the data must be inserted into proper table
         * 
         * @spec WebSQLDriver.persist#3
         * Given valid data with a primary key that already set
         * When a persist is triggered
         * Then the data must not be inserted into the table
         * 
         * @spec WebSQLDriver.persist#4
         * Given an invalid data without a primary key
         * When a persist is triggered
         * Then the data must not be inserted into the table
         * 
         * @spec WebSQLDriver.persist#5
         * Given an invalid data with different properties
         * When a persist is triggered
         * Then the data must not be inserted into the table
         * 
         * </pre>
         * 
         * This function inserts data into a table
         * 
         * @param transaction
         * @param bucket name
         * @param data
         */
        this.persist = function(tx, name, data) {
            var columns = [], values = [], bindings = [];

            for ( var columnName in data) {
                columns.push(columnName);
                values.push('?');
                bindings.push(data[columnName]);
            }

            columns = '(' + columns.join(', ') + ')';
            values = '(' + values.join(', ') + ')';

            var SQL = [];

            SQL.push('INSERT INTO');
            SQL.push(name);
            SQL.push(columns);
            SQL.push('VALUES');
            SQL.push(values);

            SQL = SQL.join(' ');
            tx.executeSql(SQL, bindings);
        };
        
        /**
         * Updates data in the given bucket
         * 
         * @param {Object} transaction
         * @param {String} bucket name
         * @param {Object} where clause parameters
         * @param {Object} data to be updated
         * 
         * TODO make errors to be treated here, not at the websql.
         */
        this.update = function(tx, name, params, data) {
            var updatables = [];
            var bindings = [];
  
            for ( var columnName in data) {
                updatables.push(columnName + ' = ?');
                bindings.push(data[columnName]);
            }
  
            updatables = updatables.join(', ');
  
            var SQL = [];
  
            SQL.push('UPDATE');
            SQL.push(name);
            SQL.push('SET');
            SQL.push(updatables);
            SQL.push('WHERE');
            SQL.push(where(name, params));
  
            SQL = SQL.join(' ');
            tx.executeSql(SQL, bindings);
        };

        /**
         * <pre>
         * @spec WebSQLDriver.find#1
         * Given a valid transaction
         * and a valid bucket name
         * and a valid primary key value
         * When a find is triggered
         * Then the data object must be returned
         * 
         * @spec WebSQLDriver.find#2
         * Given a primary key value that was not set in database
         * When a persist is triggered
         * Then null must be returned
         * 
         * @spec WebSQLDriver.find#3
         * Given an invalid name
         * When a persist is triggered
         * Then a error must be thrown
         * 
         * </pre>
         * 
         * This function find and returns a data in a table row
         * 
         * @param transaction
         * @param bucket name
         * @param value of primery key
         * @param optional callback function
         * @returns {Promise} - If a callback is given, undefined will be returned.
         */
        this.find = function(tx, name, id, cb) {

            if (angular.isUndefined(entities[name].pk)) {
                throw 'Entity ' + name + ' has no primary index!';
            }

            var SQL = [];

            SQL.push('SELECT * FROM');
            SQL.push(name);
            SQL.push('WHERE');
            SQL.push(entities[name].pk);
            SQL.push('=');
            SQL.push(quote(id));

            SQL = SQL.join(' ');

            var deferred = {};

            if (!angular.isFunction(cb)) {
                deferred = $q.defer();
                
                cb = function(tx, results) {
                    if (results.rows.length === 1) {
                        
                        deferred.resolve(angular.copy(results.rows.item(0)));
                        
                        $rootScope.$apply();
                    } else {
                        deferred.reject(null);
                        $rootScope.$apply();
                    }
                };
            } else {
                $log.debug('Callback given, no promise for you');
            }
            
            // FIXME use binded arguments
            tx.executeSql(SQL, [], cb);

            return deferred.promise;
        };

        /**
         * <pre>
         * @spec WebSQLDriver.list#1
         * Given a valid transaction
         * and a valid bucket name
         * When a list is triggered
         * Then a array of all data objects must be returned
         * 
         * @spec WebSQLDriver.list#2
         * Given a valid transaction
         * and a valid bucket name
         * and a valid object with parameters and values
         * When a list is triggered
         * Then a array of data objects filtered by the parameters must be returned
         * 
         * @spec WebSQLDriver.list#3
         * Given an invalid name
         * When a list is triggered
         * Then a error must be thrown
         * 
         * </pre>
         * 
         * This function lists and returns a data array of a table
         * 
         * @param transaction
         * @param bucket name
         * @param optional object with parameters and values
         * @param optional callback function
         * 
         * FIXME this method never rejects?
         */
        this.list = function(tx, name, params, cb) {

            var SQL = [];

            SQL.push('SELECT * FROM');
            SQL.push(name);

            if (angular.isDefined(params)) {
                SQL.push('WHERE');
                SQL.push(where(name, params));
            }

            SQL = SQL.join(' ');

            var deferred = {};

            if (!angular.isFunction(cb)) {

                deferred = $q.defer();

                cb = function(tx, results) {
                    var result = [];

                    var len = results.rows.length, i;
                    for (i = 0; i < len; i++) {
                        
                        result.push(angular.copy(results.rows.item(i)));
                        
                    }

                    deferred.resolve(result);
                    $rootScope.$apply();
                };
            } else {
                $log.debug('Callback given, no promise for you');
            }

            // FIXME use binded arguments
            tx.executeSql(SQL, [], cb);

            return deferred.promise;
        };

        this.merge = function() {
            // not implemented for lack of use
        };

        /**
         * <pre>
         * @spec WebSQLDriver.remove#1
         * Given a valid transaction
         * and a valid bucket name
         * and a valid object with parameters and values
         * When a remove is triggered
         * Then the objects filtered by the parameters must be deleted of database
         * 
         * @spec WebSQLDriver.remove#2
         * Given an invalid name
         * When a remove is triggered
         * Then a error must be thrown
         * 
         * </pre>
         * 
         * This function removes data of a table
         * 
         * @param transaction
         * @param bucket name
         * @param object with parameters and values
         */
        this.remove = function(tx, name, params) {

            var SQL = [];

            SQL.push('DELETE FROM');
            SQL.push(name);
            SQL.push('WHERE');
            SQL.push(where(name, params));

            SQL = SQL.join(' ');

            // FIXME use binded arguments
            tx.executeSql(SQL);

        };

        // TODO - Test for strings, numbers, booleans and nulls. Also add those
        // tests to the persist method
        var quote = function(value) {
            if (angular.isNumber(value) || value === true || value === false || value === null) {
                return value;
            } else {
                return '\'' + value + '\'';
            }
        };

        // TODO - remove name
        var where = function(name, params) {
            var where = [];

            for ( var ix in params) {
                where.push(ix + ' = ' + quote(params[ix]));
            }

            return where.join(' AND ');
        };
    }]);
})(angular, window.openDatabase);
