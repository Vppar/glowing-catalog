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

            var self = this;

            /**
             * Syncs unsynced entries from journal with the server.
             * @return {Promise}
             */
            function sync() {
                var deferred = $q.defer();

                var promise1 = JournalKeeper.readUnsynced();

                promise1.then(function (unsyncedEntries) {
                    if (unsyncedEntries.length) {
                        var promise2 = SyncDriver.save(unsyncedEntries);

                        promise2.then(function (syncedEntries) {
                            var promises = [];

                            for (idx in syncedEntries) {
                                promises.push(JournalKeeper.markAsSynced(syncedEntries[idx]));
                            }

                            var promise3 = $q.all(promises);

                            deferred.resolve(promise3);

                            promise3.then(null, function (err) {
                                $log.error('Failed to mark entries as synced!', err);
                            });
                        }, function (err) {
                            $log.debug('Failed to sync entries!', err);
                            deferred.reject(err);
                        });
                    } else {
                        $log.debug('There are no unsynced entries in the JournalKeeper.');
                        deferred.resolve('There are no unsynced entries in the JournalKeeper.');
                    }
                }, function (err) {
                    $log.debug('Failed to get unsynced entries!', err);
                    deferred.reject(err);
                });

                return deferred.promise;
            };



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
                    return resolveSequenceConflict(entry);
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
            this.insert = insert;
            this.stashEntries = stashEntries;
            this.unstashEntries = unstashEntries;
            this.getStashedEntries = getStashedEntries;
        });
}(angular));
