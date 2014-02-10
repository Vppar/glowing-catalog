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

              var unsyncedPromise;
              var driverSyncPromise;
              var markAsSyncedPromises = [];
              
              unsyncedPromise = JournalKeeper.getUnsynced();

              unsyncedPromise.then(function (unsyncedEntries) {
                  if (unsyncedEntries.length) {
                      driverSyncPromise = driver.sync(unsyncedEntries);

                      driverSyncPromise.then(function (syncedEntries) {
                          for (idx in syncedEntries) {
                              markAsSyncedPromises.push(JournalKeeper.markAsSynced(syncedEntries[idx]));
                          }

                          deferred.resolve($q.all(markAsSyncedPromises));
                      }, function (err) {
                          $log.debug('Failed to sync entries!', err);
                          deferred.reject(err);
                      });
                  }
              }, function (err) {
                  $log.debug('Failed to get unsynced entries!', err);
                  deferred.reject(err);
              });
            };


        });
}(angular));
