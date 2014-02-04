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
            this.remote = 0;
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
    angular.module('tnt.catalog.journal.keeper', ['tnt.catalog.storage.persistent']).service('JournalKeeper', function JournalKeeper($q, $log, JournalEntry, Replayer, WebSQLDriver, PersistentStorage) {

        var sequence = 0;
        
        var storage = new PersistentStorage(WebSQLDriver);
        storage.register('JournalEntry', JournalEntry);
      
        this.compose = function(journalEntry) {
            var deferred = $q.defer();
            
            if(!(journalEntry instanceof JournalEntry)){
                deferred.reject('the given entry is not an instande of JournalEntry');
            } else {
              
                journalEntry.sequence = ++sequence;
              
                storage.persist(journalEntry).then(function(){
                    try{
                        deferred.resolve(Replayer.replay(journalEntry));
                    } catch (e){
                        deferred.reject(e);
                    }
                }, function(error){
                    deferred.reject(error);
                });
            }
            
            return deferred.promise;
        };

        this.read = function(filters) {

            // TODO map the necessary filters!

            if (angular.isObject(filters)) {

            }
        };

        this.remove = function() {

        };

        this.resync = function() {
          
            var deferred = $q.defer();
            var promises = [];
          
            storage.list('JournalEntry').then(function(results){
                $log.debug('Starting replay on ' + results.length + ' entries');
                for(var ix in results){
                    promises.push(Replayer.replay(results[ix]));
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
