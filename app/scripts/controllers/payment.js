'use strict';

angular.module('glowingCatalogApp').controller('PaymentCtrl', function($scope, $dialog) {
   $scope.openDialogCheck = function() {
		var d = $dialog.dialog ({ backdropClick: true,
			dialogClass: 'modal'
		});
		d.open('views/payment-check-dialog.html', 'PaymentCheckDialogCtrl');
	};
	$scope.openDialogCard = function() {
		var d = $dialog.dialog ({ backdropClick: true,
			dialogClass: 'modal'
		});
		d.open('views/payment-credit-card-dialog.html', 'PaymentCreditCardDialogCtrl');
	}
});
