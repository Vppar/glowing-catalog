'use strict';

angular.module('glowingCatalogApp').controller('AddCustomerTelsDialogCtrl', function($scope, dialog) {


	$scope.closeDialog = function(){
		dialog.close();
	}
	

});

/**
 * PhoneListCtrl controller
 * 
 * Controls phone list
 * 
 * @author Fillipe Montenegro
 * 
 */
function PhoneListCtrl($scope) {

    /**
     * @var phoneList - stores phone list
     */
    $scope.phoneList = [{type:'Celular', number:'(41)90909090'},{type:'Residencial', number:'(41)80808080'}];

    /**
     * Verifies if entered phone already exists in the $scope.phoneList array and
     * if not, adds the phont to the last position of $scope.phoneList array
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
     * Moves up selected phone in $scope.phoneList array
     * 
     * @param phone - phone to be moved
     */
    $scope.movePhoneUp = function(phone) {
        var index = $scope.phoneList.indexOf(phone);
        if (index > 0) {
            var phone = $scope.phoneList[index];
            $scope.phoneList.splice(index, 1);
            $scope.phoneList.splice(index - 1, 0, phone);
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