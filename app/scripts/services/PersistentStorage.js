(function(angular, ObjectUtils) {
    'use strict';

    angular.module('tnt.catalog.storage.persistent', ['tnt.storage.websql'])
    .config(function($provide) {
                $provide.decorator('$q', function($delegate) {
                    $delegate.reject = function(reason){
                        var deferred = $delegate.defer();
                        deferred.reject(reason);
                        return deferred.promise;
                    };
                    return $delegate;
                });
        }).factory('PersistentStorage', function PersistentStorage($log, $q) {

        var service = function(driver) {
            var entities = {};
            var dbDriver = driver;

            var initialized = [];

            this.errorCb = function() {
                console.log(arguments);
            };

            /**
             * <pre>
             * @spec PersistentStorageFactory.register#1
             * Given a new Entity
             * When a register is triggered
             * Then the entity must be registered
             * 
             * @spec PersistentStorageFactory.register#2
             * Given an already registered Entity
             * When a register is triggered
             * Then an exception must be thrown
             * 
             * </pre>
             * 
             * Register the entity with the Persistent storage
             * 
             * @param String - the name of the entity being registered
             * @param Function - the constructor for the entity being registered
             */
            this.register = function(name, constructor) {
              
                var deferred = $q.defer();
                var metadata = constructor.prototype.metadata();
              
                if (angular.isDefined(entities[name])) {
                    var message = "Overwriting an already registered entity: " + name + '(Database wont be udated)';
                    $log.warn(message);
                    deferred.resolve(message);
                } else {
                    deferred.resolve(dbDriver.transaction(function(tx) {
                        dbDriver.createBucket(tx, name, metadata);
                    }));
                }
                entities[name] = constructor;

                deferred.promise.then(null, function (err) {
                    $log.error('Failed to register entity!', name, err);
                });
                
                return deferred.promise;
            };

            /**
             * Persist the entity
             * 
             * @param Object - the entity to be persisted
             * @param Object - [optional] the transaction handle
             */
            this.persist = function persist(entity, tx) {
                // FIXME - Implement the use of a given transaction as well as creating a new one when needed 

                var name = null;
                var data = extract(entity);

                var deferred = $q.defer();
                try {
                    name = getType(entity);
                } catch (e){
                    deferred.reject(e);
                }
                
                var data = extract(entity);

                if (angular.isUndefined(tx)) {
                    dbDriver.transaction(function(tx) {
                        deferred.resolve(dbDriver.persist(tx, name, data));
                    })['catch'](function(error){
                        deferred.reject(error);
                    });
                } else {
                    deferred.resolve(dbDriver.persist(tx, name, data));
                }

                return deferred.promise;
            };
            
            /**
             * Updates the given entity by primary key
             * 
             * @param {Object} The entity to be updated
             * @returns {Promise} The promise of better days
             * 
             * TODO Test Me kira!
             */
            this.update = function(entity, tx) {

                var deferred = $q.defer();
                
                var name = getType(entity);
                var data = extract(entity);
                var metadata = entity.metadata();
                
                var key = {};
                key[metadata.key] = data[metadata.key];
                delete data[metadata.key];
                
                if (angular.isUndefined(tx)) {
                    dbDriver.transaction(function(tx) {
                        deferred.resolve(dbDriver.update(tx, name, key, data));
                    })['catch'](function(error){
                        deferred.reject(error);
                    });
                } else {
                    deferred.resolve(dbDriver.update(tx, name, key, data));
                }
                
                return deferred.promise;
            };

            /**
             * Find an entity
             * 
             * @param Object - the name of the entity
             * @param Object - the value for the primary key
             * @param Object - [optional] the transaction handle
             * @param Function - [optional] the success callback function
             * @returns {Promise} - If a callback is given, undefined will be returned.
             */
            this.find = function(name, id, tx, cb) {
                
                var deferred = $q.defer();
                
                if (angular.isUndefined(tx)) {
                    dbDriver.transaction(function(tx) {
                        dbDriver.find(tx, name, id, cb).then(function(entity){
                            deferred.resolve(inject(entity, name));
                        }, function(error){
                            deferred.reject(error);
                        });
                    })['catch'](function(error){
                        deferred.reject(error);
                    });
                } else {
                    deferred.resolve(dbDriver.find(tx, name, id, cb));
                }
                
                return deferred.promise;
            };

            /**
             * List entities from a given type
             * 
             * @param Object - the name of the entity
             * @param Object - the parameters to include in the search
             * @param Object - [optional] the transaction handle
             * @param Function - [optional] the success callback function
             * @returns {Promise} - If a callback is given, undefined will be returned.
             */
            this.list = function(name, params, tx, cb) {
                var deferred = $q.defer();

                if (angular.isUndefined(tx)) {
                    dbDriver.transaction(function(tx) {
                        dbDriver.list(tx, name, params, cb).then(function(entities){
                            var list = [];
                            
                            for (var ix in entities ){
                                list.push(inject(entities[ix], name));
                            }
                          
                            deferred.resolve(list);
                        }, function(error){
                            deferred.reject(error);
                        });
                    })['catch'](function(error){
                        deferred.reject(error);
                    });
                } else {
                    deferred.resolve(dbDriver.list(tx, name, params, cb));
                }

                return deferred.promise;
            };

            /**
             * remove the entity
             * 
             * @param {Object} - the entity to be removed
             * @param Object - [optional] the transaction handle
             */
            this.remove = function(entity, tx) {
              
                var deferred = $q.defer();
              
                var data = extract(entity);
                var name = getType(entity);
                var metadata = entity.metadata();
                
                var key = {};
                key[metadata.key] = data[metadata.key];
              
                if (angular.isUndefined(tx)) {
                    dbDriver.transaction(function(tx) {
                        deferred.resolve(dbDriver.remove(tx, name, key));
                    })['catch'](function(error){
                        deferred.reject(error);
                    });
                } else {
                    deferred.resolve(dbDriver.remove(tx, name, key));
                }
                
                return deferred.promise;
            };
            
            /**
             * Removes all the entries of the given type from the database
             * 
             * @param String - The name of the entity to be removed
             */
            this.nuke = function(name){
                return dbDriver.transaction(function(tx) {
                    dbDriver.dropBucket(tx, name);
                    dbDriver.createBucket(tx, name, entities[name].prototype.metadata());
                });
            };
            // TODO - Remove this line on 0.9.10 version
            var nuke = this.nuke; 

            /**
             * Returns the constructor function friendly name
             */
            var getType = function(entity) {
                for ( var name in entities) {
                    if (entity instanceof entities[name]) {
                        return name;
                    }
                }
                throw 'Unknown entity!';
            };

            /**
             * Returns the data from the entity
             */
            var extract = function(entity) {

                var data = {};
                
                var serializable = entity.metadata().serializable;

                for ( var propertyName in entity) {
                    if (angular.isFunction(entity[propertyName])) {
                        continue;
                    }
                    
                    if(serializable.indexOf(propertyName) !== -1){
                        data[propertyName] = JSON.stringify(entity[propertyName]);
                    } else {
                        data[propertyName] = entity[propertyName];
                    }
                }

                return data;
            };
            
            var inject = function(data, name){
              
                if(angular.isUndefined(entities[name])){
                    $log.debug('Unknown entity ', name);
                    throw 'Unknown entity ' + name;
                }
              
              
                var entity = new entities[name](data);
                var serializable = entity.metadata().serializable;
                
                
                // TODO - handle read only properties
                for ( var propertyName in entity) {
                    if(serializable.indexOf(propertyName) !== -1){
                        if (entity[propertyName] === '[object Object]') {
                            $log.fatal('PersistentStorage.inject: Trying unserialize ancient data.');
                            nuke('JournalEntry').then(function(){
                                location.reload(true);
                            });
                        } else {
                            entity[propertyName] = JSON.parse(entity[propertyName]);
                        }
                    }
                }
                
                return entity;
            };
        };

        return service;

    });

})(angular, window.ObjectUtils);
