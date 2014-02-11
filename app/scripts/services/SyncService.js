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

            /**
             * Syncs unsynced entries from journal with the server.
             * @return {Promise}
             */
            this.sync = function () {
                var deferred = $q.defer();

                var promise1 = JournalKeeper.readUnsynced();

                promise1.then(function (unsyncedEntries) {
                    if (unsyncedEntries.length) {
                        
                        var promise2 = SyncDriver.sync(unsyncedEntries);

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
            this.insert = function (entry) {
                if (!angular.isNumber(entry.sequence)) {
                    var msg = 'Received an invalid entry from the server!';
                    $log.fatal(msg, entry);
                    return $q.reject(msg);
                }

                if (entry.sequence <= JournalKeeper.getSequence()) {
                    // FIXME: should we check if the new entry is already in
                    // the journal? If objects are equivalent, there's no point
                    // in rising an error. This might happen when the device
                    // receives its own entries.
                    //
                    // FIXME: we need to resync entries!
                    var msg = 'Sequence conflict!';
                    $log.error(msg, entry);
                    return $q.reject(msg);
                }

                return JournalKeeper.insert(entry);
            };

        });
}(angular));
