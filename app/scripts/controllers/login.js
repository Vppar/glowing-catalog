'use strict';

angular.module('glowingCatalogApp').controller('LoginCtrl', function($scope, $location) {
    $scope.gotoMain = function() {
		$location.path('/');
	}
});
