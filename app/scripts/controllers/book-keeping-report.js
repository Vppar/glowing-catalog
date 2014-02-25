(function(angular) {
    'use strict';

    angular.module('tnt.catalog.bookkeeping.report.ctrl', [
        'tnt.catalog.filters.uuidCode'
    ]).controller('BookKeepingReportCtrl', function($scope, $log, BookService, UserService) {

        UserService.redirectIfIsNotLoggedIn();

        var bookEntries = BookService.listEntries();

        for ( var ix in bookEntries) {
            var bookEntry = bookEntries[ix];
            if (bookEntry.document) {
                bookEntry.document.created = bookEntry.created;
            }
        }
        $scope.bookEntries = bookEntries;

    });
}(angular));
