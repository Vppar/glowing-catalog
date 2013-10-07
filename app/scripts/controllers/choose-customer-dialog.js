'use strict';

angular.module('glowingCatalogApp').controller('ChooseCustomerDialogCtrl', function($scope, dialog, $location) {


	$scope.closeDialog = function(){
		dialog.close();
	}
	$scope.goToAddCustomer = function() {
		$location.path('add-customer');
		dialog.close();
	}
	

});
