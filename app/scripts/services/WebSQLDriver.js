(function(angular, openDatabase) {
    'use strict';

    angular.module('tnt.storage.websql', []).service('WebSQLDriver', function WebSQLDriver($q, $log) {

        var db = openDatabase('PersistentStorage', '1.0', 'Persistent Storage', 5 * 1024 * 1024);
        var entities = {};

        this.transaction = function(txBody) {

            $log.debug("starting transaction");

            var deferred = $q.defer();
            db.transaction(txBody, deferred.reject, deferred.resolve);

            $log.debug("transaction started");

            deferred.promise.then(function() {
                $log.debug("transaction succeded");
            }, function(failure) {
                $log.error("transaction failed");
                $log.debug(failure);
            });

            return deferred.promise;
        };

        this.createBucket = function(tx, name, data, metadata) {
            if (metadata.metaVersion === 1) {

                // FIXME trade Primary Key for Primary Index or ID
                var pk = metadata.pk;

                entities[name] = {
                    pk : pk
                };

                var columns = [];

                for ( var columnName in data) {

                    if (pk && pk === columnName) {
                        columns.push(columnName + ' PRIMARY KEY');
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

        this.dropBucket = function(tx, name) {
            var SQL = [];
            SQL.push('DROP TABLE IF EXISTS');
            SQL.push(name);

            SQL = SQL.join(' ');

            tx.executeSql(SQL);
        };

        this.persist = function(tx, name, data) {
            var columns = [], values = [];

            for ( var columnName in data) {
                columns.push(columnName);
                values.push(quote(data[columnName]));
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

            tx.executeSql(SQL);
        };

        this.find = function(tx, name, id, cb) {

            if (angular.isUndefined(entities[name].pk)) {
                throw "Entity " + name + " has no primary index!";
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
                        deferred.resolve(results.rows.item(0));
                    } else {
                        deferred.reject(null);
                    }
                };
            } else {
                $log.debug("Callback given, no promise for you");
            }
            
            // FIXME use binded arguments
            tx.executeSql(SQL, [], cb);

            return deferred.promise;
        };

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
                        result.push(results.rows.item(i));
                    }

                    deferred.resolve(result);
                };
            } else {
                $log.debug("Callback given, no promise for you");
            }

            // FIXME use binded arguments
            tx.executeSql(SQL, [], cb);

            return deferred.promise;
        };

        this.merge = function(tx, name, data) {
            // not implemented for lack of use
        };

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

        var quote = function(value) {
            if (angular.isNumber(value)) {
                return value;
            } else {
                return '\'' + value + '\'';
            }
        };

        var where = function(name, params) {
            var where = [];

            for ( var ix in params) {
                where.push(ix + ' = ' + quote(params[ix]));
            }

            return where.join(' AND ');
        };
    });
})(angular, window.openDatabase);
