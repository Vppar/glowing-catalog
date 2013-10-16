'use strict';

angular.module('glowingCatalogApp').controller('MainCtrl', function($scope, $dialog, $location) {

    $scope.openDialogAddToBasket = function(id) {
		var d = $dialog.dialog ({ backdropClick: true,
			dialogClass: 'modal'
		});
		d.id = id;
		d.open('views/add-to-basket-dialog.html', 'AddToBasketDialogCtrl');
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
	};
	$scope.openInputProducts = function() {
		var d = $dialog.dialog ({ backdropClick: true,
			dialogClass: 'modal'
		});
		d.open('views/input-products-dialog.html', 'InputProductsCtrl');
	};

});
