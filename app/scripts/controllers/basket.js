'use strict';

angular.module('glowingCatalogApp').controller('BasketCtrl', function($scope, $dialog) {
   $scope.openDialogEditPass = function() {
		var d = $dialog.dialog ({ backdropClick: true,
			dialogClass: 'modal'
		});
		d.open('views/edit-pass-dialog.html', 'EditPassDialogCtrl');
	}
});
