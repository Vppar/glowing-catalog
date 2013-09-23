'use strict';

angular.module('glowingCatalogApp').controller('PaymentCreditCardDialogCtrl', function($scope, dialog) {


	$scope.closeDialog = function(){
		dialog.close();
	}
	

});
