(function(angular) {
    'use strict';

    angular.module('tnt.catalog.bookkeeping.report.ctrl', []).controller('BookKeepingReportCtrl', function($scope, $log, BookService) {

        $scope.books = BookService.list();
    });
}(angular));
