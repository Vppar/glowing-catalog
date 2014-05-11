(function(angular) {
    'use strict';

    angular.module('tnt.catalog.bi.ctrl', [
        'tnt.catalog.sync.driver'
    ]).controller('BiCtrl', [
        '$scope', '$log', 'SyncDriver', 'UserService', function($scope, $log, SyncDriver, UserService) {

            UserService.redirectIfIsNotLoggedIn();

            $log.info('Initializing BICtrl...');

            var biRef = SyncDriver.refs.bi;

            var nullData = {
                gauge : {
                    goal : 1,
                    snapshot : 0,
                    percent : 0
                },

                histogram : {
                    bands : []
                },

                termometer : {
                    goal : 1,
                    snapshot : 0,
                    percent : 0
                },

                cumulative : {
                    bands : []
                }
            };

            var data = {};

            // Set some default values to prevent things to get messy if there's
            // no
            // BI data for the given user.
            angular.extend(data, nullData);

            // This 'if' avoids the need to signin before every test (should
            // happen only
            // during development)
            if (biRef) {
                biRef.on('value', function(snapshot) {
                    if (snapshot) {
                        var val = snapshot.val();

                        $log.debug('BI data received...', val);

                        data.gauge = val.gauge || nullData.gauge;
                        data.histogram = val.histogram || nullData.histogram;
                        data.termometer = val.termometer || nullData.termometer;
                        data.cumulative = val.cumulative || nullData.cumulative;
                    }
                });
            }

            // Expose the data to the view
            $scope.data = data;
        }
    ]);
})(angular);