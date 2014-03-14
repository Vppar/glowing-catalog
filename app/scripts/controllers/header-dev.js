(function(angular) {
    'use strict';

    angular.module('tnt.catalog.headerDev', []).controller('DevelopmentHeaderCtrl', ['$log', '$scope', 'DataProvider', 'JournalKeeper', function($log, $scope, DataProvider, JournalKeeper) {
        // ###################################
        // Development functions
        // ###################################
        // TODO: remove this from production
        //

        $scope.nukeData = function() {
            JournalKeeper.nuke();
            $log.debug('All persisted data has been nuked! Everything will be gone on next reload!');
        };

        $scope.removeDeviceId = function() {
            localStorage.removeItem('deviceId');
        };
    }]);
})(angular);
