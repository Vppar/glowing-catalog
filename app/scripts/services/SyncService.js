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


        });
}(angular));
