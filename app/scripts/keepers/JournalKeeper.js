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
        };

        var service = function svc(sequence, stamp, type, version, event) {

            if (arguments.length != svc.length) {
                throw 'JournalEntry must be initialized with sequence, stamp, type, version and event';
            }

            this.sequence = sequence;
            this.stamp = stamp;
            this.type = type;
            this.version = version;
            this.event = event;
            this.synced = false;
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
        var entityName = 'JournalEntry';
        
        var storage = new PersistentStorage(WebSQLDriver);
        storage.register(entityName, JournalEntry);
      
        /**
         * Persist and replay a journal entry
         */
        this.compose = function(journalEntry) {
            var deferred = $q.defer();
            
            if(!(journalEntry instanceof JournalEntry)){
                deferred.reject('the given entry is not an instance of JournalEntry');
            } else {
              
                journalEntry.sequence = ++sequence;
              
                // FIXME: what happens if we persisted the entry and the replay
                // fails? Should we remove the entry?
                storage.persist(journalEntry).then(function(){
                    try {
                        deferred.resolve(Replayer.replay(journalEntry));
                    } catch (e){
                        $log.fatal('Failed to replay: Replayer.replay failed');
                        deferred.reject(e);
                    }
                }, function(error){
                    $log.error('Failed to compose: PersistentStorage.persist failed');
                    deferred.reject(error);
                });
            }
            
            return deferred.promise;
        };

        /**
         * Returns all unsynced entries in the database
         * 
         * @returns {Promise}
         * 
         * TODO Test Me!
         */
        this.readUnsynced = function() {
            return storage.list(entityName, {synced: false});
        };
        
        /**
         * Marks a given entity as synced
         * 
         * @param {Object} entity The entity to be updated
         * @return {Promise} The transaction promise
         * 
         * TODO Test Me!
         */
        this.markAsSynced = function(entity) {
            entity.synced = true;
            return storage.update(entity);
        };

        /**
         * Remove the given entry
         * 
         * @param {Object} entity The entity to be updated
         * @return {Promise} The transaction promise
         * 
         * TODO Test Me!
         */
        this.remove = function(entity) {
            return storage.remove(entity);
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
            var promise = storage.nuke(entityName);

            promise.then(null, function (err) {
                $log.fatal('Failed to nuke journal entries: PersistentStorage.nuke failed');
                $log.debug('Failed to nuke: PersistentStorage.nuke failed', err);
            });

            return promise;
        };

        /**
         * Resyncs the local in-memory data on the keepers based on the persisted
         */
        this.resync = function() {
          
            var deferred = $q.defer();
            var promises = [];
          
            storage.list(entityName).then(function(results){
                $log.debug('Starting replay on ' + results.length + ' entries');

                try {
                    for(var ix in results){
                        promises.push(Replayer.replay(results[ix]));
                    }
                } catch (err) {
                    $log.error('Failed to resync: replay failed');
                    deferred.reject(err);
                }

                $log.debug('waiting for ' + promises.length + ' promises to resolve');
                deferred.resolve($q.all(promises));
            },function(error){
                $log.error('Failed to resync: list failed');
                $log.debug('Failed to resync: list failed ', error);
                deferred.reject(error);
            });
            
            return deferred.promise;
        };
    });

    angular.module('tnt.catalog.journal', [
        'tnt.catalog.journal.entity', 'tnt.catalog.journal.keeper'
    ]);
})(angular, window.ObjectUtils);
