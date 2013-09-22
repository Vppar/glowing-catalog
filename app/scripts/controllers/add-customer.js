'use strict';

angular.module('glowingCatalogApp').controller('AddCustomerCtrl', function($scope,  $dialog) {
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
	}
});
