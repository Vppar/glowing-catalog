'use strict';

angular.module('glowingCatalogApp').controller('PaymentAdvanceMoneyDialogCtrl', function($scope, dialog) {


	$scope.closeDialog = function(){
		dialog.close();
	}
	

});
