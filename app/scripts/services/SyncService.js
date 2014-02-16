(function(angular) {

    angular
        .module('tnt.catalog.sync.service', [
            'tnt.catalog.journal.keeper',
            'tnt.catalog.sync.driver'
        ])
        .service('SyncService', function SyncService(
            $q,
            $log,
            JournalKeeper,
            SyncDriver
        ) {

            // How many times should we attempt to sync an entry before
            // logging a fatal? Made public to allow changing this setting
            // when this makes sense (such as in tests).
            this.MAX_SYNC_ATTEMPTS = 5;

            var self = this;
            var syncDeferred = null;
            var synching = false;
            var syncDeferred = null;


            // Object used for storing attempt counts for failing
            // synchronizations.
            var SyncAttempt = {
              /**
               * Stores attempt counters for failed entries.
               * @type {Object}
               */
              attempts : {},

              /**
               * Increments the attempt counter for the given uuid.
               * @param {UUID} uuid Failed entry's uuid.
               * @return {Number} The new attempt count value.
               */
              increment : function (uuid) {
                  if (!this.attempts[uuid]) {
                      this.attempts[uuid] = 0;
                  }

                  return ++this.attempts[uuid];
              },

              /**
               * Clears the attempt counters. If no uuid is given, clears ALL
               * counters, otherwise, clears the counter only for the given
               * uuid.
               * @param {UUID?} uuid The para
               */
              clear : function (uuid) {
                  if (!uuid) {
                      this.attempts = {};
                  } else {
                      delete this.attempts[uuid];
                  }
              }
            };


            /**
             * Checks if a synchronization is in progress.
             * @return {Boolean} Whether there's a synchronization in progress
             */
            function isSynching() {
              return !!syncDeferred;
            }


            /**
             * Syncs unsynced entries from journal with the server.
             * @return {Promise}
             */
            function sync() {
                if (isSynching()) {
                  $log.debug('Synchronization already running!');
                  return syncDeferred;
                }

                syncDeferred = $q.defer();

                syncNext();

                // Remove the reference to the syncPromise once finished,
                // either with rejection or resolution
                function clearPromise() {
                    syncDeferred = null;
                    // Clear all attempt counters
                    SyncAttempt.clear();
                }

                syncDeferred.promise.then(clearPromise, clearPromise);

                return syncDeferred.promise;
            }



            /**
             * Handles the step of getting the oldest unsynced entry from the
             * journal during the synchronization process.
             *
             * Tries to get the oldes entry MAX_SYNC_ATTEMPTS times before
             * throwing a fatal error.
             *
             * @private
             */
            function syncReadOldestUnsynced() {
                var promise = JournalKeeper.readOldestUnsynced();

                promise.then(function (entry) {
                    if (!entry) {
                        // There are no more unsynced entries!
                        //
                        syncDeferred.resolve();
                    } else {
                        syncSaveEntry(entry);
                    }
                }, function (err) {
                    var counterId = 'syncReadOldestUnsynced';

                    if (SyncAttempt.increment(counterId) < self.MAX_SYNC_ATTEMPTS) {
                        // Oops! Failed to get unsynced entry! Try again!
                        // FIXME: should we add a timeout here? Maybe with a
                        // progressive interval?

                        // Oops! Failed to save! Try again!
                        $log.error('JournalKeeper.readOldestUnsynced() failed! Trying again.');
                        syncReadOldestUnsynced();
                    } else {
                        SyncAttempt.clear(counterId);
                        $log.fatal('JournalKeeper.readOldestUnsynced() failed! Giving up after ' + self.MAX_SYNC_ATTEMPTS + ' attempts!', err);
                        syncDeferred.reject(err);
                    }
                });
            }

            /**
             * Handles the step of saving the entry to the server during the
             * synchronization process.
             *
             * Will try to save it MAX_SYNC_ATTEMPTS before rising a fatal
             * error.
             *
             * @param {JournalEntry} entry Entry to be saved.
             *
             * @private
             */
            function syncSaveEntry(entry) {
                var promise = SyncDriver.save(entry);

                promise.then(function () {
                    syncMarkAsSynced(entry);
                }, function (err) {
                    // If err tells us that the sequence is already in
                    // use in the server, there's not point in continuing the
                    // synchronization process. Stop it, and handle the
                    // insertion of the new entry.
                  
                    // FIXME: check error message returned from the driver.
                    if (err === 'Duplicate entry sequence') {
                        
                        // FIXME: The sequence we tried to save to the server
                        // was already in use. The driver should handle this
                        // case and ensure we don't get to this point.
                        $log.fatal('Entry sequence conflict while running syncSaveEntry()!', entry);
                        syncDeferred.reject('Sync stopped to insert new entries from server.');

                        return;
                    }

                    var counterId = 'syncSaveEntry - ' + entry.uuid;

                    if (SyncAttempt.increment(counterId) < self.MAX_SYNC_ATTEMPTS) {
                        // FIXME: should we add a timeout here? Maybe with a
                        // progressive interval?

                        // Oops! Failed to save! Try again!
                        $log.error('SyncDriver.save() failed! Trying again.');
                        syncSaveEntry(entry);
                    } else {
                        SyncAttempt.clear(counterId);
                        $log.fatal('SyncDriver.save() failed! Giving up after ' + self.MAX_SYNC_ATTEMPTS + ' attempts!', entry, err);
                        syncDeferred.reject(err);
                    }
                });
            }


            /**
             * Handles the step of marking the entry as synced during the
             * synchronization process.
             *
             * If an error occurs during this step, a nuke and resync must
             * be triggered to ensure the device has the same state as the
             * server.
             *
             * @param {JournalEntry} entry Entry that has already been pushed
             *  to the server and needs to be marked as synced.
             *
             * @private
             */
            function syncMarkAsSynced(entry) {
                var promise = JournalKeeper.markAsSynced(entry);

                promise.then(function () {
                    // Everything went fine with this entry! Yay! Let's
                    // sync the next one!
                    $log.debug('Entry successfully synched!', entry);
                    syncNext();
                }, function (err) {
                    var counterId = 'syncMarkAsSynced - ' + entry.uuid;

                    // TODO: I've triple checked and it seems to be ok to try to mark
                    // an entry as synced again if we failed. Anyway, still need to
                    // check with @wesleyakio if this seems right.

                    if (SyncAttempt.increment(counterId) < self.MAX_SYNC_ATTEMPTS) {
                        // FIXME: should we add a timeout here? Maybe with a
                        // progressive interval?

                        // Oops! Failed to save! Try again!
                        $log.error('SyncDriver.save() failed! Trying again.');

                        syncMarkAsSynced(entry);
                    } else {
                        SyncAttempt.clear(counterId);
                        $log.fatal('SyncDriver.save() failed! Giving up after ' + self.MAX_SYNC_ATTEMPTS + ' attempts!', entry, err);

                        // TODO: Since we were unable to mark the entry as synced,
                        // we got into an inconsistent state!
                        // Can we nuke and resync now!? We need to lock the
                        // system before doing so and let the user know that
                        // it'll be unavailable for a while.
                        syncDeferred.reject(err);
                    }
                });
            }


            // syncReadOldestUnsynced starts the whole synchronization process
            // for the next unsynced entry. I'm creating an alias for it just
            // to make the code easier to read and the logic easier to follow.
            var syncNext = syncReadOldestUnsynced;



            /**
             * Returns the sequence number for the last synced entry from the
             * journal.
             * @return {Number}
             */
            function getLastSyncedSequence() {
                return JournalKeeper.getSyncedSequence();
            }

            /**
             * Inserts an entry received from the server into the journal.
             * @param {Object} entry The JournalEntry received from the server.
             * @return {Promise} The promise returned by the JournalKeeper.
             */
            function insert(entry) {
                if (!angular.isNumber(entry.sequence)) {
                    var msg = 'Received an invalid entry from the server!';
                    $log.fatal(msg, entry);
                    return $q.reject(msg);
                }

                if (entry.sequence <= JournalKeeper.getSequence()) {
                    var deferred = $q.defer();

                    JournalKeeper.findEntry(entry.uuid).then(function (journalEntry) {
                        journalEntry ?

                            // Entry is already in the journal, do nothing.
                            deferred.resolve() :

                            // We have a conflict! Resolve it!
                            deferred.resolve(resolveSequenceConflict(entry));
                    }, function (err) {
                        deferred.reject(err);
                    });

                    return deferred.promise;
                }

                return JournalKeeper.insert(entry);
            };



            /**
             * Where the unsynced entries will be stored during synchronization
             * conflict resolution.
             * @type {Array|null}
             */
            var stash = null;


            /**
             * Returns all entries in the stash.
             *
             * Note: This method is used mainly internally and was made public
             * to make it easier to test stashEntries() and unstashEntries().
             *
             * @return {Array} A shallow copy of the stash array.
             */
            function getStashedEntries() {
                return (stash && getStash().slice(0)) || [];
            };


            /**
             * Temporarily stores unsynced entries in memory while we sync
             * with the server.
             * @return {Promise}
             */
            function stashEntries() {
                var deferred = $q.defer();

                // FIXME: what should we do if stashEntries() is called while
                // there are entries in the stash? Should they be pushed?
                // Should the stash be cleared (probably not)? Should we
                // log it?
                var stash = getStash();
                var promise = JournalKeeper.readUnsynced();

                promise.then(function (entries) {
                    var promises = [];
                    var entry;

                    for (var idx in entries) {
                        entry = entries[idx];
                        stash.push(entry);
                        promises.push(JournalKeeper.remove(entry));
                    }

                    deferred.resolve($q.all(promises));
                }, function (err) {
                    deferred.reject('Failed to get unsynced entries!', err);
                });

                return deferred.promise;
            };


            /**
             * Re-compose stashed entries and queue them for synchronization.
             * @return {Promise}
             */
            function unstashEntries() {
                if (!stash) {
                    var deferred = $q.defer();
                    deferred.resolve(true);
                    // Instant-resolve if there's nothing to unstash
                    return deferred.promise;
                }

                var promises = [];

                for (var idx in stash) {
                  // FIXME: should we create a new entry without a sequence
                  // or just send the entry as is and let the keeper
                  // set the new sequence value?
                  promises.push(JournalKeeper.compose(stash[idx]));
                }

                clearStash();

                var result = $q.all(promises);


                // FIXME: should we call sync() once entries are re-composed?
                result.then(null, function (err) {
                    // FIXME: what should we do if re-composing fails?
                    $log.debug('Failed to re-compose entries during unstash process!', err);
                });

                return result;
            };


            function clearStash() {
                stash = null;
            }


            function getStash() {
                if (!stash) {
                    stash = [];
                }

                return stash;
            }


            /**
             * Runs the stash-insert-unstash process for resolving conflicting
             * sequence numbers between unsynced entries and entries received
             * from the server.
             *
             * @param {JournalEntry} entry The entry received from the server.
             * @return {Promise}
             */
            function resolveSequenceConflict(entry) {
                var deferred = $q.defer();

                // Stash unsynced entries
                var promise1 = self.stashEntries();

                promise1.then(function () {
                    // Insert entry in the journal
                    var promise2 = JournalKeeper.insert(entry);
                    promise2.then(function () {
                        deferred.resolve(self.unstashEntries());
                    }, function (err) {
                        deferred.reject('Failed to insert entry!', entry, err);
                    });
                }, function (err) {
                    deferred.reject('Failed to stash entries!', err);
                });

                return deferred.promise;
            };



            this.sync = sync;
            this.isSynching = isSynching;
            this.getLastSyncedSequence = getLastSyncedSequence;
            this.insert = insert;
            this.stashEntries = stashEntries;
            this.unstashEntries = unstashEntries;
            this.getStashedEntries = getStashedEntries;
        });
}(angular));
