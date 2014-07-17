(function(angular) {
    'use strict';

    angular.module('tnt.catalog.bookkeeping.report.ctrl', [
        'tnt.catalog.filters.uuidCode'
    ]).controller('BookKeepingReportCtrl', ['$scope', '$log', 'BookService', 'UserService', function($scope, $log, BookService, UserService) {

        UserService.redirectIfInvalidUser();

        var bookEntries = BookService.listEntries();

        for ( var ix in bookEntries) {
            var bookEntry = bookEntries[ix];
            if (bookEntry.document) {
                bookEntry.document.created = bookEntry.created;
            }
        }
        $scope.bookEntries = bookEntries;

    }]);
}(angular));
