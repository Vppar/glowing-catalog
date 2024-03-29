(function(angular, ObjectUtils) {
    'use strict';

    /**
     * TODO create the test specs
     *
     * The elementary journal entry. All journal entries must be created through
     * this factory.
     */
    angular
        .module ('tnt.catalog.journal.entity', [
            'tnt.identity'
        ])
        .factory (
            'JournalEntry',
            ['IdentityService', function JournalEntry(IdentityService) {

                var identityType = 7;
                var currentCounter = 0;

                function getNextId( ) {
                    return ++currentCounter;
                }

                var metadata = {
                    // metadata version
                    metaVersion : 1,
                    // name of the pk column
                    key : 'sequence',
                    // indexed columns
                    ix : [],
                    // colums that must be serialized/unserialized
                    serializable : [
                        'event'
                    ],
                    // valid properties for this object
                    columns : [
                        'sequence', 'stamp', 'type', 'version', 'event', 'synced', 'uuid'
                    ]
                };

                var service =
                    function svc(sequence, stamp, type, version, event) {

                        ObjectUtils.method (svc, 'isValid', function( ) {
                            for ( var ix in this) {
                                var prop = this[ix];

                                if (!angular.isFunction (prop)) {
                                    if (metadata.columns.indexOf (ix) === -1) {
                                        throw 'Unexpected property ' + ix;
                                    }
                                }
                            }
                        });

                        if (arguments.length !== svc.length) {
                            if (arguments.length === 1 && angular.isObject (arguments[0])) {
                                svc.prototype.isValid.apply (arguments[0]);
                                ObjectUtils.dataCopy (this, arguments[0]);
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
                            this.uuid = null;
                        }

                        if (!this.uuid) {
                            this.uuid = IdentityService.getUUID (identityType, getNextId ());
                        }
                    };

                ObjectUtils.method (service, 'metadata', function( ) {
                    return angular.copy (metadata);
                });

                return service;
            }]);

    /**
     * Journal Keeper
     *
     * The CRUD for journal keeping operations
     */
    angular
        .module ('tnt.catalog.journal.keeper', [
            'tnt.catalog.storage.persistent', 'tnt.util.log'
        ])
        .service (
            'JournalKeeper',
            ['$q', 'logger', '$rootScope', '$timeout', 'JournalEntry', 'Replayer', 'WebSQLDriver',
             'PersistentStorage', function JournalKeeper($q, logger, $rootScope, $timeout, JournalEntry, Replayer, WebSQLDriver,
                PersistentStorage) {

                var $log = logger.getLogger('tnt.catalog.journal.keeper.JournalKeeper');

                var self = this;
                var sequence = 1;
                var syncedSequence = 0;
                var entityName = 'JournalEntry';

                var storage = new PersistentStorage (WebSQLDriver);
                var registered = storage.register (entityName, JournalEntry);

                var warmup = {};
                warmup.listener = null;
                warmup.midway = null;

                warmup.listener = $rootScope.$on('LocalWarmupDataSet', function () {
                    self.resync();
                });


                registered.then(function(){
                    $log.debug('Entity ' + entityName + ' registered');
                }, function(){
                    $log.error('Entity ' + entityName + ' failed to register');
                });

                /**
                 * Returns sequence number.
                 *
                 * @return {Number}
                 */
                this.getSequence = function( ) {
                    return sequence;
                };

                function setSequence(val) {
                    sequence = val;
                    $rootScope.$broadcast ('JournalKeeper.setSequence', val);
                }

                this.setSequence = setSequence;

                function setSyncedSequence(val) {
                    syncedSequence = val;
                    $rootScope.$broadcast ('JournalKeeper.setSyncedSequence', val);
                }

                /**
                 * Returns the sequence of the last synced entry.
                 *
                 * @return {Number}
                 */
                // FIXME: From my understanding, it is NOT the JournalKeeper's
                // responsibility to keep track of the syncedSequence number.
                // This would probably be better if kept in SyncService, but
                // it's implementation is not that trivial since it depends
                // from JournalKeeper.resync() for keeping track of it on
                // startup. Maybe .resync() should be moved over to
                // SyncService?
                this.getSyncedSequence = function( ) {
                    return syncedSequence;
                };

                /**
                 * Persist and replay a journal entry
                 */
                this.compose = function(journalEntry) {
                    var promise = persistEntry (journalEntry);

                    promise.then (function( ) {
                        $rootScope.$broadcast ('JournalKeeper.compose', journalEntry);
                    });

                    return promise;
                };

                this.insert = function(journalEntry, tx, transacted) {
                    $log.debug ('Inserting entry:', journalEntry);

                    if (journalEntry.sequence > syncedSequence) {
                        syncedSequence = journalEntry.sequence;
                    }

                    var promise = persistEntry (journalEntry, tx, transacted);

                    promise.then (function( ) {
                        $rootScope.$broadcast ('JournalKeeper.insert', journalEntry);
                    });

                    return promise;
                };

                this.bulkInsert = function(entries){
                    var all = [];
                    var len, i, e;
                    var self = this;

                    var deferred = $q.defer();

                    WebSQLDriver.transaction(function(tx) {
                        try{
                            for (i = 0, len = entries.length; i < len; i += 1) {
                                e = entries[i];
                                if (!e) { continue; }
                                all.push(self.insert(e, tx, true));
                            }
                        } catch(e){
                            deferred.reject(e);
                        }
                    }).then(function () {
                        $log.info('all.length', all.length);
                        deferred.resolve($q.all(all));
                    }, function(error){
                        deferred.reject(error);
                    });
                    return deferred.promise;
                };

                /**
                 * Gets all synced entries from the local database.
                 *
                 * @returns {Promise}
                 */
                // FIXME Implement tests
                //
                // FIXME Need to re-implement this method once WebSQLDriver's
                // querying
                // capabilities are improved.
                this.readSynced = function( ) {
                    return registered.then (function( ) {
                        var deferred = $q.defer ();

                        var promise = storage.list (entityName);
                        promise.then (function(entries) {
                            var synced = [];
                            for ( var idx in entries) {
                                var entry = entries[idx];
                                if (entry.synced) {
                                    synced.push (entry);
                                }
                            }
                            deferred.resolve (synced);
                        }, function(err) {
                            $log.debug ('Failed to read unsynced:', err);
                            deferred.reject (err);
                        });

                        return deferred.promise;
                    });
                };

                /**
                 * Returns all unsynced entries in the database
                 *
                 * @returns {Promise}
                 */
                this.readUnsynced = function( ) {
                    return registered.then (function( ) {
                        var promise = storage.list (entityName, {
                            synced : 0
                        });

                        promise.then (null, function(err) {
                            $log.debug ('Failed to read unsynced:', err);
                        });

                        return promise;
                    });
                };

                /**
                 * Searches and returns the entry with the given id in the
                 * journal.
                 *
                 * @param {String} uuid Wanted entry's id.
                 * @return {Promise}
                 */
                // TODO write tests
                this.findEntry = function(sequence) {
                    return registered.then (function( ) {
                        var deferred = $q.defer ();

                        storage.list (entityName, {
                            sequence : sequence
                        }).then (function(entries) {
                            deferred.resolve (entries[0] || null);
                        }, function(err) {
                            $log.debug ('Failed to find entry for the sequence', sequence);
                            deferred.reject (err);
                        });

                        return deferred.promise;
                    });
                };

                // FIXME: need to test this!
                this.readOldestUnsynced =
                    function( ) {
                        var deferred = $q.defer ();

                        var promise = this.readUnsynced ();
                        promise
                            .then (
                                function(result) {
                                    if (!result || !result.length) {
                                        // There are no unsynced entries
                                        deferred.resolve (null);
                                    } else if (result && result.length) {
                                        deferred.resolve (result[0]);
                                    } else {
                                        deferred
                                            .reject ('Got an unexpected result from JournalKeeper.readUnsynced()!');
                                    }
                                },
                                function( ) {
                                    deferred.reject ('Failed to get unsynced entries!');
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
                    return registered.then (function( ) {
                        if (!entry.synced) {
                            entry.synced = new Date ().getTime ();
                        }

                        var promise = storage.update (entry);

                        promise.then (function( ) {
                            $log.debug ('Marked as synced!', entry);
                            $rootScope.$broadcast ('JournalKeeper.markAsSynced', entry);
                        }, function(err) {
                            // FIXME: should we revert entry.synced back to
                            // false in case
                            // of failures in the update?
                            $log.error ('Failed to update journal entry', err);
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
                    return registered.then (function( ) {
                        var promise = storage.remove (entry);

                        promise.then (function( ) {
                            $rootScope.$broadcast ('JournalKeeper.remove', entry);
                        }, function(err) {
                            $log.error ('Failed to remove journal entry', err);
                        });

                        return promise;
                    });
                };

                /**
                 * Nukes the local storage - Use with extreme caution
                 *
                 * Use cases: - Unable to resync the database; - The database
                 * has been compromised.
                 *
                 * @return {Promise} The transaction promise
                 */
                this.nuke =
                    function( ) {

                        $log.debug('JournalService scheduling nuke');

                        return registered
                            .then (function( ) {

                                $log.debug('JournalService carrying nuke');

                                var promise = storage.nuke (entityName);

                                promise
                                    .then (
                                        function( ) {
                                            $rootScope.$broadcast ('JournalKeeper.nuke');
                                        },
                                        function(err) {
                                            $log
                                                .fatal ('Failed to nuke journal entries: PersistentStorage.nuke failed');
                                            $log.debug (
                                                'Failed to nuke: PersistentStorage.nuke failed',
                                                err);
                                        });

                                return promise;
                            });
                    };

                /**
                 * Resyncs the local in-memory data on the keepers based on the
                 * persisted
                 */
                this.resync =
                    function( ) {
                        $log.info('Resync started ...');

                        if(warmup.listener){
                            warmup.listener();
                            warmup.listener = null;
                        }

                        warmup.midway = $rootScope.$on('LocalWarmupDataSet', function () {
                            $log.info('warmup.midway fired ...');
                            warmup.fired = true;
                        });

                        return registered.then (function() {
                            var deferred = $q.defer ();
                            var promises = [];

                            // Clear the keepers!
                            $log.info('Nuking data ...');
                            Replayer.nukeKeepers();

                            var promise = storage.list (entityName);
                            var results = null;

                            promise

                            .then(function (entries) {
                                $log.info('Done listing entries.');
                                results = entries;
                            })

                            .then(function() {
                                $log.info('Inserting warmup data ...');
                                return insertWarmUpData ();
                            })

                            // Replays data from WebSQL into the app.
                            .then (function() {
                                $log.info ('Starting replay on ' + results.length + ' entries');

                                var entry = null;

                                try {
                                    for ( var ix in results) {
                                        entry = results[ix];

                                        sequence =
                                            sequence > entry.sequence ? sequence
                                                : entry.sequence + 1;

                                        if (entry.synced && entry.sequence > syncedSequence) {
                                            syncedSequence = entry.sequence;
                                        }

                                        promises.push (Replayer.replay (entry));
                                    }
                                } catch (err) {
                                    $timeout(function(){
                                        deferred.resolve(self.resync());
                                    }, 1000);

                                    $log.error ('Failed to resync: replay failed', err);
                                    $log.debug ('Failed to resync: replay failed -', err, entry);
                                }

                                $log.info ('waiting for ' + promises.length +
                                    ' promises to resolve');
                                deferred.resolve ($q.all (promises));
                            }, function(error) {
                                $log.error ('Failed to resync: list failed');
                                $log.debug ('Failed to resync: list failed', error);
                                deferred.reject (error);
                            });

                            return deferred.promise.then(function(resolution){
                                warmup.midway();

                                if(warmup.fired){
                                    $log.info('Firing self.resync ...');
                                    warmup.fired = false;
                                    return self.resync();
                                } else if(!warmup.listener){
                                    warmup.listener = $rootScope.$on('LocalWarmupDataSet', function () {
                                        $log.info('warmup.listener fired ...');
                                        self.resync();
                                    });
                                }

                                $log.info('Resync done!');
                                return resolution;
                            });
                        });
                    };

                /**
                 * Clears all data from both keepers and WebSQL.
                 */
                this.clear = function( ) {
                    Replayer.nukeKeepers ();
                    return this.nuke ().then (function( ) {
                        setSequence (1);
                        setSyncedSequence (0);
                    });
                };


                function _getWarmupData() {
                    var warmup = localStorage.getItem('warmup');
                    if (warmup) {
                        warmup = JSON.parse(warmup);
                        return warmup.data || [];
                    }

                    return [];
                }


                // Inserts warmup data into the app
                function insertWarmUpData( ) {
                    var deferred = $q.defer();

                    $log.debug('Replaying warmup data...');

                    $.get (
                        'resources/replay.json',
                        function(result) {
                            $log.debug('Replaying data from replay.json...');
                            for ( var ix in result) {
                                var data = result[ix];
                                var item =
                                    new JournalEntry (0, 0, data.type, data.version, data.event);
                                Replayer.replay (item);
                            }
                            deferred.resolve ();
                        });

                    return deferred.promise.then(function () {
                        var warmupData = _getWarmupData();

                        $log.debug('Replaying data from Firebase...');

                        for (var idx in warmupData) {
                            var data = warmupData[idx];
                            var item = new JournalEntry(0, 0, data.type, data.version, data.event);
                            Replayer.replay(item);
                        }

                        $log.debug('Warmup data replayed (' + warmupData.length + ' entries).');
                        // FIXME deprecate this in favor of WarmupDataReplayFinished
                        $rootScope.$broadcast('DataProvider.replayFinished');
                        $rootScope.$broadcast('WarmupDataReplayFinished');
                    });

                }

                function persistEntry(entry, tx, transacted) {

                    function doIt( ) {
                        var deferred = $q.defer ();

                        if (!(entry instanceof JournalEntry)) {
                            deferred.reject ('the given entry is not an instance of JournalEntry');
                        } else {
                            // FIXME: what happens if we persisted the entry and
                            // the replay
                            // fails? Should we remove the entry?

                            if (entry.synced) {
                                if (parseInt (entry.sequence) && entry.sequence >= sequence) {
                                    self.setSequence (entry.sequence + 1);
                                }
                            } else {
                                entry.sequence = self.getSequence ();
                                self.setSequence (sequence + 1);
                            }

                            storage.persist (entry, tx).then (
                                function( ) {
                                    try {
                                        deferred.resolve (Replayer.replay (entry));
                                    } catch (e) {
                                        $log.fatal ('Failed to replay: Replayer.replay failed', entry);
                                        $log.debug ('Failed to replay', e, entry);
                                        deferred.reject(e);
                                    }

                                    $rootScope.$broadcast ('JournalKeeper.persistEntry');
                                },
                                function(error) {
                                    $log.error (
                                        'Failed to compose: PersistentStorage.persist failed',
                                        error);
                                    deferred.reject (error);
                                });
                        }

                        return deferred.promise;
                    }

                    if(transacted){
                        return doIt();
                    } else {
                        return registered.then (doIt);
                    }
                }
            }]);

    angular.module ('tnt.catalog.journal', [
        'tnt.catalog.journal.entity', 'tnt.catalog.journal.keeper'
    ]);
}) (angular, ObjectUtils, jQuery);
