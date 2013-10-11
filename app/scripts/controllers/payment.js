'use strict';

angular.module('glowingCatalogApp').controller('PaymentCtrl', function($scope, $dialog, $location) {
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
	};
	$scope.openDialogProductExchange = function() {
		var d = $dialog.dialog ({ backdropClick: true,
			dialogClass: 'modal'
		});
		d.open('views/product-exchange-dialog.html', 'PaymentProductExchangeDialogCtrl');
	};
	 $scope.openDialogEditPass = function() {
		var d = $dialog.dialog ({ backdropClick: true,
			dialogClass: 'modal'
		});
		d.open('views/edit-pass-dialog.html', 'EditPassDialogCtrl');
	};
	$scope.goToBasket = function() {
		$location.path('basket');
	};
	$scope.openDialogChooseCustomer = function() {
		var d = $dialog.dialog ({ backdropClick: true,
			dialogClass: 'modal'
		});
		d.open('views/choose-customer-dialog.html', 'ChooseCustomerDialogCtrl');
	}
	
	$scope.cash = 12.98;
});
