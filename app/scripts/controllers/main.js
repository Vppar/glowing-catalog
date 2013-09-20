'use strict';

angular.module('glowingCatalogApp').controller('MainCtrl', function($scope, $dialog, $location) {
   $scope.awesomeThings = [
        'HTML5 Boilerplate', 'AngularJS', 'Karma'
    ];
    $scope.openDialogAddToBasket = function() {
		var d = $dialog.dialog ({ backdropClick: true,
			dialogClass: 'modal'
		});
		d.open('views/add-to-basket-dialog.html', 'AddToBasketDialogCtrl');
	}
	$scope.openDialogEditPass = function() {
		var d = $dialog.dialog ({ backdropClick: true,
			dialogClass: 'modal'
		});
		d.open('views/edit-pass-dialog.html', 'EditPassDialogCtrl');
	}
	$scope.goToBasket = function() {
		$location.path('basket');
	}
});
