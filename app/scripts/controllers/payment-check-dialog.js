'use strict';

angular.module('glowingCatalogApp').controller('PaymentCheckDialogCtrl', function($scope, dialog) {


	$scope.closeDialog = function(){
		dialog.close();
	}
	

});
