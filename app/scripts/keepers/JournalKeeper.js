(function(angular, ObjectUtils) {
    'use strict';

    /**
     * TODO create the test specs
     * 
     * The elementary journal entry. All journal entries must be created through
     * this factory.
     */
    angular.module('tnt.catalog.journal.entity', []).factory('JournalEntry', function JournalEntry() {

        var metadata = {
            // metadata version
            metaVersion : 1,
            // name of the pk column
            key : 'sequence',
            // indexed columns
            ix : [],
            // colums that must be serialized/unserialized
            serializable: ['event'],
            // valid properties for this object
            columns: [ 'sequence', 'stamp', 'type', 'version', 'event', 'synced' ]
        };

        var service = function svc(sequence, stamp, type, version, event) {
          
            ObjectUtils.method(svc, 'isValid', function() {
                for ( var ix in this) {
                    var prop = this[ix];
    
                    if (!angular.isFunction(prop)) {
                        if (metadata.columns.indexOf(ix) === -1) {
                            throw "Unexpected property " + ix;
                        }
                    }
                }
            });
          
            if (arguments.length != svc.length) {
                if (arguments.length === 1 && angular.isObject(arguments[0])) {
                    svc.prototype.isValid.apply(arguments[0]);
                    ObjectUtils.dataCopy(this, arguments[0]);
                } else {
                    throw 'JournalEntry must be initialized with sequence, stamp, type, version and event';
                }
            } else {
                this.sequence = sequence;
                this.stamp = stamp;
                this.type = type;
                this.version = version;
                this.event = event;
                this.synced = 0;
            }
        };

        ObjectUtils.method(service, 'metadata', function() {
            return angular.copy(metadata);
        });

        return service;
    });

    /**
     * Journal Keeper
     * 
     * The CRUD for journal keeping operations
     */
    angular.module('tnt.catalog.journal.keeper', ['tnt.catalog.storage.persistent', 'tnt.util.log']).service('JournalKeeper', function JournalKeeper($q, $log, JournalEntry, Replayer, WebSQLDriver, PersistentStorage) {

        var sequence = 0;
        var syncedSequence = 0;
        var entityName = 'JournalEntry';
        
        var storage = new PersistentStorage(WebSQLDriver);
        var registered = storage.register(entityName, JournalEntry);
      

        /**
         * Returns sequence number.
         * @return {Number}
         */
        this.getSequence = function () {
          return sequence;
        };

        /**
         * Returns the sequence of the last synced entry.
         * @return {Number}
         */
        // FIXME: From my understanding, it is NOT the JournalKeeper's
        // responsibility to keep track of the syncedSequence number.
        // This would probably be better if kept in SyncService, but
        // it's implementation is not that trivial since it depends
        // from JournalKeeper.resync() for keeping track of it on
        // startup. Maybe .resync() should be moved over to
        // SyncService?
        this.getSyncedSequence = function () {
          return syncedSequence;
        };

        /**
         * Persist and replay a journal entry
         */
        this.compose = function(journalEntry) {
            return persistEntry(journalEntry, incrementSequence);
        };

        this.insert = function (journalEntry) {
            if (journalEntry.sequence > syncedSequence) {
              syncedSequence = journalEntry.sequence;
            }
            return persistEntry(journalEntry, updateSequence);
        };



        /**
         * Gets all synced entries from the local database.
         * @returns {Promise}
         */
        // FIXME Implement tests
        //
        // FIXME Need to re-implement this method once WebSQLDriver's querying
        // capabilities are improved.
        this.readSynced = function () {
            return registered.then(function () {
                var deferred = $q.defer();

                var promise = storage.list(entityName);
                promise.then(function (entries) {
                    var synced = [];
                    for (var idx in entries) {
                        var entry = entries[idx];
                        entry.synced && synced.push(entry);
                    }
                    deferred.resolve(synced);
                }, function (err) {
                    $log.debug('Failed to read unsynced:', err);
                    deferred.reject(err);
                });

                return deferred.promise;
            });
        };

        /**
         * Returns all unsynced entries in the database
         * 
         * @returns {Promise}
         */
        this.readUnsynced = function() {
            return registered.then(function () {
                var promise = storage.list(entityName, {synced: 0});

                promise.then(null, function (err) {
                    $log.debug('Failed to read unsynced:', err);
                });

                return promise;
            });
        };


        /**
         * Searches and returns the entry with the given id in the journal.
         * @param {String} uuid Wanted entry's id.
         * @return {Promise}
         */
        // TODO write tests
        this.findEntry = function (uuid) {
            return registered.then(function () {
                var deferred = $q.defer();

                storage.list(entityName, {uuid : uuid}).then(function (entries) {
                    deferred.resolve(entries[0] || null);
                }, function (err) {
                    $log.debug('Failed to find entry for the uuid', uuid);
                    deferred.reject(err);
                });
            });
        };
        

        // FIXME: need to test this!
        this.readOldestUnsynced = function () {
          var deferred = $q.defer();

          var promise = this.readUnsynced();
          promise.then(function (result) {
              if (!result || !result.length) {
                  // There are no unsynced entries
                  deferred.resolve(null);
              } else if (result && result.length) {
                  deferred.resolve(result[0]);
              } else {
                  deferred.reject('Got an unexpected result from JournalKeeper.readUnsynced()!');
              }
          }, function (err) {
              deferred.reject('Failed to get unsynced entries!');
          });

          return deferred.promise;
        };


        /**
         * Marks a given entry as synced
         * 
         * @param {Object} entry The entry to be updated
         * @return {Promise} The transaction promise
         */
        this.markAsSynced = function(entry) {
            return registered.then(function () {
                entry.synced = new Date().getTime();

                var promise = storage.update(entry);

                promise.then(null, function (err) {
                    // FIXME: should we revert entry.synced back to false in case
                    // of failures in the update?
                    $log.error('Failed to update journal entry', err);
                });

                return promise;
            });
        };

        /**
         * Remove the given entry
         * 
         * @param {Object} entry The entry to be updated
         * @return {Promise} The transaction promise
         * 
         */
        this.remove = function(entry) {
            return registered.then(function () {
                var promise = storage.remove(entry);

                promise.then(null, function (err) {
                    $log.error('Failed to remove journal entry', err);
                });

                return promise;
            });
        };
        

        /**
         * Nukes the local storage - Use with extreme caution
         * 
         * Use cases:
         *  - Unable to resync the database;
         *  - The database has been compromised.
         *  
         * @return {Promise} The transaction promise
         */
        this.nuke = function(){
            return registered.then(function () {
                var promise = storage.nuke(entityName);

                promise.then(null, function (err) {
                    $log.fatal('Failed to nuke journal entries: PersistentStorage.nuke failed');
                    $log.debug('Failed to nuke: PersistentStorage.nuke failed', err);
                });

                return promise;
            });
        };

        /**
         * Resyncs the local in-memory data on the keepers based on the persisted
         */
        this.resync = function() {
            return registered.then(function () {
                var deferred = $q.defer();
                var promises = [];
              
                storage.list(entityName).then(function(results){
                    $log.debug('Starting replay on ' + results.length + ' entries');

                    var entry = null;
                    
                    try {
                        for(var ix in results){
                          
                            entry = results[ix];
                            
                            sequence = sequence > entry.sequence ? sequence : entry.sequence;
                            
                            if (entry.synced && entry.sequence > syncedSequence) {
                                syncedSequence = entry.sequence;
                            }
                            
                            promises.push(Replayer.replay(entry));
                        }
                    } catch (err) {
                        $log.error('Failed to resync: replay failed');
                        $log.debug('Failed to resync: replay failed -', err, entry);
                        deferred.reject(err);
                    }

                    $log.debug('waiting for ' + promises.length + ' promises to resolve');
                    deferred.resolve($q.all(promises));
                },function(error){
                    $log.error('Failed to resync: list failed');
                    $log.debug('Failed to resync: list failed', error);
                    deferred.reject(error);
                });
                
                return deferred.promise;
            });
        };





        function updateSequence(entry) {
            var val = entry.sequence;
            sequence = angular.isDefined(val) && (sequence > val) ? sequence : val;
        }

        function incrementSequence(entry) {
            entry.sequence = ++sequence;
        }

        function persistEntry (entry, updateSequence) {
            return registered.then(function () {
                var deferred = $q.defer();

                if(!(entry instanceof JournalEntry)) {
                  deferred.reject('the given entry is not an instance of JournalEntry');
                } else {
                  updateSequence(entry);
                  
                  // FIXME: what happens if we persisted the entry and the replay
                  // fails? Should we remove the entry?
                  storage.persist(entry).then(function(){
                      try {
                          deferred.resolve(Replayer.replay(entry));
                      } catch (e){
                          $log.fatal('Failed to replay: Replayer.replay failed');
                          $log.debug('Failed to replay', e, entry);
                          deferred.reject(e);
                      }
                  }, function(error){
                    $log.error('Failed to compose: PersistentStorage.persist failed', error);
                    deferred.reject(error);
                  });
                }

                return deferred.promise;
            });
        };

    });

    angular.module('tnt.catalog.journal', [
        'tnt.catalog.journal.entity', 'tnt.catalog.journal.keeper'
    ]);
})(angular, window.ObjectUtils);
