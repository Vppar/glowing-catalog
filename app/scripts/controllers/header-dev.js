(function(angular) {
    'use strict';

    angular.module('tnt.catalog.headerDev', []).controller('DevelopmentHeaderCtrl', function($log, $scope, DataProvider, JournalKeeper) {
        // ###################################
        // Development functions
        // ###################################
        // TODO: remove this from production
        //
        var
          gopay = DataProvider.gopay,
          envFlags = DataProvider.envFlags;

        $scope.gopay = gopay;
        $scope.envFlags = envFlags;

        /**
         * Toggles the 'merchant' attribute in the scope.
         */
        var _originalMerchant; // holds merchant's original value
        $scope.toggleMerchant = function () {
            if (gopay.merchant) { _originalMerchant = gopay.merchant; }
            gopay.merchant = gopay.merchant ? false : _originalMerchant;
        };

        /**
         * Toggles the 'internet' attribte in the scope.
         */
        $scope.toggleInternetConnectivity = function () {
          envFlags.internet = !envFlags.internet;
        };

        $scope.nukeData = function () {
            JournalKeeper.nuke();
            $log.debug('All persisted data has been nuked! Everything will be gone on next reload!');
        };
    });
})(angular);

