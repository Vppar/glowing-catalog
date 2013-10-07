'use strict';

angular.module('glowingCatalogApp').controller('AddToBasketDialogCtrl', function($scope, dialog) {


	$scope.closeDialog = function(){
		dialog.close();
	}
	

});
