'use strict';

angular.module('glowingCatalogApp').controller('PartialDeliveryCtrl', function($scope, $dialog) {

	$scope.openDeliveryDetails = function() {
		var d = $dialog.dialog({
			backdropClick : true,
			dialogClass : 'modal'
		});
		d.open('views/parts/partial-delivery/delivery-details-dialog.html', 'DeliveryDetailsDialogCtrl');
	};

});
