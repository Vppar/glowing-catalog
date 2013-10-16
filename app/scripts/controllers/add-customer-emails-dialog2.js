'use strict';

angular.module('glowingCatalogApp').controller('AddCustomerEmailsDialogCtrl', function($scope, dialog) {

    $scope.closeDialog = function() {
        dialog.close();
    };
});

/**
 * EmailsList controller
 * 
 * Controls e-mails list
 * 
 * @author Fillipe Montenegro
 * 
 */
function EmailsList($scope) {

    /**
     * @var emails - stores e-mails list
     */
    $scope.emails = [];

    /**
     * Verifies if entered e-mail already exists in the $scope.emails array and
     * if not, adds e-mail to the last position of $scope.emails array
     */
    $scope.addEmail = function() {
        var existingEmail = false;

        if ($scope.email) {
            for ( var i = 0; i < $scope.emails.length; i++) {
                if ($scope.email == $scope.emails[i]) {
                    existingEmail = true;
                }
            }

            if (existingEmail === false) {
                $scope.emails.push($scope.email);
            }
        }
    };

    /**
     * Removes selected e-mail from $scope.emails array
     * 
     * @param email - e-mail to be removed
     */
    $scope.removeEmail = function(email) {
        var index = $scope.emails.indexOf(email);
        $scope.emails.splice(index, 1);
    };

    /**
     * Moves up selected e-mail in $scope.emails array
     * 
     * @param email - e-mail to be moved
     */
    $scope.moveEmailUp = function(email) {
        var index = $scope.emails.indexOf(email);
        if (index > 0) {
            var email = $scope.emails[index];
            $scope.emails.splice(index, 1);
            $scope.emails.splice(index - 1, 0, email);
        }
    };

    /**
     * Moves down selected e-mail in $scope.emails array
     * 
     * @param email - e-mail to be moved
     */
    $scope.moveEmailDown = function(email) {
        var index = $scope.emails.indexOf(email);
        if (index < $scope.emails.length) {
            var email = $scope.emails[index];
            $scope.emails.splice(index, 1);
            $scope.emails.splice(index + 1, 0, email);
        }
    };
}
