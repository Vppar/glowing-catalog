'use strict';

angular.module('glowingCatalogApp').controller('EditPassDialogCtrl', function($scope, dialog) {
 	$scope.closeDialog = function(){
		dialog.close();
	}
	
});
