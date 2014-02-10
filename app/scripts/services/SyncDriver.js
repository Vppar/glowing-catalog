(function(angular) {

    angular
        .module('tnt.catalog.sync.driver', [])
        .service('SyncDriver', function SyncService($log, $q) {
            
            // FIXME: this is a mock! You could also call this
            // "flipCoin()", as all it does is "randomly" return
            // true or false.
            function hasSucceeded() {
                return Math.floor(Math.random() * 2);
            }


            this.sync = function (entries) {
                var deferred = $q.defer();

                hasSucceded() ?
                    deferred.resolve(entries) :
                    deferred.reject('Failed to sync entries!');

                return deferred.promise;
            };
        });
}(angular));
