'use strict';

angular.module('glowingCatalogApp')
  .controller('DateRangeTestCtrl', function ($scope) {
      $scope.model = {
        start : new Date(),
        end : new Date()
      };

      var now = new Date();

      $scope.undefinedTest = {
        model : {
          start : null,
          end : null
        }
      };


      var functionTest = $scope.functionTest = {
        model : {},
        min : function () {
          functionTest.min.date.setDate(functionTest.min.date.getDate() - 1);
          return functionTest.min.date;
        },

        max : function () {
          functionTest.max.date.setDate(functionTest.max.date.getDate() + 1);
          return functionTest.max.date;
        }
      };

      functionTest.min.date = new Date(now.getTime() - 24 * 60 * 60 * 1000); // yesterday
      functionTest.max.date = new Date(now.getTime() + 24 * 60 * 60 * 1000); // tomorrow


      $scope.nowTest = {
        model : {},
        min : 'now',
        max : 'now'
      };


      $scope.dateTest = {
        model : {},
        min : now,
        max : now
      };


      $scope.isoTest = {
        model : {},
        min : '2014-05-03',
        max : '2014-05-10'
      };


      $scope.timestampTest = {
        model : {},
        min : now.getTime() - 24 * 60 * 60 * 1000, // yesterday
        max : now.getTime() + 24 * 60 * 60 * 1000  // tomorrow
      };


      $scope.laterMinTest = {
        model : {},
        min : now.getTime() + 24 * 60 * 60 * 1000, // tomorrow
        max : now.getTime() - 24 * 60 * 60 * 1000  // yesterday
      };


  });
