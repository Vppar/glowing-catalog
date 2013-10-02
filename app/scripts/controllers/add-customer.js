'use strict';

angular.module('glowingCatalogApp').controller('AddCustomerCtrl', function($scope,  $dialog, $location) {
   $scope.openDialogAddCustomerTels = function() {
		var d = $dialog.dialog ({ backdropClick: true,
			dialogClass: 'modal'
		});
		d.open('views/add-customer-tels-dialog.html', 'AddCustomerTelsDialogCtrl');
	};
	$scope.openDialogAddCustomerEmails = function() {
		var d = $dialog.dialog ({ backdropClick: true,
			dialogClass: 'modal'
		});
		d.open('views/add-customer-emails-dialog.html', 'AddCustomerEmailsDialogCtrl');
	};
	$scope.openDialogEditPass = function() {
		var d = $dialog.dialog ({ backdropClick: true,
			dialogClass: 'modal'
		});
		d.open('views/edit-pass-dialog.html', 'EditPassDialogCtrl');
	};
	$scope.goToBasket = function() {
		$location.path('basket');
	}
});
