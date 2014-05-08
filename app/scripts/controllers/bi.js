'use strict';

angular
    .module('tnt.catalog.bi.ctrl', [
      'tnt.catalog.sync.driver'
    ])
    .controller('BiCtrl', ['$scope', 'SyncDriver', function ($scope, SyncDriver) {

      var biRef = SyncDriver.refs.bi;

      var nullData = {
        gauge : null,
        histogram : null,
        termometer : null,
        cumulative : null
      };

      var data = {};

      // Set some default values to prevent things to get messy if there's no
      // BI data for the given user.
      angular.extend(data, nullData);


      biRef.on('value', function (snapshot) {
        if (snapshot) {
          var val = snapshot.val();

          data.gauge = val.gauge || nullData.gauge;
          data.histogram = val.histogram || nullData.histogram;
          data.termometer = val.termometer || nullData.termometer;
          data.cumulative = val.cumulative || nullData.cumulative;
        }
      });


      // Expose the data to the view
      $scope.data = data;
    }]);
