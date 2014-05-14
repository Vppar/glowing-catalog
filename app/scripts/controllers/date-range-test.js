'use strict';

angular.module('glowingCatalogApp')
  .controller('DateRangeTestCtrl', function ($scope) {
      $scope.model = {
        start : new Date(),
        end : new Date()
      };

      var now = new Date();

      $scope.min = new Date();
      $scope.min.setMonth(now.getMonth() - 1);

      $scope.max = new Date();
      $scope.max.setMonth(now.getMonth() + 1);
  });
